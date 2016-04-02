import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"

const Z_KEY = 90

class RedoCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "redo")

        //is scribe is configured to undo assign listener
        if (scribe.options.undo.enabled) {
            // TODO keyboard shortcut handling doesn't belong here
            scribe.el.addEventListener('keydown', (event) => {
                if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === Z_KEY) {
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

export = function() {
    return function(scribe: Scribe) {
        scribe.commands["redo"] = new RedoCommand(scribe)
    }
}
