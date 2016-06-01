import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"
import { isRedoKeyCombination } from "../../../keystrokes"

class RedoCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "redo")

        //is scribe is configured to undo assign listener
        if (scribe.options.undo.enabled) {
            // TODO keyboard shortcut handling doesn't belong here
            scribe.el.addEventListener('keydown', (event) => {
                if (isRedoKeyCombination(event)) {
                    event.preventDefault()
                    this.execute()
                }
            })
        }
    }

    execute() {
        this.scribe.undoManager.redo()
    }

    queryEnabled() {
        return this.scribe.undoManager.position > 0
    }
}

export = function(scribe: Scribe) {
    scribe.commands["redo"] = new RedoCommand(scribe)
}
