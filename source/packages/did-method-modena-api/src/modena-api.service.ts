import { Injectable } from '@nestjs/common';
import { Modena, getNodeInstance, ModenaNodeConfigs } from '@extrimian-sidetree/did-method-modena';
import { ModenaConfig } from './enviroments/config'
import CachedEventEmitter from './state/CachedEventEmitter'
import { DebugDto } from './dto/DebugDto';
import { EventCode } from './state/EventCode';
import EventStatus from './state/EventStatus';
import { Encoder, JsonCanonicalizer } from '@extrimian-sidetree/common';
const base64regex = /^[0-9a-zA-Z+_-]*$/;

@Injectable()
export class AppService {

  modenaNodeConfings: ModenaNodeConfigs;
  modenaCore: Modena;
  eventEmitter: CachedEventEmitter;
  constructor() {
    process.env.UV_THREADPOOL_SIZE = "240000";
    this.init();
  }

  async debug(): Promise<DebugDto> {
    const status = Array.from(this.eventEmitter.events.values());
    return {
      ledger_type: this.modenaNodeConfings.ledgerType,
      intervals: {
        write: this.modenaNodeConfings.batchingIntervalInSeconds,
        read: this.modenaNodeConfings.observingIntervalInSeconds
      },
      blockchain_time: {
        starting: this.modenaNodeConfings.versions[0]?.startingBlockchainTime,
        cached: this.eventEmitter.events.get(EventCode.SidetreeBlockchainTimeChanged)?.data?.time
      },
      event_status: status,
    }
  }


  healthcheckRead(): boolean {
    const failed = this.eventEmitter.events.get(EventCode.SidetreeBatchWriterLoopFailure)
    const success = this.eventEmitter.events.get(EventCode.SidetreeBatchWriterLoopSuccess)
    return this.healthcheck(this.modenaNodeConfings.observingIntervalInSeconds * 5, failed, success)
  }



  healthcheckWrite(): boolean {
    const failed = this.eventEmitter.events.get(EventCode.SidetreeBatchWriterLoopFailure)
    const success = this.eventEmitter.events.get(EventCode.SidetreeBatchWriterLoopSuccess)
    return this.healthcheck(this.modenaNodeConfings.batchingIntervalInSeconds * 4, failed, success)
  }

  private healthcheck(threshold: number, failed?: EventStatus, success?: EventStatus) {
    let now = new Date().getTime() / 1000;
    //si hay fail y no hay success -> error
    if (failed && failed.latest)
      if (!success || !success.latest)
        return false;

    let state = true;
    //si hay ambos comparo
    if (failed && success) {
      //si el latest de failed paso despues entonces returneo false
      if (failed.latest) {
        if (failed.latest > success.latest) {
          state = false;
        }
      }
      let latestTime = success.latest.getTime() / 1000;
      //si el ultimo sucess paso hace mucho returneo true
      if (now - latestTime > threshold) {
        state = false
      }
      return state;
    }
    //si no hay nada returneo true
    return true;
  }
  async init(): Promise<string> {
    this.eventEmitter = new CachedEventEmitter();
    this.modenaNodeConfings = new ModenaConfig();
    console.log("Modena configs:")
    printAll(this.modenaNodeConfings)
    this.modenaCore = await getNodeInstance(this.modenaNodeConfings, this.eventEmitter);
    return 'Hello World!';
  }

  async createDID(request) {
    console.log(request);
    const value = JSON.stringify(request);
    const operation0 = await this.modenaCore.handleOperationRequest(Buffer.from(value));

    console.log(operation0);

    return operation0.body;
  }
  async getLongDID(uniqueSuffix) {
    const did = `did:${this.modenaNodeConfings.didMethodName}:${uniqueSuffix}`;
    const operation1 = await this.modenaCore.handleResolveRequest(did);
    if (!operation1.body?.didDocument)
      return 'Did not Found';
    const encodedBody = Encoder.encode(
      JsonCanonicalizer.canonicalizeAsBuffer(operation1.body?.didDocument)
    );
    return did + ":" + encodedBody;

  }
  async getDID(uniqueSuffix) {
    const did = `did:${this.modenaNodeConfings.didMethodName}:${uniqueSuffix}`;
    const operation1 = await this.modenaCore.handleResolveRequest(did);
    return operation1.body.didDocument || 'Did not Found';
  }

  getPullCount() {
    let events = this.eventEmitter.events.get('sidetree_observer_loop_success');
    if (!events)
      return 0;
    return events.count;
  }


  async resolveDID(did) {
    const operation1 = await this.modenaCore.handleResolveRequest(did);

    return operation1;
  }

  validateIdentifier(did: string): boolean {

    console.log("validating did:")
    console.log(did);
    did = did.replace("did:" + this.modenaNodeConfings.didMethodName + ":", "");
    const parts = did.split(":");
    console.log(parts);

    if (parts.length == 1)
      return base64regex.test(parts[0]);
    else if (parts.length == 2)
      return base64regex.test(parts[0]) && base64regex.test(parts[1]);
    return false;
  }
}

function printAll(conf: ModenaNodeConfigs) {
  console.log("modena config")
  console.log(`method name: ${conf.didMethodName}`)
  console.log(`CAS URI: ${conf.contentAddressableStoreServiceUri}`)
  console.log(`Db name: ${conf.databaseName}`)
  console.log(`ETH RCP: ${conf.rpcUrl}`)
  console.log(`MongoDB: ${conf.mongoDbConnectionString}`)

  // Object.keys(conf.walletProviderConfigs).forEach(key =>
  //   [
  //     console.log(`${key}: ${conf.walletProviderConfigs[key]})`)
  //   ])
}