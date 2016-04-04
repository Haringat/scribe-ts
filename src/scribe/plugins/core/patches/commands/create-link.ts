import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"

class CreateLinkCommand extends CommandPatch {
    constructor(scribe: Scribe) {
        super(scribe, "createLink")
    }

    execute(value) {
        var selection = new this.scribe.api.Selection()

        /**
         * Firefox does not create a link when selection is collapsed
         * so we create it manually. http://jsbin.com/tutufi/2/edit?js,output
         */
        // using range.collapsed vs selection.isCollapsed - https://code.google.com/p/chromium/issues/detail?id=447523
        if (selection.range.collapsed) {
            var aElement = document.createElement('a')
            aElement.setAttribute('href', value)
            aElement.textContent = value

            selection.range.insertNode(aElement)

            // Select the created link
            var newRange = document.createRange()
            newRange.setStartBefore(aElement)
            newRange.setEndAfter(aElement)

            selection.selection.removeAllRanges()
            selection.selection.addRange(newRange)
        } else {
            super.execute(value)
        }
    }
}

export = function() {
    return function(scribe) {
        scribe.commandPatches["createLink"] = new CreateLinkCommand(scribe)
    }
}
