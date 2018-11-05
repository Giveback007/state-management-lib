import { State } from "./state";
import { proxyHandler } from "./proxy-handler";
import { anyObj } from "@giveback007/util-lib";

'use-strict';

export function initAppState<T extends anyObj>(obj: T): State<T> {
    if (obj.key === "__isStateObject")
        throw console.error(obj, 'is already a state object');

    const s = new State<T>();
    (s as any)._state = new Proxy(obj, proxyHandler(s));

    // Reassigning causes the proxy "set" to fire 
    // recursively setting a proxy on all nested objects
    for (let key in s.state) s.state[key] = s.state[key];

    return s;
}