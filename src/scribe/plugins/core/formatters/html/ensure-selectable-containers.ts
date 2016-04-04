import { Scribe } from "../../../../../scribe"
import nodeHelpers = require("../../../../node")

/**
 * Chrome and Firefox: All elements need to contain either text or a `<br>` to
 * remain selectable. (Unless they have a width and height explicitly set with
 * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
 */

// http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
const html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']

// TODO move into node helpers
function parentHasNoTextContent(node) {
    if (nodeHelpers.isCaretPositionNode(node)) {
        return true
    } else {
        return node.parentNode.textContent.trim() === ''
    }
}

function traverse(parentNode: Element) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild as HTMLElement

    // TODO move into node helpers:
    function isEmpty(node: HTMLElement) {
        if ((node.children.length === 0 && nodeHelpers.isBlockElement(node))
            || (node.children.length === 1 && nodeHelpers.isSelectionMarkerNode(node.children[0]))) {
            return true
        }

        // Do not insert BR in empty non block elements with parent containing text
        if (!nodeHelpers.isBlockElement(node) && node.children.length === 0) {
            return parentHasNoTextContent(node)
        }

        return false
    }

    while (node) {
        if (!nodeHelpers.isSelectionMarkerNode(node)) {
            // Find any node that contains no child *elements*, or just contains
            // whitespace, and is not self-closing
            if (isEmpty(node) && node.textContent.trim() === '' && html5VoidElements.indexOf(node.nodeName) === -1) {
                node.appendChild(document.createElement('br'))
            } else if (node.children.length > 0) {
                traverse(node)
            }
        }
        node = node.nextElementSibling as HTMLElement
    }
}

export = function() {
    return function(scribe: Scribe) {
        scribe.registerHTMLFormatter('normalize', function(html) {
            var bin = document.createElement('div')
            bin.innerHTML = html

            traverse(bin)

            return bin.innerHTML
        })
    }
}
