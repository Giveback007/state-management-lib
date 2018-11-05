import { isObjOrArr } from "@giveback007/util-lib";
import { State } from "./state";

'use-strict';

// Test setting, mutating and deleting of nested values
export const proxyHandler = <T extends ({} | any[])>(stateObj: State<T>): ProxyHandler<any> => 
({
    get: (target, key) => {
        if (key === '__isStateObject') return true;
        return Reflect.get(target, key)
    },
    set: (target, key, value) => {
        // Recursive proxy handler
        if (isObjOrArr(value) && !(value as any).__isStateObject) {
            value = new Proxy(value, proxyHandler(stateObj));
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
});
