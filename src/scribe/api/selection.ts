import { Scribe } from "../../scribe"
import * as nodeHelpers from "../node"

function createMarker(): HTMLElement {
    var node = document.createElement('em')
    
    node.style.display = 'none'
    node.classList.add('scribe-marker')
    
    return node
}

function insertMarker(range: Range, marker: HTMLElement) {
    range.insertNode(marker)

    /**
     * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
     * the inserted element. We just remove it. This in turn creates several
     * bugs when perfoming commands on selections that contain an empty text
     * node (`removeFormat`, `unlink`).
     * As per: http://jsbin.com/hajim/5/edit?js,console,output
     */
    if (marker.nextSibling && nodeHelpers.isEmptyTextNode(marker.nextSibling)) {
        nodeHelpers.removeNode(marker.nextSibling)
    }

    /**
     * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
     * the inserted element when the child element is at the start of a block
     * element. We just remove it.
     * FIXME: Document why we need to remove this
     * As per: http://jsbin.com/sifez/1/edit?js,console,output
     */
    if (marker.previousSibling && nodeHelpers.isEmptyTextNode(marker.previousSibling)) {
        nodeHelpers.removeNode(marker.previousSibling)
    }
}

/**
 * Wrapper for object holding currently selected text.
 */
export class ScribeSelection {

    private scribe: Scribe
    private rootDoc: Document

    selection: Selection
    range: Range

    constructor(scribe: Scribe) {
        this.scribe = scribe
        this.rootDoc = scribe.el.ownerDocument

        if (this.rootDoc.compareDocumentPosition(scribe.el) & Node.DOCUMENT_POSITION_DISCONNECTED) {
            var currentElement = scribe.el.parentNode
            while (currentElement && nodeHelpers.isFragment(currentElement)) {
                currentElement = currentElement.parentNode
            }

            // if we found a document fragment and it has a getSelection method, set it to the root doc
            if (currentElement && currentElement["getSelection"]) {
                this.rootDoc = currentElement as Document
            }
        }

        this.selection = this.rootDoc.getSelection()

        if (this.selection.rangeCount && this.selection.anchorNode) {
            var startNode = this.selection.anchorNode
            var startOffset = this.selection.anchorOffset
            var endNode = this.selection.focusNode
            var endOffset = this.selection.focusOffset

            // if the range starts and ends on the same node, then we must swap the
            // offsets if ever focusOffset is smaller than anchorOffset
            if (startNode === endNode && endOffset < startOffset) {
                var tmp = startOffset
                
                startOffset = endOffset
                endOffset = tmp
            }
            // if the range ends *before* it starts, then we must reverse the range
            else if (nodeHelpers.isBefore(endNode, startNode)) {
                var tmpNode = startNode
                var tmpOffset = startOffset
                
                startNode = endNode
                startOffset = endOffset
                endNode = tmpNode
                endOffset = tmpOffset
            }

            // create the range to avoid chrome bug from getRangeAt / window.getSelection()
            // https://code.google.com/p/chromium/issues/detail?id=380690
            this.range = document.createRange()
            this.range.setStart(startNode, startOffset)
            this.range.setEnd(endNode, endOffset)
        }
    }

    /**
     * @returns Closest ancestor Node satisfying nodeFilter. Undefined if none exist before reaching Scribe container.
     */
    getContaining(nodeFilter) {
        var range = this.range
        
        if (!range) {
            return
        }

        var node = this.range.commonAncestorContainer
        
        return !(node && this.scribe.el === node) && nodeFilter(node)
            ? node
            : nodeHelpers.getAncestor(node, this.scribe.el, nodeFilter)
    };

    placeMarkers() {
        var range = this.range
        
        if (!range) {
            return
        }

        //we need to ensure that the scribe's element lives within the current document to avoid errors with the range comparison (see below)
        //one way to do this is to check if it's visible (is this the best way?).
        if (!document.contains(this.scribe.el)) {
            return
        }

        //we want to ensure that the current selection is within the current scribe node
        //if this isn't true scribe will place markers within the selections parent
        //we want to ensure that scribe ONLY places markers within it's own element
        if (this.scribe.el.contains(range.startContainer) && this.scribe.el.contains(range.endContainer)) {
            // insert start marker
            insertMarker(range.cloneRange(), createMarker())

            if (!range.collapsed) {
                // End marker
                var rangeEnd = range.cloneRange()
                rangeEnd.collapse(false)
                insertMarker(rangeEnd, createMarker())
            }

            this.selection.removeAllRanges()
            this.selection.addRange(range)
        }
    }

    getMarkers() {
        return this.scribe.el.querySelectorAll('em.scribe-marker')
    }

    removeMarkers() {
        Array.prototype.forEach.call(this.getMarkers(), function(marker) {
            var markerParent = marker.parentNode
            nodeHelpers.removeNode(marker)
            // Placing the markers may have split a text node. Sew it up, otherwise
            // if the user presses space between the nodes the browser will insert
            // an `&nbsp;` and that will cause word wrapping issues.
            markerParent.normalize()
        })
    }

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    selectMarkers(keepMarkers?: boolean) {
        var markers = this.getMarkers()
        
        if (!markers.length) {
            return
        }

        var newRange = document.createRange()

        newRange.setStartBefore(markers[0]);
        // We always reset the end marker because otherwise it will just
        // use the current range’s end marker.
        newRange.setEndAfter(markers.length >= 2 ? markers[1] : markers[0])

        if (!keepMarkers) {
            this.removeMarkers()
        }

        this.selection.removeAllRanges()
        this.selection.addRange(newRange)
    };

    isCaretOnNewLine() {
        var containerPElement = this.getContaining(function(node) {
            return node.nodeName === 'P'
        })
        return !!containerPElement && nodeHelpers.isEmptyInlineElement(containerPElement)
    }

}
