
import { LogColor, Logger } from "@extrimian-sidetree/common";

export class ErrorLogger {
    private shouldLog: boolean = true;
    private interval: number;
    constructor(interval: number) {
        this.interval = interval;
    }
    public log(message: string): void {
        if (!this.shouldLog)
            return;
        Logger.info(LogColor.red(message));
        this.shouldLog = false;
        setTimeout(() => this.shouldLog = true, 1000 * this.interval);
    }
}
