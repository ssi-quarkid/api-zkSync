import { IEventEmitter, Logger, LogColor } from "@extrimian-sidetree/common";
import EventStatus from "./EventStatus";
import { EventCode } from "./EventCode";
export default class CachedEventEmitter implements IEventEmitter {

    public events: Map<string, EventStatus> = new Map();
    /**
   * Emits an event.
   */
    constructor() {
        Object.values(EventCode).forEach(
            x => this.events.set(x, new EventStatus(x, 0, null))
        )
    }
    
    public async emit(
        eventCode: string,
        eventData?: { [property: string]: any }
    ): Promise<void> {
        let time = new Date();
        if (this.events.has(eventCode))
            this.events.get(eventCode).eventRegistered(eventData);
        else
            this.events.set(eventCode, new EventStatus(eventCode, 1, time, eventData));

        // Always log the event using the logger.
        if (eventData === undefined) {
            Logger.info(
                LogColor.lightBlue(`[${time.toISOString()}] Event emitted: ${LogColor.green(eventCode)}`)
            );
        } else {
            Logger.info(
                LogColor.lightBlue(
                    `[${time.toISOString()}] Event emitted: ${LogColor.green(eventCode)}: ${JSON.stringify(
                        eventData
                    )}`
                )
            );
        }
    }

}