import { typeOf, wait, iterate, isObjOrArr } from "./general.util";
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
        } while (this.lastIndexNeedUpdate !== -1)

        this.emitIndex = -1;
        this.emitStarted = false;

        return true;
    }
}

// Test setting, mutating and deleting of nested values
const stateObjHandler = <T extends ({} | any[])>(stateObj: StateObject<T>): ProxyHandler<any> => 
({
    get: (target, key) => {
        if (key === '__isStateObject') return true;
        return Reflect.get(target, key)
    },
    set: (target, key, value) => {
        // Recursive proxy handler
        if (isObjOrArr(value) && !value.__isStateObject) {
            value = new Proxy(value, stateObjHandler(stateObj));
            Object.keys(value).forEach((key) => value[key] = value[key]);
            for (let key in value) value[key] = value[key];
        }
        
        Reflect.set(target, key, value);
        (stateObj as any).startEmit();
        return true;
    },
    deleteProperty: (target, key) => {
        (stateObj as any).startEmit();
        return Reflect.deleteProperty(target, key);
    },
})

export function makeStateObject<T extends anyObj>(obj: T): StateObject<T> {
    if (obj.key === "__isStateObject")
        throw console.error(obj, 'is already a state object');

    const s = new StateObject<T>();
    (s as any)._state = new Proxy(obj, stateObjHandler(s));

    // Reassigning causes the proxy set to fire, resulting in recursion
    for (let key in s.state) s.state[key] = s.state[key];

    return s;
}
