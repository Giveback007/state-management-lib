import { iterate, wait } from "@giveback007/util-lib";

'use-strict';

export class State<T extends ({}| any[])> {
    get state() { return this._state; }

    private _state: T;
    private functs: Array<(obj: T) => any> = [];
    private emitStarted = false;
    private emitIndex = -1;
    private lastIndexNeedUpdate = -1;

    /** subscription method */
    sub(funct: (obj: T) => any) {
        const idx = this.functs.length;
        this.functs[idx] = funct;
        return { unsub: () => delete this.functs[idx] };
    }
    
    /** Fires all of the subscriptions once all async code ran */
    private async startEmit() {
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
                this.functs[i](this._state);
                this.emitIndex = i;
            });
        } while (this.lastIndexNeedUpdate !== -1)

        this.emitIndex = -1;
        this.emitStarted = false;

        return true;
    }
}
