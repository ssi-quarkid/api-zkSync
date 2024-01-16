export default class EventStatus {

    constructor(public code: string, public count: number, public latest?: Date, public data?: any) {
    }


    public eventRegistered(data?: any) {
        this.count = this.count + 1;
        this.latest = new Date();
        this.data = data;
    }

}