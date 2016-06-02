import { removeValue } from "./util"

// TODO: once
// TODO: unit test
// Good example of a complete(?) implementation: https://github.com/Wolfy87/EventEmitter

export class EventEmitter {

    private _listeners: { [name: string]: Function[] }

    constructor() {
        this._listeners = {}
    }

    on(name: string, listener: Function) {
        if (!this._listeners[name]) {
            this._listeners[name] = []
        }

        this._listeners[name].push(listener)
    }

    off(name: string, listener?: Function) {
        if (listener) {
            removeValue(this._listeners[name], listener)
        } else {
            this._listeners[name] = []
        }
    }

    trigger(name: string, args: any[] = []) {
        // fire events like "my:custom:event", then "my:custom", then "my"
        
        var events = name.split(":")

        while (events.length > 0) {
            var current = events.join(":")

            var listeners = this._listeners[current]

            if (listeners) {
                // trigger handlers:
                listeners.forEach((listener) => listener.apply(null, args))
            }

            events.pop()
        }
    }
}
