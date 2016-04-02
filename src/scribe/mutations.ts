declare var WebKitMutationObserver: typeof MutationObserver
declare var MozMutationObserver: typeof MutationObserver

/// This enables server side rendering
class MockObserver implements MutationObserver {
    constructor(callback: MutationCallback) {}
    
    disconnect() { }
    observe(target: Node, options: MutationObserverInit) { }
    takeRecords(): MutationRecord[] { return [] }
}

export function determineMutationObserver(window: Window): typeof MutationObserver {
    if (typeof MutationObserver !== "undefined") {
        return MutationObserver
    }
    
    if (typeof WebKitMutationObserver !== "undefined") {
        return WebKitMutationObserver
    }
    
    if (typeof MozMutationObserver !== "undefined") {
        return MozMutationObserver
    }
    
    // TODO import polyfill for IE9+10
    // https://github.com/webcomponents/webcomponentsjs
    
    return MockObserver
}
