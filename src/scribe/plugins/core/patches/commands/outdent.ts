import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"
import * as nodeHelpers from "../../../../node"

/**
 * Prevent Chrome from removing formatting of BLOCKQUOTE contents.
 */

class OutdentCommand extends CommandPatch {
    constructor(scribe: Scribe) {
        super(scribe, "outdent")
    }

    execute() {
        this.scribe.transactionManager.run(() => {
            var selection = new this.scribe.api.Selection()
            var range = selection.range

            var blockquoteNode = selection.getContaining((node) => node.nodeName === 'BLOCKQUOTE') as HTMLElement

            if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
                /**
                 * Chrome: Applying the outdent command when a whole BLOCKQUOTE is
                 * selected removes the formatting of its contents.
                 * As per: http://jsbin.com/okAYaHa/1/edit?html,js,output
                 */

                // Insert a copy of the selection before the BLOCKQUOTE, and then
                // restore the selection on the copy.
                selection.placeMarkers()
                // We want to copy the selected nodes *with* the markers
                selection.selectMarkers(true)
                var selectedNodes = range.cloneContents()
                blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode)
                range.deleteContents()
                selection.selectMarkers()

                // Delete the BLOCKQUOTE if it's empty
                if (blockquoteNode.textContent === '') {
                    blockquoteNode.parentNode.removeChild(blockquoteNode)
                }
            } else {
                /**
                 * Chrome: If we apply the outdent command on a P, the contents of the
                 * P will be outdented instead of the whole P element.
                 * As per: http://jsbin.com/IfaRaFO/1/edit?html,js,output
                 */

                var pNode = selection.getContaining(function(node) {
                    return node.nodeName === 'P'
                });

                if (pNode) {
                    /**
                     * If we are not at the start of end of a BLOCKQUOTE, we have to
                     * split the node and insert the P in the middle.
                     */

                    var nextSiblingNodes = nodeHelpers.nextSiblings(pNode)

                    if (!!nextSiblingNodes.length) {
                        var newContainerNode = document.createElement(blockquoteNode.nodeName)

                        while (!!nextSiblingNodes.length) {
                            newContainerNode.appendChild(nextSiblingNodes[0])
                            nextSiblingNodes.shift()
                        }

                        blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling)
                    }

                    selection.placeMarkers()
                    blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling)
                    selection.selectMarkers()

                    // If the BLOCKQUOTE is now empty, clean it up.
                    if (blockquoteNode.innerHTML === '') {
                        blockquoteNode.parentNode.removeChild(blockquoteNode)
                    }
                } else {
                    super.execute()
                }
            }
        })
    }
}

export = function() {
    return function(scribe: Scribe) {
        scribe.commandPatches["outdent"] = new OutdentCommand(scribe)
    }
}
