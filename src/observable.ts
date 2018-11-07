import { ObservableEmitter } from "./observable-emitter";

'use-strict';

/**
 * This type of observable allows you to directly mutate the object.
 * firing off all of the subscriptions when any type of change is made
 * */
export function observable<T extends ({}| any[])>(obj: T) {
    const emt = new ObservableEmitter<T>(obj);
    
    return {
        /** This object can be mutated but not reassigned */
        get obj() { return emt.obj },
        subscribe: (funct: (obj: T) => any) => {
            const idx = emt.functs.length;
            emt.functs[idx] = funct;
            return { unsubscribe: () => delete emt.functs[idx] };
        },
    }
}
