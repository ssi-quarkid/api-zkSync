import EventStatus from "src/state/EventStatus";

export type DebugDto = {
    chain?: string;
    ledger_type: string;
    intervals: { write: number, read: number };
    blockchain_time: { starting: number, cached?: number };
    event_status: EventStatus[];
}