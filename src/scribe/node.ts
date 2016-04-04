import { blockElementNames, inlineElementNames } from "./constants"
import { toArray } from "./util"

const inlineElementSelector = inlineElementNames
    .map(elName => elName + '[style*="line-height"]')
    .join(',')

export function isBlockElement(node: Node): node is Element {
    return blockElementNames.indexOf(node.nodeName) !== -1
}

export function isInlineElement(node: Node): node is Element {
    return inlineElementNames.indexOf(node.nodeName) !== -1
}

export function isHTMLElement(node: Node): node is HTMLElement {
    return node.nodeType === Node.ELEMENT_NODE
}

/// return true if nested inline tags ultimately just contain <br> or ""
export function isEmptyInlineElement(node: Node): boolean {
    if (isHTMLElement(node)) {
        if (node.children.length > 1) {
            return false
        }

        if (node.children.length === 1 && node.textContent.trim() !== "") {
            return false
        }

        if (node.children.length === 0) {
            return node.textContent.trim() === ""
        }

        return isEmptyInlineElement(node.children[0])
    }

    return false
}

export function isText(node: Node): node is CharacterData {
    return node.nodeType === Node.TEXT_NODE
}

export function isEmptyTextNode(node: Node): boolean {
    return isText(node) && node.data === ""
}

export function isFragment(node: Node): boolean {
    return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
}

export function isBefore(node1: Node, node2: Node) {
    return node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING
}

function elementHasClass(node: Node, className: string): boolean {
    return isHTMLElement(node) && node.className === className
}

export function isSelectionMarkerNode(node: Node): node is HTMLElement {
    return elementHasClass(node, "scribe-marker")
}

export function isCaretPositionNode(node: Node): node is HTMLElement {
    return elementHasClass(node, "caret-position")
}

export function isWhitespaceOnlyTextNode(node: Node) {
    return (node.nodeType === Node.TEXT_NODE && /^\s*$/.test(node.nodeValue))
}

export function firstDeepestChild(node: Node): Node {
    var fs = node.firstChild

    return !fs || fs.nodeName === "BR"
        ? node
        : firstDeepestChild(fs)
}

export function insertAfter(newNode: Node, referenceNode: Node): Node {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

export function removeNode(node: Node): Node {
    return node.parentNode.removeChild(node)
}

type NodeFilter = { (node: Node): boolean }

export function getAncestor(node: Node, rootElement: Node, nodeFilter: NodeFilter): Node {
    function isTopContainerElement(element: Node) {
        return rootElement === element
    }
    // TODO: should this happen here?
    if (isTopContainerElement(node)) {
        return
    }

    var currentNode = node.parentNode

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while (currentNode && !isTopContainerElement(currentNode)) {
        if (nodeFilter(currentNode)) {
            return currentNode
        }

        currentNode = currentNode.parentNode
    }
}

export function nextSiblings(node: Node): Node[] {
    var all: Node[] = []

    while (node = node.nextSibling) {
        all.push(node)
    }

    return all
}

export function wrap(nodes: Node[], parentNode: Node): Node {
    nodes[0].parentNode.insertBefore(parentNode, nodes[0])

    for (var i = 0; i < nodes.length; i++) {
        parentNode.appendChild(nodes[i]);
    }

    return parentNode
}

export function unwrap(node: Node, childNode: Node) {
    while (childNode.childNodes.length > 0) {
        node.insertBefore(childNode.childNodes[0], childNode)
    }

    node.removeChild(childNode)
}

/**
 * Wrap consecutive inline elements and text nodes in a P element.
 */
export function wrapChildNodes(parentNode: Node) {
    var index = 0

    toArray(parentNode.childNodes)
        .filter(function(node) {
            return !isWhitespaceOnlyTextNode(node)
        })
        .filter(function(node) {
            return node.nodeType === Node.TEXT_NODE || !isBlockElement(node)
        })
        .reduce<Node[][]>(function(result, node, key, list) {
            index += (key === 0 || node.previousSibling === list[key - 1]) ? 0 : 1
            if (result[index]) {
                result[index].push(node)
            } else {
                result[index] = [node]
            }
            return result
        }, [])
        .forEach(function(nodeGroup) {
            wrap(nodeGroup, document.createElement('p'))
        })
}

/**
 * Chrome: If a parent node has a CSS `line-height` when we apply the
 * insertHTML command, Chrome appends a SPAN to plain content with
 * inline styling replicating that `line-height`, and adjusts the
 * `line-height` on inline elements.
 *
 * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
 * More from the web: http://stackoverflow.com/q/15015019/40352
 */
export function removeChromeArtifacts(parentElement: Node) {
    if (isHTMLElement(parentElement)) {
        var nodes = toArray(parentElement.querySelectorAll(inlineElementSelector) as NodeListOf<HTMLElement>)
            .filter(el => isInlineWithStyle(window.getComputedStyle(parentElement), el))

        var emptySpans: Node[] = []

        for (let node of nodes) {
            node.style.lineHeight = null

            if (!node.getAttribute("style")) {
                node.removeAttribute("style");
            }

            if (node.nodeName === "SPAN" && node.attributes.length === 0) {
                emptySpans.push(node);
            }
        }

        for (let node of emptySpans) {
            unwrap(node.parentNode, node);
        }
    }
}

function isInlineWithStyle(parentStyle: CSSStyleDeclaration, element: Element): boolean {
    return window.getComputedStyle(element).lineHeight === parentStyle.lineHeight;
}
