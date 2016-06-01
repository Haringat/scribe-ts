import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"
import { isUndoKeyCombination } from "../../../keystrokes"

class UndoCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "undo")

        if (scribe.options.undo.enabled) {
            scribe.el.addEventListener('keydown', (event) => {
                // TODO keyboard shortcut handling really doesn't belong here
                if (isUndoKeyCombination(event)) {
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

export = function(scribe: Scribe) {
    scribe.commands["undo"] = new UndoCommand(scribe)
}
