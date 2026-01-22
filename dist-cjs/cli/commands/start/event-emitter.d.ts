/**
 * Simple EventEmitter implementation for process management
 */
type EventHandler = (...args: any[]) => void;
export declare class EventEmitter {
    private events;
    on(event: string, handler: EventHandler): void;
    emit(event: string, ...args: any[]): void;
    off(event: string, handler: EventHandler): void;
    once(event: string, handler: EventHandler): void;
}
export {};
//# sourceMappingURL=event-emitter.d.ts.map