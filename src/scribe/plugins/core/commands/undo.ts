import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"

const Z_KEY = 90

class UndoCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "undo")

        if (scribe.options.undo.enabled) {
            scribe.el.addEventListener('keydown', (event) => {
                // TODO keyboard shortcut handling really doesn't belong here
                if (!event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === Z_KEY) {
                    event.preventDefault()
                    this.execute()
                }
            })
        }
    }

    execute() {
        this.scribe.undoManager.undo();
    }

    queryEnabled() {
        return this.scribe.undoManager.position < this.scribe.undoManager.length
    }
}

export = function() {
    return function(scribe) {
        scribe.commands["undo"] = new UndoCommand(scribe)
    }
}
