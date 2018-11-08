import { ObservableEmitter } from "./observable-emitter";
import { Store } from "./@types";

'use-strict';

/**
 * This type of observable allows you to directly mutate the object.
 * firing off all of the subscriptions when any type of change is made
 * */
export function proxyState<T extends ({}| any[])>(obj: T): Store<T> {
    const emt = new ObservableEmitter<T>(obj);
    
    return Object.seal({
        /** This object can be mutated but not reassigned */
        get state() { return emt.obj },
        /** Returns an unsubscribe method */
        subscribe: (funct: (obj: T) => any) => {
            const idx = emt.functs.length;
            emt.functs[idx] = funct;
            return () => delete emt.functs[idx];
        },
    })
}
