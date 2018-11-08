export interface Store<T> {
    readonly state: T;
    subscribe: (funct: (obj: T) => any) => () => boolean;
}
