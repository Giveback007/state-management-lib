import { JsType, JsTypeFind } from "./general.types";

export const objKeys = <T extends {}, K extends keyof T>(obj: T): K[] => Object.keys(obj) as any;

export const objVals = <T = any>(obj: { [key: string]: T }): T[] => objKeys(obj).map((key) => obj[key]);

/** A promise that waits n amount of milliseconds to execute */
export const wait = (ms: number) => new Promise(res => setTimeout(() => res(), ms));

/** Iterates n times over a function */
export const iterate = (num: number) => ({
    for: (funct: (i: number) => any) => {
        for (let i = 0; i < num; i++) { funct(i) };
    },
    /** Generate an array with the return values of funct */
    map: <T>(funct: (i: number) => T) => {
        const arr: T[] = [];
        for (let i = 0; i < num; i++) { arr.push(funct(i)) };
        return arr;
    }
});

/** An improved version of native `typeof` */
export function getType(val: any): JsType {
    if (typeof val === 'object') {
        if (Array.isArray(val)) return 'array';
        else if (val === null)  return 'null';
        else                    return 'object';
    } else {
        if (val !== val)        return 'NaN';
        else                    return typeof val;
    }
}

/**
 * The function will test if the type of the first
 * argument equals testType. Argument testType is a string
 * representing a javascript type.
 * 
 * @param val value to be tested
 * @param testType to check if typeof val === testType
 */
export const typeOf = <T extends JsType> (val: any, testType: T): val is JsTypeFind<T> => getType(val) === testType;
