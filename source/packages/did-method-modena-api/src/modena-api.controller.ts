
import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './modena-api.service';
import { DebugDto } from './dto/DebugDto';
import { validateSidetreeResponse } from './utils/SidetreeCoreResponse'
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Get("/")
  async debug(): Promise<DebugDto> {
    return await this.appService.debug();
  }


  @Get("/health")
  async healthcheck(@Res() res: Response) {
    let status = this.appService.healthcheckRead() && this.appService.healthcheckWrite();
    if (status)
      res.status(HttpStatus.OK).send()
    else
      res.status(HttpStatus.I_AM_A_TEAPOT).send();
  }

  @Get("/health/write")
  async writeHealthcheck(@Res() res: Response) {
    let status = this.appService.healthcheckWrite();
    if (status)
      res.status(HttpStatus.OK).send()
    else
      res.status(HttpStatus.I_AM_A_TEAPOT).send();
  }


  @Get("/health/read")
  async readHealthcheck(@Res() res: Response) {
    let status = this.appService.healthcheckRead();
    if (status)
      res.status(HttpStatus.OK).send()
    else
      res.status(HttpStatus.I_AM_A_TEAPOT).send();
  }




  @Post('create')
  async createDID(@Body() request) {
    return await this.appService.createDID(request);
  }
  @Post('operations')
  async operations(@Body() request) {
    return await this.appService.createDID(request);
  }


  @Get("resolve/:did")
  async get(@Param("did") did: string, @Query('long') long: boolean) {
    if (long === true)
      return await this.appService.getLongDID(did);
    return await this.appService.getDID(did);
  }


  @Get("/health/ready")
  async firstPullReady(@Param("did") did: string) {

    const a = this.appService.getPullCount();
    if (a == 0)
      throw new InternalServerErrorException();

  }

  @Get("1.0/identifiers/:did")
  async getDid(@Param("did") did: string) {

    if (!this.appService.validateIdentifier(did))
      throw new BadRequestException("Did not formulated correctly")

    const resolvedDid = await this.appService.resolveDID(did);

    validateSidetreeResponse(resolvedDid);

    return resolvedDid.body;

  }

}
