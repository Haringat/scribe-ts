import { isEmptyTextNode, isSelectionMarkerNode } from "./node"
import { determineMutationObserver } from "./mutations"
import { some } from "./util"

var maybeWindow = typeof window === 'object' ? window : undefined

var MutationObserver = determineMutationObserver(maybeWindow)

function hasRealMutation(node: Node) {
    return !isEmptyTextNode(node) && !isSelectionMarkerNode(node)
}

function includeRealMutations(mutations: MutationRecord[]): boolean {
    return mutations.some((mutation) => {
        return some(mutation.addedNodes, hasRealMutation)
            || some(mutation.removedNodes, hasRealMutation)
    })
}

export = function observeDomChanges(el: Node, callback: Function): MutationObserver {
    // Flag to avoid running recursively
    var runningPostMutation = false

    var observer = new MutationObserver(mutations => {
        if (!runningPostMutation && includeRealMutations(mutations)) {
            runningPostMutation = true

            try {
                callback()
            } catch (e) {
                // The catch block is required but we don't want to swallow the error
                throw e
            } finally {
                // We must yield to let any mutation we caused be triggered
                // in the next cycle
                setTimeout(() => { runningPostMutation = false }, 0)
            }
        }
    })

    observer.observe(el, {
        childList: true,
        subtree: true
    });

    return observer;
}
