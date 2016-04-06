import { Scribe } from "../scribe"

export class ScribeUndoManager implements UndoManager {

    private _ush: HTMLElement
    private _stack: DOMTransaction[][] // TODO type?
    private _limit: number
    private _fireEvent: boolean
    
    position: number
    length: number

    constructor(limit: number, undoScopeHost: HTMLElement) {
        this._stack = []
        this._limit = limit
        this._fireEvent = typeof CustomEvent != 'undefined' && undoScopeHost && undoScopeHost.dispatchEvent
        this._ush = undoScopeHost

        this.position = 0
        this.length = 0
    }

    transact(transaction: DOMTransaction, merge: boolean) {
        if (arguments.length < 2) {
            throw new TypeError('Not enough arguments to UndoManager.transact.');
        }

        transaction.execute();

        if (this.position > 0) {
            this.clearRedo();
        }

        var transactions;
        
        if (merge && this.length) {
            this._stack[0].push(transaction)
            this._stack.shift()
            this._stack.unshift(transactions)
        } else {
            transactions = [transaction]
            this._stack.unshift(transactions)
            this.length++

            if (this._limit && this.length > this._limit) {
                this.clearUndo(this._limit);
            }
        }

        this._dispatch('DOMTransaction', transactions);
    }

    undo() {
        if (this.position >= this.length) { return; }

        var transactions = this._stack[this.position]
        var i = transactions.length
        
        while (i--) {
            transactions[i].undo()
        }
        this.position++

        this._dispatch('undo', transactions)
    };

    redo() {
        if (this.position === 0) { return; }

        this.position--
        var transactions = this._stack[this.position]
        
        for (var i = 0; i < transactions.length; i++) {
            transactions[i].redo()
        }

        this._dispatch('redo', transactions)
    };

    item(index: number) {
        return index >= 0 && index < this.length ?
            this._stack[index] :
            null;
    }

    clearUndo(position?: number) {
        this._stack.length = position !== undefined ? position : this.position
        this.length = this._stack.length
    }

    clearRedo() {
        this._stack = this._stack.slice(this.position)
        this.length = this._stack.length
        this.position = 0
    }

    _dispatch(event: string, transactions: DOMTransaction[]) {
        if (this._fireEvent) {
            this._ush.dispatchEvent(new CustomEvent(event, {
                detail: { transactions: transactions },
                bubbles: true,
                cancelable: false
            }))
        }
    }
}
