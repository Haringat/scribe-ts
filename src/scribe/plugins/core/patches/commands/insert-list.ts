import { Scribe } from "../../../../../scribe"
import { CommandPatch} from "../../../../api/command-patch"
import * as nodeHelpers from "../../../../node"

class InsertListCommandPatch extends CommandPatch {
    constructor(scribe: Scribe, commandName: string) {
        super(scribe, commandName)
    }

    execute(value) {
        this.scribe.transactionManager.run(() => {
            super.execute(value)

            if (this.queryState()) {
                var selection = new this.scribe.api.Selection()

                var listElement = selection.getContaining((node) => node.nodeName === 'OL' || node.nodeName === 'UL') as HTMLElement

                /**
                 * Firefox: If we apply the insertOrderedList or the insertUnorderedList
                 * command on an empty block, a P will be inserted after the OL/UL.
                 * As per: http://jsbin.com/cubacoli/3/edit?html,js,output
                 */

                if (listElement.nextElementSibling && listElement.nextElementSibling.childNodes.length === 0) {
                    nodeHelpers.removeNode(listElement.nextElementSibling)
                }

                /**
                 * Chrome: If we apply the insertOrderedList or the insertUnorderedList
                 * command on an empty block, the OL/UL will be nested inside the block.
                 * As per: http://jsbin.com/eFiRedUc/1/edit?html,js,output
                 */

                if (listElement) {
                    var listParentNode = listElement.parentNode
                    // If list is within a text block then split that block
                    if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                        selection.placeMarkers()
                        // Move listElement out of the block
                        nodeHelpers.insertAfter(listElement, listParentNode)
                        selection.selectMarkers()

                        /**
                         * Chrome 27-34: An empty text node is inserted.
                         */
                        if (listParentNode.childNodes.length === 2 && nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                            nodeHelpers.removeNode(listParentNode)
                        }

                        // Remove the block if it's empty
                        if (listParentNode.childNodes.length === 0) {
                            nodeHelpers.removeNode(listParentNode)
                        }
                    }
                }

                nodeHelpers.removeChromeArtifacts(listElement)
            }
        })
    }

    queryState() {
        try {
            return super.queryState()
        } catch (err) {
            // Explicitly catch unexpected error when calling queryState - bug in Firefox: https://github.com/guardian/scribe/issues/208
            if (err.name == 'NS_ERROR_UNEXPECTED') {
                return false
            } else {
                throw err
            }
        }
    }
}

export = function(scribe: Scribe) {
    scribe.commandPatches["insertOrderedList"] = new InsertListCommandPatch(scribe, "insertOrderedList")
    scribe.commandPatches["insertUnorderedList"] = new InsertListCommandPatch(scribe, "insertUnorderedList")
}
