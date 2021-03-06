import observeDomChanges = require("../../dom-observer")
import * as nodeHelpers from "../../node"
import { Scribe } from "../../../scribe"
import { toArray } from "../../util"

const ENTER = 13
const BACKSPACE = 8

export = function(scribe: Scribe) {
    /**
     * Firefox: Giving focus to a `contenteditable` will place the caret
     * outside of any block elements. Chrome behaves correctly by placing the
     * caret at the  earliest point possible inside the first block element.
     * As per: http://jsbin.com/eLoFOku/1/edit?js,console,output
     *
     * We detect when this occurs and fix it by placing the caret ourselves.
     */
    scribe.el.addEventListener('focus', function placeCaretOnFocus() {
        var selection = new scribe.api.Selection()
        // In Chrome, the range is not created on or before this event loop.
        // It doesn’t matter because this is a fix for Firefox.
        if (selection.range) {

            var isFirefoxBug = scribe.allowsBlockElements() &&
                selection.range.startContainer === scribe.el

            if (isFirefoxBug) {
                var focusElement = nodeHelpers.firstDeepestChild(scribe.el)

                var range = selection.range

                range.setStart(focusElement, 0)
                range.setEnd(focusElement, 0)

                selection.selection.removeAllRanges()
                selection.selection.addRange(range)
            }
        }
    })

    /**
     * Apply the formatters when there is a DOM mutation.
     */
    function applyFormatters() {
        if (!scribe._skipFormatters) {
            var selection = new scribe.api.Selection()
            var isEditorActive = selection.range

            var runFormatters = function() {
                if (isEditorActive) {
                    selection.placeMarkers()
                }
                scribe.setHTML(scribe.format(scribe.getHTML()))
                selection.selectMarkers()
            }

            // We only want to wrap the formatting in a transaction if the editor is
            // active. If the DOM is mutated when the editor isn't active (e.g.
            // `scribe.setContent`), we do not want to push to the history. (This
            // happens on the first `focus` event).

            // The previous check is no longer needed, and the above comments are no longer valid.
            // Now `scribe.setContent` updates the content manually, and `scribe.pushHistory`
            // will not detect any changes, and nothing will be push into the history.
            // Any mutations made without `scribe.getContent` will be pushed into the history normally.

            // Pass content through formatters, place caret back
            scribe.transactionManager.run(runFormatters)
        }

        delete scribe._skipFormatters
    }

    observeDomChanges(scribe.el, applyFormatters)

    // TODO: disconnect on tear down:
    // observer.disconnect();

    /**
     * If the paragraphs option is set to true, we need to manually handle
     * keyboard navigation inside a heading to ensure a P element is created.
     */
    if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function(event) {
            if (event.keyCode === ENTER) {

                var selection = new scribe.api.Selection()
                var range = selection.range

                var headingNode = selection.getContaining(function(node) {
                    return (/^(H[1-6])$/).test(node.nodeName)
                }) as HTMLElement

                /**
                 * If we are at the end of the heading, insert a P. Otherwise handle
                 * natively.
                 */
                if (headingNode && range.collapsed) {
                    var contentToEndRange = range.cloneRange()
                    contentToEndRange.setEndAfter(headingNode)

                    // Get the content from the range to the end of the heading
                    var contentToEndFragment = contentToEndRange.cloneContents()

                    if (contentToEndFragment.firstChild.textContent === '') {
                        event.preventDefault()

                        scribe.transactionManager.run(function() {
                            // Default P
                            // TODO: Abstract somewhere
                            var pNode = document.createElement('p')
                            var brNode = document.createElement('br')
                            pNode.appendChild(brNode)

                            headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling)

                            // Re-apply range
                            range.setStart(pNode, 0)
                            range.setEnd(pNode, 0)

                            selection.selection.removeAllRanges()
                            selection.selection.addRange(range)
                        })
                    }
                }
            }
        })
    }

    /**
     * If the paragraphs option is set to true, we need to manually handle
     * keyboard navigation inside list item nodes.
     */
    if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function(event) {
            if (event.keyCode === ENTER || event.keyCode === BACKSPACE) {

                var selection = new scribe.api.Selection()
                var range = selection.range

                if (range.collapsed) {
                    var containerLIElement = selection.getContaining((node) => node.nodeName === 'LI')
                    
                    if (containerLIElement && containerLIElement.textContent.trim() === '') {
                        /**
                         * LIs
                         */

                        event.preventDefault()

                        var listNode = selection.getContaining((node) => node.nodeName === 'UL' || node.nodeName === 'OL')

                        var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList')

                        command.event = event // TODO garbage?

                        command.execute()
                    }
                }
            }
        })
    }

    /**
     * We have to hijack the paste event to ensure it uses
     * `scribe.insertHTML`, which executes the Scribe version of the command
     * and also runs the formatters.
     */

    /**
     * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
     * I also don't like how it has the authority to perform `event.preventDefault`.
     */

    scribe.el.addEventListener('paste', function handlePaste(event: ClipboardEvent) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * will execute the second branch here.
         *
         * Chrome on android provides `ClipboardEvent.clipboardData` but the types array is not filled
         */
        if (event.clipboardData && event.clipboardData.types.length > 0) {
            event.preventDefault()

            if (toArray(event.clipboardData.types).indexOf('text/html') !== -1) {
                scribe.insertHTML(event.clipboardData.getData('text/html'))
            } else {
                scribe.insertPlainText(event.clipboardData.getData('text/plain'))
            }
        } else {
            /**
             * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
             * sequence of events:
             *
             *   - Save the text selection
             *   - Focus another, hidden textarea so we paste there
             *   - Copy the pasted content of said textarea
             *   - Give focus back to the scribe
             *   - Restore the text selection
             *
             * This is required because, without access to the Clipboard API, there is literally
             * no other way to manipulate content on paste.
             * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
             *
             * Firefox <= 21
             * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent.clipboardData
             */

            var selection = new scribe.api.Selection()

            // Store the caret position
            selection.placeMarkers()

            var bin = document.createElement('div')
            document.body.appendChild(bin)
            bin.setAttribute('contenteditable', 'true')
            bin.focus()

            // Wait for the paste to happen (next loop?)
            setTimeout(function() {
                var data = bin.innerHTML
                bin.parentNode.removeChild(bin)

                // Restore the caret position
                selection.selectMarkers()
                /**
                 * Firefox 19 (and maybe others): even though the applied range
                 * exists within the Scribe instance, we need to focus it.
                 */
                scribe.el.focus()

                scribe.insertHTML(data)
            }, 1)
        }
    })

}
