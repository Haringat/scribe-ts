import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"

class IndentCommand extends Command {
    constructor(scribe: Scribe) {
        super(scribe, "indent")
    }

    queryEnabled() {
        /**
         * FIXME: Chrome nests ULs inside of ULs
         * Currently we just disable the command when the selection is inside of
         * a list.
         * As per: http://jsbin.com/ORikUPa/3/edit?html,js,output
         */
        var selection = new this.scribe.api.Selection()
        var listElement = selection.getContaining((element) => element.nodeName === 'UL' || element.nodeName === 'OL')

        return super.queryEnabled() && this.scribe.allowsBlockElements() && !listElement
    }
}

export = function(scribe: Scribe) {
    scribe.commands["indent"] = new IndentCommand(scribe)
}
