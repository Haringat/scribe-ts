import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"

class OutdentCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "outdent")
    }

    queryEnabled() {
        /**
         * FIXME: If the paragraphs option is set to true, then when the
         * list is unapplied, ensure that we enter a P element.
         * Currently we just disable the command when the selection is inside of
         * a list.
         */
        var selection = new this.scribe.api.Selection()
        var listElement = selection.getContaining((element) => element.nodeName === 'UL' || element.nodeName === 'OL')

        // FIXME: define block element rule here?
        return super.queryEnabled() && this.scribe.allowsBlockElements() && !listElement
    }
}

export = function(scribe: Scribe) {
    scribe.commands["outdent"] = new OutdentCommand(scribe)
}
