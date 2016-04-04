import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"

/**
 * Prevent Chrome from inserting BLOCKQUOTEs inside of Ps, and also from
 * adding a redundant `style` attribute to the created BLOCKQUOTE.
 */

var INVISIBLE_CHAR = '\uFEFF';

class IndentCommand extends CommandPatch {
    constructor(scribe: Scribe) {
        super(scribe, "indent")
    }

    execute(value) {
        this.scribe.transactionManager.run(() => {
            /**
             * Chrome: If we apply the indent command on an empty P, the
             * BLOCKQUOTE will be nested inside the P.
             * As per: http://jsbin.com/oDOriyU/3/edit?html,js,output
             */
            var selection = new this.scribe.api.Selection()
            var range = selection.range

            var isCaretOnNewLine = (range.commonAncestorContainer.nodeName === 'P') && (range.commonAncestorContainer.innerHTML === '<br>')
            if (isCaretOnNewLine) {
                // FIXME: this text node is left behind. Tidy it up somehow,
                // or don't use it at all.
                var textNode = document.createTextNode(INVISIBLE_CHAR)

                range.insertNode(textNode)

                range.setStart(textNode, 0)
                range.setEnd(textNode, 0)

                selection.selection.removeAllRanges()
                selection.selection.addRange(range)
            }

            super.execute(value)

            /**
             * Chrome: The BLOCKQUOTE created contains a redundant style attribute.
             * As per: http://jsbin.com/AkasOzu/1/edit?html,js,output
             */

            // Renew the selection
            selection = new this.scribe.api.Selection()
            var blockquoteNode = selection.getContaining((node) => node.nodeName === 'BLOCKQUOTE') as HTMLElement

            if (blockquoteNode) {
                blockquoteNode.removeAttribute('style')
            }
        })
    }
}

export = function() {
    return function(scribe: Scribe) {
        scribe.commandPatches["indent"] = new IndentCommand(scribe)
    }
}
