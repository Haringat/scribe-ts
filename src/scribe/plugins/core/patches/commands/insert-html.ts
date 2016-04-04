import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"
import * as nodeHelpers from "../../../../node"

class InsertHTMLCommand extends CommandPatch {
    constructor(scribe: Scribe) {
        super(scribe, "insertHTML")
    }

    execute(value) {
        this.scribe.transactionManager.run(() => {
            super.execute(value)
            nodeHelpers.removeChromeArtifacts(this.scribe.el)
        })
    }
}

export = function() {
    return function(scribe: Scribe) {
        scribe.commandPatches["insertHTML"] = new InsertHTMLCommand(scribe)
    }
}
