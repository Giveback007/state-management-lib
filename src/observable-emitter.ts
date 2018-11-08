import { wait, iterate } from "@giveback007/util-lib";
import { observableProxy } from "./proxy-handler";

'use-strict';

export class ObservableEmitter<T extends ({} | any[])> {
    
    obj: T;
    functs: ((obj: T) => any)[] = [];

    private emitStarted = false;
    private emitIndex = -1;
    private lastIndexNeedUpdate = -1;

    constructor(obj: T) {
        this.obj = observableProxy(obj, this.startEmit);
    }

    /** Fires subscribed functions once all sync code runs */
    async startEmit() {
        if (this.emitStarted)
            return this.lastIndexNeedUpdate = this.emitIndex;
            
        this.emitIndex = -1;
        this.lastIndexNeedUpdate = -1;
        this.emitStarted = true;

        // Force async
        await wait(0);

        // This ensures that every functions has a chance to run
        // on the latest changes of the state object
        do  {
            const nTimes = this.lastIndexNeedUpdate === -1 ? 
                this.functs.length : this.lastIndexNeedUpdate + 1;
                
            this.lastIndexNeedUpdate = -1
            iterate(nTimes).for((i) => {
                this.functs[i](this.obj);
                this.emitIndex = i;
            });
        } while (this.lastIndexNeedUpdate !== -1)

        this.emitIndex = -1;
        this.emitStarted = false;

        return true;
    }
}
