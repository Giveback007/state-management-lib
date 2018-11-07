import { isObjOrArr } from "@giveback007/util-lib";

'use-strict';

function proxyHandler<T extends ({} | any[])>(startEmit): ProxyHandler<T> {
    return {
        get: (target, key) => {
            if (key === '__isObservableObj') return true;
            return Reflect.get(target, key)
        },
        set: (target, key, value) => {
            // Recursive proxy handler
            if (isObjOrArr(value) && !(value as any).__isObservableObj) {
                value = new Proxy(value, proxyHandler(startEmit));
                Object.keys(value).forEach((key) => value[key] = value[key]);
                for (let key in value) value[key] = value[key];
            }
            
            Reflect.set(target, key, value);
            startEmit();
            return true;
        },
        deleteProperty: (target, key) => {
            startEmit();
            return Reflect.deleteProperty(target, key);
        },
    }
}

export function observableProxy<T extends ({} | any[])>(obj: T, startEmit) {
    const proxy = new Proxy(obj, proxyHandler(startEmit));

    // Reassigning causes the proxy "set" to fire 
    // recursively setting a proxy on all nested objects
    for (let key in proxy) proxy[key] = proxy[key];

    return proxy;
}
