// https://dxr.mozilla.org/mozilla-central/source/dom/webidl/DOMTransaction.webidl

type DOMTransactionCallback = { (): void }

interface DOMTransaction {
    label?: string
    executeAutomatic?: DOMTransactionCallback
    execute?: DOMTransactionCallback
    undo?: DOMTransactionCallback
    redo?: DOMTransactionCallback
}

// https://dxr.mozilla.org/mozilla-central/source/dom/webidl/UndoManager.webidl

interface UndoManager {
    transact(transaction: DOMTransaction, merge: boolean)
    undo(): void
    redo(): void
    item(index: number): DOMTransaction[]
    /// readonly
    length: number
    /// readonly
    position: number
    clearUndo(): void
    clearRedo(): void
}

// https://dxr.mozilla.org/mozilla-central/source/dom/webidl/Range.webidl

interface Range {
    intersectsNode(node: Node): boolean
}
