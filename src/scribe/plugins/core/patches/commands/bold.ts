import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"

class BoldCommand extends CommandPatch {
    constructor(scribe) {
        super(scribe, "bold")
    }

    /**
     * Chrome: Executing the bold command inside a heading corrupts the markup.
     * Disabling for now.
     */
    queryEnabled() {
        var selection = new this.scribe.api.Selection()
        var headingNode = selection.getContaining((node) => (/^(H[1-6])$/).test(node.nodeName))

        return super.queryEnabled() && !headingNode
    }
}

export = function() {
    return function(scribe) {
        // TODO: We can't use STRONGs because this would mean we have to
        // re-implement the `queryState` command, which would be difficult.

        scribe.commandPatches["bold"] = new BoldCommand(scribe)
    }
}
