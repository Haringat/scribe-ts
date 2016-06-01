const Z_KEY = 90

export function isUndoKeyCombination(event: KeyboardEvent) {
    return !event.shiftKey && (event.metaKey || (event.ctrlKey && !event.altKey)) && event.keyCode === Z_KEY
}

export function isRedoKeyCombination(event: KeyboardEvent) {
    return event.shiftKey && (event.metaKey || (event.ctrlKey && !event.altKey)) && event.keyCode === Z_KEY
}
