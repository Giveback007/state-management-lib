import { typeOf, wait, iterate } from "./general.util";
import { anyObj, dictionary } from "./general.types";

class StateObject<T extends ({}| any[])> {
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
            // console.log('stuff')
        } while (this.lastIndexNeedUpdate !== -1)

        this.emitIndex = -1;
        this.emitStarted = false;

        return true;
    }
}

// Test setting, mutating and deleting of nested values
const stateObjHandler = <T extends ({} | any[])>(stateObj: StateObject<T>): ProxyHandler<any> => 
({
    set: (target, key, value) => {
        // Recursive proxy handler
        if ((typeOf((value), 'array') || typeOf(value, 'object')) && !value.__isStateObject) {
            value = new Proxy(value, stateObjHandler(stateObj));
            Object.keys(value).forEach((key) => value[key] = value[key]);
        }

        target[key] = value;
        (stateObj as any).startEmit();
        return true
    },
    deleteProperty: (target, key) => {
        delete target[key];
        (stateObj as any).startEmit();
        return true;
    },
})

export function makeStateObject<T extends anyObj>(obj: T): StateObject<T> {
    if (obj.key === "__isStateObject")
        throw console.error(obj, 'is already a state object');

    const s = new StateObject<T>();
    (s as any)._state = new Proxy(obj, stateObjHandler(s));
    
    for (let key in s.state) s.state[key] = s.state[key];

    return s;
}
