import { Scribe } from "../../../../scribe"
import { Command } from "../../../api/command"
import * as nodeHelpers from "../../../node"
import { toArray } from "../../../util"

/**
 * If the paragraphs option is set to true, then when the list is
 * unapplied, ensure that we enter a P element.
 */

class InsertListCommand extends Command {
    execute(value) {
        function splitList(listItemElements: HTMLElement[]) {
            // TODO fix horrible scoping of listNode (defined below!)
            if (!!listItemElements.length) {
                var newListNode = document.createElement(listNode.nodeName) as HTMLElement

                while (listItemElements.length > 0) {
                    newListNode.appendChild(listItemElements[0])
                    listItemElements.shift()
                }

                listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling)
            }
        }

        if (this.queryState()) {
            var selection = new this.scribe.api.Selection()
            var range = selection.range

            var listNode = selection.getContaining((node) => node.nodeName === 'OL' || node.nodeName === 'UL') as HTMLElement

            var listItemElement = selection.getContaining((node) => node.nodeName === 'LI') as HTMLElement

            this.scribe.transactionManager.run(function() {
                if (listItemElement) {
                    var nextListItemElements = nodeHelpers.nextSiblings(listItemElement) as HTMLElement[]

                    /**
                     * If we are not at the start or end of a UL/OL, we have to
                     * split the node and insert the P(s) in the middle.
                     */
                    splitList(nextListItemElements)

                    /**
                     * Insert a paragraph in place of the list item.
                     */

                    selection.placeMarkers();

                    var pNode = document.createElement('p');
                    pNode.innerHTML = listItemElement.innerHTML;

                    listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
                    listItemElement.parentNode.removeChild(listItemElement);
                } else {
                    /**
                     * When multiple list items are selected, we replace each list
                     * item with a paragraph.
                     */

                    // We can't query for list items in the selection so we loop
                    // through them all and find the intersection ourselves.
                    var selectedListItemElements = toArray(listNode.querySelectorAll('li'))
                        .filter((listItemElement) => {
                            // TODO Range.intersectsNode() is experimental
                            // https://dom.spec.whatwg.org/#dom-range-intersectsnode
                            // maybe derive a polyfill from rangy?
                            // https://github.com/timdown/rangy/blob/1e55169d2e4d1d9458c2a87119addf47a8265276/src/core/domrange.js#L696
                            return range.intersectsNode(listItemElement)
                        });
                    var lastSelectedListItemElement = selectedListItemElements[selectedListItemElements.length - 1]
                    var listItemElementsAfterSelection = nodeHelpers.nextSiblings(lastSelectedListItemElement) as HTMLElement[]

                    /**
                     * If we are not at the start or end of a UL/OL, we have to
                     * split the node and insert the P(s) in the middle.
                     */
                    splitList(listItemElementsAfterSelection)

                    // Store the caret/range positioning inside of the list items so
                    // we can restore it from the newly created P elements soon
                    // afterwards.
                    selection.placeMarkers()

                    var documentFragment = document.createDocumentFragment()
                    selectedListItemElements.forEach(function(listItemElement) {
                        var pElement = document.createElement('p')
                        pElement.innerHTML = listItemElement.innerHTML
                        documentFragment.appendChild(pElement)
                    })

                    // Insert the Ps
                    listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling)

                    // Remove the LIs
                    selectedListItemElements.forEach(function(listItemElement) {
                        listItemElement.parentNode.removeChild(listItemElement)
                    })
                }

                // If the list is now empty, clean it up.
                if (listNode.childNodes.length === 0) {
                    listNode.parentNode.removeChild(listNode)
                }

                selection.selectMarkers()
            })
        } else {
            super.execute(value)
        }
    }
    
    queryEnabled() {
        return super.queryEnabled() && this.scribe.allowsBlockElements()
    }
}

export = function(scribe: Scribe) {
    scribe.commands["insertOrderedList"] = new InsertListCommand(scribe, 'insertOrderedList')
    scribe.commands["insertUnorderedList"] = new InsertListCommand(scribe, 'insertUnorderedList')
}
