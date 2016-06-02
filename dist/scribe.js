var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("scribe/plugins/core/set-root-p-element", ["require", "exports"], function (require, exports) {
    "use strict";
    return function (scribe) {
        if (scribe.getHTML().trim() === '') {
            scribe.setContent('<p><br></p>');
        }
    };
});
define("scribe/util", ["require", "exports"], function (require, exports) {
    "use strict";
    function removeValue(array, value) {
        var i;
        while (i = array.indexOf(value), i !== -1) {
            array.splice(i, 1);
        }
    }
    exports.removeValue = removeValue;
    function toArray(values) {
        var a = [];
        for (var i = 0; i < values.length; i++) {
            a.push(values.item(i));
        }
        return a;
    }
    exports.toArray = toArray;
    function some(values, predicate) {
        for (var i = 0; i < values.length; i++) {
            if (predicate(values.item(i))) {
                return true;
            }
        }
        return false;
    }
    exports.some = some;
    function merge() {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i - 0] = arguments[_i];
        }
        function patch(target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = (typeof source[p] === 'object') && (source[p] !== null) && !(source[p] instanceof Array)
                        ? merge(target[p], source[p])
                        : source[p];
                }
            }
            return target;
        }
        var result = {};
        for (var i = 0; i < objects.length; i++) {
            patch(result, objects[i]);
        }
        return result;
    }
    exports.merge = merge;
});
define("scribe/constants", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.blockElementNames = [
        'ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD',
        'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
        'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
        'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD',
        'TH', 'TFOOT', 'UL', 'VIDEO'
    ];
    exports.inlineElementNames = [
        'B', 'BIG', 'I', 'SMALL', 'TT',
        'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 'EM', 'KBD', 'STRONG', 'SAMP', 'VAR',
        'A', 'BDO', 'BR', 'IMG', 'MAP', 'OBJECT', 'Q', 'SCRIPT', 'SPAN', 'SUB', 'SUP',
        'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'
    ];
});
define("scribe/node", ["require", "exports", "scribe/constants", "scribe/util"], function (require, exports, constants_1, util_1) {
    "use strict";
    var inlineElementSelector = constants_1.inlineElementNames
        .map(function (elName) { return elName + '[style*="line-height"]'; })
        .join(',');
    function isBlockElement(node) {
        return constants_1.blockElementNames.indexOf(node.nodeName) !== -1;
    }
    exports.isBlockElement = isBlockElement;
    function isInlineElement(node) {
        return constants_1.inlineElementNames.indexOf(node.nodeName) !== -1;
    }
    exports.isInlineElement = isInlineElement;
    function isHTMLElement(node) {
        return node.nodeType === Node.ELEMENT_NODE;
    }
    exports.isHTMLElement = isHTMLElement;
    function hasContent(node) {
        if (node && node.children && node.children.length > 0) {
            return true;
        }
        if (node && node.nodeName === 'BR') {
            return true;
        }
        return false;
    }
    exports.hasContent = hasContent;
    function isEmptyInlineElement(node) {
        if (isHTMLElement(node)) {
            if (node.children.length > 1) {
                return false;
            }
            if (node.children.length === 1 && node.textContent.trim() !== "") {
                return false;
            }
            if (node.children.length === 0) {
                return node.textContent.trim() === "";
            }
            return isEmptyInlineElement(node.children[0]);
        }
        return false;
    }
    exports.isEmptyInlineElement = isEmptyInlineElement;
    function isText(node) {
        return node.nodeType === Node.TEXT_NODE;
    }
    exports.isText = isText;
    function isEmptyTextNode(node) {
        return isText(node) && node.data === "";
    }
    exports.isEmptyTextNode = isEmptyTextNode;
    function isFragment(node) {
        return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
    }
    exports.isFragment = isFragment;
    function isBefore(node1, node2) {
        return node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING;
    }
    exports.isBefore = isBefore;
    function elementHasClass(node, className) {
        return isHTMLElement(node) && node.className === className;
    }
    function isSelectionMarkerNode(node) {
        return elementHasClass(node, "scribe-marker");
    }
    exports.isSelectionMarkerNode = isSelectionMarkerNode;
    function isCaretPositionNode(node) {
        return elementHasClass(node, "caret-position");
    }
    exports.isCaretPositionNode = isCaretPositionNode;
    function isWhitespaceOnlyTextNode(node) {
        return (node.nodeType === Node.TEXT_NODE && /^\s*$/.test(node.nodeValue));
    }
    exports.isWhitespaceOnlyTextNode = isWhitespaceOnlyTextNode;
    function firstDeepestChild(node) {
        var fs = node.firstChild;
        return !fs || fs.nodeName === "BR"
            ? node
            : firstDeepestChild(fs);
    }
    exports.firstDeepestChild = firstDeepestChild;
    function insertAfter(newNode, referenceNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    exports.insertAfter = insertAfter;
    function removeNode(node) {
        return node.parentNode.removeChild(node);
    }
    exports.removeNode = removeNode;
    function getAncestor(node, rootElement, nodeFilter) {
        function isTopContainerElement(element) {
            return rootElement === element;
        }
        if (isTopContainerElement(node)) {
            return;
        }
        var currentNode = node.parentNode;
        while (currentNode && !isTopContainerElement(currentNode)) {
            if (nodeFilter(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.parentNode;
        }
    }
    exports.getAncestor = getAncestor;
    function nextSiblings(node) {
        var all = [];
        while (node = node.nextSibling) {
            all.push(node);
        }
        return all;
    }
    exports.nextSiblings = nextSiblings;
    function wrap(nodes, parentNode) {
        nodes[0].parentNode.insertBefore(parentNode, nodes[0]);
        for (var i = 0; i < nodes.length; i++) {
            parentNode.appendChild(nodes[i]);
        }
        return parentNode;
    }
    exports.wrap = wrap;
    function unwrap(node, childNode) {
        while (childNode.childNodes.length > 0) {
            node.insertBefore(childNode.childNodes[0], childNode);
        }
        node.removeChild(childNode);
    }
    exports.unwrap = unwrap;
    function wrapChildNodes(parentNode) {
        var index = 0;
        util_1.toArray(parentNode.childNodes)
            .filter(function (node) {
            return !isWhitespaceOnlyTextNode(node);
        })
            .filter(function (node) {
            return node.nodeType === Node.TEXT_NODE || !isBlockElement(node);
        })
            .reduce(function (result, node, key, list) {
            index += (key === 0 || node.previousSibling === list[key - 1]) ? 0 : 1;
            if (result[index]) {
                result[index].push(node);
            }
            else {
                result[index] = [node];
            }
            return result;
        }, [])
            .forEach(function (nodeGroup) {
            wrap(nodeGroup, document.createElement('p'));
        });
    }
    exports.wrapChildNodes = wrapChildNodes;
    function removeChromeArtifacts(parentElement) {
        if (isHTMLElement(parentElement)) {
            var nodes = util_1.toArray(parentElement.querySelectorAll(inlineElementSelector))
                .filter(function (el) { return isInlineWithStyle(window.getComputedStyle(parentElement), el); });
            var emptySpans = [];
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                node.style.lineHeight = null;
                if (!node.getAttribute("style")) {
                    node.removeAttribute("style");
                }
                if (node.nodeName === "SPAN" && node.attributes.length === 0) {
                    emptySpans.push(node);
                }
            }
            for (var _a = 0, emptySpans_1 = emptySpans; _a < emptySpans_1.length; _a++) {
                var node = emptySpans_1[_a];
                unwrap(node.parentNode, node);
            }
        }
    }
    exports.removeChromeArtifacts = removeChromeArtifacts;
    function isInlineWithStyle(parentStyle, element) {
        return window.getComputedStyle(element).lineHeight === parentStyle.lineHeight;
    }
});
define("scribe/plugins/core/formatters/html/enforce-p-elements", ["require", "exports", "scribe/node"], function (require, exports, nodeHelpers) {
    "use strict";
    return function (scribe) {
        function traverse(parentNode) {
            var i = 0, node;
            while (node = parentNode.children[i++]) {
                if (node.tagName === 'BLOCKQUOTE') {
                    nodeHelpers.wrapChildNodes(node);
                }
            }
        }
        scribe.registerHTMLFormatter('normalize', function (html) {
            var bin = document.createElement('div');
            bin.innerHTML = html;
            nodeHelpers.wrapChildNodes(bin);
            traverse(bin);
            return bin.innerHTML;
        });
    };
});
define("scribe/plugins/core/formatters/html/ensure-selectable-containers", ["require", "exports", "scribe/node"], function (require, exports, nodeHelpers) {
    "use strict";
    var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
    function parentHasNoTextContent(node) {
        if (nodeHelpers.isCaretPositionNode(node)) {
            return true;
        }
        else {
            return node.parentNode.textContent.trim() === '';
        }
    }
    function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        function isEmpty(node) {
            if ((node.children.length === 0 && nodeHelpers.isBlockElement(node))
                || (node.children.length === 1 && nodeHelpers.isSelectionMarkerNode(node.children[0]))) {
                return true;
            }
            if (!nodeHelpers.isBlockElement(node) && node.children.length === 0) {
                return parentHasNoTextContent(node);
            }
            return false;
        }
        while (node) {
            if (!nodeHelpers.isSelectionMarkerNode(node)) {
                if (isEmpty(node) && node.textContent.trim() === '' && html5VoidElements.indexOf(node.nodeName) === -1) {
                    node.appendChild(document.createElement('br'));
                }
                else if (node.children.length > 0) {
                    traverse(node);
                }
            }
            node = node.nextElementSibling;
        }
    }
    return function (scribe) {
        scribe.registerHTMLFormatter('normalize', function (html) {
            var bin = document.createElement('div');
            bin.innerHTML = html;
            traverse(bin);
            return bin.innerHTML;
        });
    };
});
define("scribe/plugins/core/inline-elements-mode", ["require", "exports", "scribe/node"], function (require, exports, node) {
    "use strict";
    var ENTER = 13;
    function hasContent(rootNode) {
        var treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ALL, null, false);
        while (treeWalker.nextNode()) {
            if (treeWalker.currentNode) {
                if (node.hasContent(treeWalker.currentNode)) {
                    return true;
                }
            }
        }
        return false;
    }
    return function (scribe) {
        scribe.el.addEventListener('keydown', function (event) {
            if (event.keyCode === ENTER) {
                var selection = new scribe.api.Selection();
                var range = selection.range;
                var blockNode = selection.getContaining(function (node) { return node.nodeName === 'LI' || (/^(H[1-6])$/).test(node.nodeName); });
                if (!blockNode) {
                    event.preventDefault();
                    scribe.transactionManager.run(function () {
                        if (scribe.el.lastChild.nodeName === 'BR') {
                            scribe.el.removeChild(scribe.el.lastChild);
                        }
                        var brNode = document.createElement('br');
                        range.insertNode(brNode);
                        range.collapse(false);
                        var contentToEndRange = range.cloneRange();
                        contentToEndRange.setEndAfter(scribe.el.lastChild);
                        var contentToEndFragment = contentToEndRange.cloneContents();
                        if (!hasContent(contentToEndFragment)) {
                            var bogusBrNode = document.createElement('br');
                            range.insertNode(bogusBrNode);
                        }
                        var newRange = range.cloneRange();
                        newRange.setStartAfter(brNode);
                        newRange.setEndAfter(brNode);
                        selection.selection.removeAllRanges();
                        selection.selection.addRange(newRange);
                    });
                }
            }
        });
        if (scribe.getHTML().trim() === '') {
            scribe.setContent('');
        }
    };
});
define("scribe/plugins/core/plugins", ["require", "exports", "scribe/plugins/core/set-root-p-element", "scribe/plugins/core/formatters/html/enforce-p-elements", "scribe/plugins/core/formatters/html/ensure-selectable-containers", "scribe/plugins/core/inline-elements-mode"], function (require, exports, setRootPElement, enforcePElements, ensureSelectableContainers, inlineElementsMode) {
    "use strict";
    exports.setRootPElement = setRootPElement;
    exports.enforcePElements = enforcePElements;
    exports.ensureSelectableContainers = ensureSelectableContainers;
    exports.inlineElementsMode = inlineElementsMode;
});
define("scribe/api/command-patch", ["require", "exports"], function (require, exports) {
    "use strict";
    var CommandPatch = (function () {
        function CommandPatch(scribe, commandName) {
            this.scribe = scribe;
            this.commandName = commandName;
        }
        CommandPatch.prototype.execute = function (value) {
            var _this = this;
            this.scribe.transactionManager.run(function () {
                document.execCommand(_this.commandName, false, value || null);
            });
        };
        CommandPatch.prototype.queryState = function () {
            return document.queryCommandState(this.commandName);
        };
        CommandPatch.prototype.queryEnabled = function () {
            return document.queryCommandEnabled(this.commandName);
        };
        return CommandPatch;
    }());
    exports.CommandPatch = CommandPatch;
});
define("scribe/api/command", ["require", "exports"], function (require, exports) {
    "use strict";
    var Command = (function () {
        function Command(scribe, commandName) {
            this.scribe = scribe;
            this.commandName = commandName;
        }
        Object.defineProperty(Command.prototype, "patch", {
            get: function () {
                return this.scribe.commandPatches[this.commandName];
            },
            enumerable: true,
            configurable: true
        });
        Command.prototype.execute = function (value) {
            var _this = this;
            if (this.patch) {
                this.patch.execute(value);
            }
            else {
                this.scribe.transactionManager.run(function () {
                    document.execCommand(_this.commandName, false, value || null);
                });
            }
        };
        Command.prototype.queryState = function () {
            if (this.patch) {
                return this.patch.queryState();
            }
            else {
                return document.queryCommandState(this.commandName);
            }
        };
        Command.prototype.queryEnabled = function () {
            if (this.patch) {
                return this.patch.queryEnabled();
            }
            else {
                return document.queryCommandEnabled(this.commandName);
            }
        };
        return Command;
    }());
    exports.Command = Command;
});
define("scribe/plugins/core/commands/indent", ["require", "exports", "scribe/api/command"], function (require, exports, command_1) {
    "use strict";
    var IndentCommand = (function (_super) {
        __extends(IndentCommand, _super);
        function IndentCommand(scribe) {
            _super.call(this, scribe, "indent");
        }
        IndentCommand.prototype.queryEnabled = function () {
            var selection = new this.scribe.api.Selection();
            var listElement = selection.getContaining(function (element) { return element.nodeName === 'UL' || element.nodeName === 'OL'; });
            return _super.prototype.queryEnabled.call(this) && this.scribe.allowsBlockElements() && !listElement;
        };
        return IndentCommand;
    }(command_1.Command));
    return function (scribe) {
        scribe.commands["indent"] = new IndentCommand(scribe);
    };
});
define("scribe/plugins/core/commands/insert-list", ["require", "exports", "scribe/api/command", "scribe/node", "scribe/util"], function (require, exports, command_2, nodeHelpers, util_2) {
    "use strict";
    var InsertListCommand = (function (_super) {
        __extends(InsertListCommand, _super);
        function InsertListCommand() {
            _super.apply(this, arguments);
        }
        InsertListCommand.prototype.execute = function (value) {
            function splitList(listItemElements) {
                if (!!listItemElements.length) {
                    var newListNode = document.createElement(listNode.nodeName);
                    while (listItemElements.length > 0) {
                        newListNode.appendChild(listItemElements[0]);
                        listItemElements.shift();
                    }
                    listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
                }
            }
            if (this.queryState()) {
                var selection = new this.scribe.api.Selection();
                var range = selection.range;
                var listNode = selection.getContaining(function (node) { return node.nodeName === 'OL' || node.nodeName === 'UL'; });
                var listItemElement = selection.getContaining(function (node) { return node.nodeName === 'LI'; });
                this.scribe.transactionManager.run(function () {
                    if (listItemElement) {
                        var nextListItemElements = nodeHelpers.nextSiblings(listItemElement);
                        splitList(nextListItemElements);
                        selection.placeMarkers();
                        var pNode = document.createElement('p');
                        pNode.innerHTML = listItemElement.innerHTML;
                        listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
                        listItemElement.parentNode.removeChild(listItemElement);
                    }
                    else {
                        var selectedListItemElements = util_2.toArray(listNode.querySelectorAll('li'))
                            .filter(function (listItemElement) {
                            return range.intersectsNode(listItemElement);
                        });
                        var lastSelectedListItemElement = selectedListItemElements[selectedListItemElements.length - 1];
                        var listItemElementsAfterSelection = nodeHelpers.nextSiblings(lastSelectedListItemElement);
                        splitList(listItemElementsAfterSelection);
                        selection.placeMarkers();
                        var documentFragment = document.createDocumentFragment();
                        selectedListItemElements.forEach(function (listItemElement) {
                            var pElement = document.createElement('p');
                            pElement.innerHTML = listItemElement.innerHTML;
                            documentFragment.appendChild(pElement);
                        });
                        listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);
                        selectedListItemElements.forEach(function (listItemElement) {
                            listItemElement.parentNode.removeChild(listItemElement);
                        });
                    }
                    if (listNode.childNodes.length === 0) {
                        listNode.parentNode.removeChild(listNode);
                    }
                    selection.selectMarkers();
                });
            }
            else {
                _super.prototype.execute.call(this, value);
            }
        };
        InsertListCommand.prototype.queryEnabled = function () {
            return _super.prototype.queryEnabled.call(this) && this.scribe.allowsBlockElements();
        };
        return InsertListCommand;
    }(command_2.Command));
    return function (scribe) {
        scribe.commands["insertOrderedList"] = new InsertListCommand(scribe, 'insertOrderedList');
        scribe.commands["insertUnorderedList"] = new InsertListCommand(scribe, 'insertUnorderedList');
    };
});
define("scribe/plugins/core/commands/outdent", ["require", "exports", "scribe/api/command"], function (require, exports, command_3) {
    "use strict";
    var OutdentCommand = (function (_super) {
        __extends(OutdentCommand, _super);
        function OutdentCommand(scribe) {
            _super.call(this, scribe, "outdent");
        }
        OutdentCommand.prototype.queryEnabled = function () {
            var selection = new this.scribe.api.Selection();
            var listElement = selection.getContaining(function (element) { return element.nodeName === 'UL' || element.nodeName === 'OL'; });
            return _super.prototype.queryEnabled.call(this) && this.scribe.allowsBlockElements() && !listElement;
        };
        return OutdentCommand;
    }(command_3.Command));
    return function (scribe) {
        scribe.commands["outdent"] = new OutdentCommand(scribe);
    };
});
define("scribe/keystrokes", ["require", "exports"], function (require, exports) {
    "use strict";
    var Z_KEY = 90;
    function isUndoKeyCombination(event) {
        return !event.shiftKey && (event.metaKey || (event.ctrlKey && !event.altKey)) && event.keyCode === Z_KEY;
    }
    exports.isUndoKeyCombination = isUndoKeyCombination;
    function isRedoKeyCombination(event) {
        return event.shiftKey && (event.metaKey || (event.ctrlKey && !event.altKey)) && event.keyCode === Z_KEY;
    }
    exports.isRedoKeyCombination = isRedoKeyCombination;
});
define("scribe/plugins/core/commands/redo", ["require", "exports", "scribe/api/command", "scribe/keystrokes"], function (require, exports, command_4, keystrokes_1) {
    "use strict";
    var RedoCommand = (function (_super) {
        __extends(RedoCommand, _super);
        function RedoCommand(scribe) {
            var _this = this;
            _super.call(this, scribe, "redo");
            if (scribe.options.undo.enabled) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (keystrokes_1.isRedoKeyCombination(event)) {
                        event.preventDefault();
                        _this.execute();
                    }
                });
            }
        }
        RedoCommand.prototype.execute = function () {
            this.scribe.undoManager.redo();
        };
        RedoCommand.prototype.queryEnabled = function () {
            return this.scribe.undoManager.position > 0;
        };
        return RedoCommand;
    }(command_4.Command));
    return function (scribe) {
        scribe.commands["redo"] = new RedoCommand(scribe);
    };
});
define("scribe/plugins/core/commands/subscript", ["require", "exports"], function (require, exports) {
    "use strict";
    return function (scribe) {
        scribe.commands["subscript"] = new scribe.api.Command('subscript');
    };
});
define("scribe/plugins/core/commands/superscript", ["require", "exports"], function (require, exports) {
    "use strict";
    return function (scribe) {
        scribe.commands["superscript"] = new scribe.api.Command("superscript");
    };
});
define("scribe/plugins/core/commands/undo", ["require", "exports", "scribe/api/command", "scribe/keystrokes"], function (require, exports, command_5, keystrokes_2) {
    "use strict";
    var UndoCommand = (function (_super) {
        __extends(UndoCommand, _super);
        function UndoCommand(scribe) {
            var _this = this;
            _super.call(this, scribe, "undo");
            if (scribe.options.undo.enabled) {
                scribe.el.addEventListener('keydown', function (event) {
                    if (keystrokes_2.isUndoKeyCombination(event)) {
                        event.preventDefault();
                        _this.execute();
                    }
                });
            }
        }
        UndoCommand.prototype.execute = function () {
            this.scribe.undoManager.undo();
        };
        UndoCommand.prototype.queryEnabled = function () {
            return this.scribe.undoManager.position < this.scribe.undoManager.length;
        };
        return UndoCommand;
    }(command_5.Command));
    return function (scribe) {
        scribe.commands["undo"] = new UndoCommand(scribe);
    };
});
define("scribe/plugins/core/commands", ["require", "exports", "scribe/plugins/core/commands/indent", "scribe/plugins/core/commands/insert-list", "scribe/plugins/core/commands/outdent", "scribe/plugins/core/commands/redo", "scribe/plugins/core/commands/subscript", "scribe/plugins/core/commands/superscript", "scribe/plugins/core/commands/undo"], function (require, exports, indent, insertList, outdent, redo, subscript, superscript, undo) {
    "use strict";
    exports.indent = indent;
    exports.insertList = insertList;
    exports.outdent = outdent;
    exports.redo = redo;
    exports.subscript = subscript;
    exports.superscript = superscript;
    exports.undo = undo;
});
define("scribe/plugins/core/formatters/html/replace-nbsp-chars", ["require", "exports"], function (require, exports) {
    "use strict";
    return function (scribe) {
        var nbspCharRegExp = /(\s|&nbsp;)+/g;
        scribe.registerHTMLFormatter('export', function (html) {
            return html.replace(nbspCharRegExp, ' ');
        });
    };
});
define("scribe/plugins/core/formatters/plain-text/escape-html-characters", ["require", "exports"], function (require, exports) {
    "use strict";
    var HTML_ESCAPES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
    };
    var REGEX = new RegExp("(?:&|<|>|\"|'|`)", "g");
    function escape(char) {
        return HTML_ESCAPES[char];
    }
    function escapeHTML(text) {
        return (text == null ? "" : "" + text).replace(REGEX, escape);
    }
    return function (scribe) {
        scribe.registerPlainTextFormatter(escapeHTML);
    };
});
define("scribe/plugins/core/formatters", ["require", "exports", "scribe/plugins/core/formatters/html/replace-nbsp-chars", "scribe/plugins/core/formatters/plain-text/escape-html-characters"], function (require, exports, replaceNbspCharsFormatter, escapeHtmlCharactersFormatter) {
    "use strict";
    exports.replaceNbspCharsFormatter = replaceNbspCharsFormatter;
    exports.escapeHtmlCharactersFormatter = escapeHtmlCharactersFormatter;
});
define("scribe/mutations", ["require", "exports"], function (require, exports) {
    "use strict";
    var MockObserver = (function () {
        function MockObserver(callback) {
        }
        MockObserver.prototype.disconnect = function () { };
        MockObserver.prototype.observe = function (target, options) { };
        MockObserver.prototype.takeRecords = function () { return []; };
        return MockObserver;
    }());
    function determineMutationObserver(window) {
        if (typeof MutationObserver !== "undefined") {
            return MutationObserver;
        }
        if (typeof WebKitMutationObserver !== "undefined") {
            return WebKitMutationObserver;
        }
        if (typeof MozMutationObserver !== "undefined") {
            return MozMutationObserver;
        }
        return MockObserver;
    }
    exports.determineMutationObserver = determineMutationObserver;
});
define("scribe/dom-observer", ["require", "exports", "scribe/node", "scribe/mutations", "scribe/util"], function (require, exports, node_1, mutations_1, util_3) {
    "use strict";
    var maybeWindow = typeof window === 'object' ? window : undefined;
    var MutationObserver = mutations_1.determineMutationObserver(maybeWindow);
    function hasRealMutation(node) {
        return !node_1.isEmptyTextNode(node) && !node_1.isSelectionMarkerNode(node);
    }
    function includeRealMutations(mutations) {
        return mutations.some(function (mutation) {
            return util_3.some(mutation.addedNodes, hasRealMutation)
                || util_3.some(mutation.removedNodes, hasRealMutation);
        });
    }
    return function observeDomChanges(el, callback) {
        var runningPostMutation = false;
        var observer = new MutationObserver(function (mutations) {
            if (!runningPostMutation && includeRealMutations(mutations)) {
                runningPostMutation = true;
                try {
                    callback();
                }
                catch (e) {
                    throw e;
                }
                finally {
                    setTimeout(function () { runningPostMutation = false; }, 0);
                }
            }
        });
        observer.observe(el, {
            childList: true,
            subtree: true
        });
        return observer;
    };
});
define("scribe/plugins/core/events", ["require", "exports", "scribe/dom-observer", "scribe/node", "scribe/util"], function (require, exports, observeDomChanges, nodeHelpers, util_4) {
    "use strict";
    var ENTER = 13;
    var BACKSPACE = 8;
    return function (scribe) {
        scribe.el.addEventListener('focus', function placeCaretOnFocus() {
            var selection = new scribe.api.Selection();
            if (selection.range) {
                var isFirefoxBug = scribe.allowsBlockElements() &&
                    selection.range.startContainer === scribe.el;
                if (isFirefoxBug) {
                    var focusElement = nodeHelpers.firstDeepestChild(scribe.el);
                    var range = selection.range;
                    range.setStart(focusElement, 0);
                    range.setEnd(focusElement, 0);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);
                }
            }
        });
        function applyFormatters() {
            if (!scribe._skipFormatters) {
                var selection = new scribe.api.Selection();
                var isEditorActive = selection.range;
                var runFormatters = function () {
                    if (isEditorActive) {
                        selection.placeMarkers();
                    }
                    scribe.setHTML(scribe.format(scribe.getHTML()));
                    selection.selectMarkers();
                };
                scribe.transactionManager.run(runFormatters);
            }
            delete scribe._skipFormatters;
        }
        observeDomChanges(scribe.el, applyFormatters);
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keydown', function (event) {
                if (event.keyCode === ENTER) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    var headingNode = selection.getContaining(function (node) {
                        return (/^(H[1-6])$/).test(node.nodeName);
                    });
                    if (headingNode && range.collapsed) {
                        var contentToEndRange = range.cloneRange();
                        contentToEndRange.setEndAfter(headingNode);
                        var contentToEndFragment = contentToEndRange.cloneContents();
                        if (contentToEndFragment.firstChild.textContent === '') {
                            event.preventDefault();
                            scribe.transactionManager.run(function () {
                                var pNode = document.createElement('p');
                                var brNode = document.createElement('br');
                                pNode.appendChild(brNode);
                                headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);
                                range.setStart(pNode, 0);
                                range.setEnd(pNode, 0);
                                selection.selection.removeAllRanges();
                                selection.selection.addRange(range);
                            });
                        }
                    }
                }
            });
        }
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keydown', function (event) {
                if (event.keyCode === ENTER || event.keyCode === BACKSPACE) {
                    var selection = new scribe.api.Selection();
                    var range = selection.range;
                    if (range.collapsed) {
                        var containerLIElement = selection.getContaining(function (node) { return node.nodeName === 'LI'; });
                        if (containerLIElement && containerLIElement.textContent.trim() === '') {
                            event.preventDefault();
                            var listNode = selection.getContaining(function (node) { return node.nodeName === 'UL' || node.nodeName === 'OL'; });
                            var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
                            command.event = event;
                            command.execute();
                        }
                    }
                }
            });
        }
        scribe.el.addEventListener('paste', function handlePaste(event) {
            if (event.clipboardData && event.clipboardData.types.length > 0) {
                event.preventDefault();
                if (util_4.toArray(event.clipboardData.types).indexOf('text/html') !== -1) {
                    scribe.insertHTML(event.clipboardData.getData('text/html'));
                }
                else {
                    scribe.insertPlainText(event.clipboardData.getData('text/plain'));
                }
            }
            else {
                var selection = new scribe.api.Selection();
                selection.placeMarkers();
                var bin = document.createElement('div');
                document.body.appendChild(bin);
                bin.setAttribute('contenteditable', 'true');
                bin.focus();
                setTimeout(function () {
                    var data = bin.innerHTML;
                    bin.parentNode.removeChild(bin);
                    selection.selectMarkers();
                    scribe.el.focus();
                    scribe.insertHTML(data);
                }, 1);
            }
        });
    };
});
define("scribe/events", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.contentChanged = "scribe:content-changed";
    exports.legacyContentChanged = "content-changed";
    exports.destroy = "scribe:destroy";
});
define("scribe/plugins/core/patches/commands/bold", ["require", "exports", "scribe/api/command-patch"], function (require, exports, command_patch_1) {
    "use strict";
    var BoldCommand = (function (_super) {
        __extends(BoldCommand, _super);
        function BoldCommand(scribe) {
            _super.call(this, scribe, "bold");
        }
        BoldCommand.prototype.queryEnabled = function () {
            var selection = new this.scribe.api.Selection();
            var headingNode = selection.getContaining(function (node) { return (/^(H[1-6])$/).test(node.nodeName); });
            return _super.prototype.queryEnabled.call(this) && !headingNode;
        };
        return BoldCommand;
    }(command_patch_1.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["bold"] = new BoldCommand(scribe);
    };
});
define("scribe/plugins/core/patches/commands/indent", ["require", "exports", "scribe/api/command-patch"], function (require, exports, command_patch_2) {
    "use strict";
    var INVISIBLE_CHAR = '\uFEFF';
    var IndentCommand = (function (_super) {
        __extends(IndentCommand, _super);
        function IndentCommand(scribe) {
            _super.call(this, scribe, "indent");
        }
        IndentCommand.prototype.execute = function (value) {
            var _this = this;
            this.scribe.transactionManager.run(function () {
                var selection = new _this.scribe.api.Selection();
                var range = selection.range;
                var ancestor = range.commonAncestorContainer;
                var isCaretOnNewLine = (ancestor.nodeName === 'P') && (ancestor.innerHTML === '<br>');
                if (isCaretOnNewLine) {
                    var textNode = document.createTextNode(INVISIBLE_CHAR);
                    range.insertNode(textNode);
                    range.setStart(textNode, 0);
                    range.setEnd(textNode, 0);
                    selection.selection.removeAllRanges();
                    selection.selection.addRange(range);
                }
                _super.prototype.execute.call(_this, value);
                selection = new _this.scribe.api.Selection();
                var blockquoteNode = selection.getContaining(function (node) { return node.nodeName === 'BLOCKQUOTE'; });
                if (blockquoteNode) {
                    blockquoteNode.removeAttribute('style');
                }
            });
        };
        return IndentCommand;
    }(command_patch_2.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["indent"] = new IndentCommand(scribe);
    };
});
define("scribe/plugins/core/patches/commands/insert-html", ["require", "exports", "scribe/api/command-patch", "scribe/node"], function (require, exports, command_patch_3, nodeHelpers) {
    "use strict";
    var InsertHTMLCommand = (function (_super) {
        __extends(InsertHTMLCommand, _super);
        function InsertHTMLCommand(scribe) {
            _super.call(this, scribe, "insertHTML");
        }
        InsertHTMLCommand.prototype.execute = function (value) {
            var _this = this;
            this.scribe.transactionManager.run(function () {
                _super.prototype.execute.call(_this, value);
                nodeHelpers.removeChromeArtifacts(_this.scribe.el);
            });
        };
        return InsertHTMLCommand;
    }(command_patch_3.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["insertHTML"] = new InsertHTMLCommand(scribe);
    };
});
define("scribe/plugins/core/patches/commands/insert-list", ["require", "exports", "scribe/api/command-patch", "scribe/node"], function (require, exports, command_patch_4, nodeHelpers) {
    "use strict";
    var InsertListCommandPatch = (function (_super) {
        __extends(InsertListCommandPatch, _super);
        function InsertListCommandPatch(scribe, commandName) {
            _super.call(this, scribe, commandName);
        }
        InsertListCommandPatch.prototype.execute = function (value) {
            var _this = this;
            this.scribe.transactionManager.run(function () {
                _super.prototype.execute.call(_this, value);
                if (_this.queryState()) {
                    var selection = new _this.scribe.api.Selection();
                    var listElement = selection.getContaining(function (node) { return node.nodeName === 'OL' || node.nodeName === 'UL'; });
                    if (listElement.nextElementSibling && listElement.nextElementSibling.childNodes.length === 0) {
                        nodeHelpers.removeNode(listElement.nextElementSibling);
                    }
                    if (listElement) {
                        var listParentNode = listElement.parentNode;
                        if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                            selection.placeMarkers();
                            nodeHelpers.insertAfter(listElement, listParentNode);
                            selection.selectMarkers();
                            if (listParentNode.childNodes.length === 2 && nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                                nodeHelpers.removeNode(listParentNode);
                            }
                            if (listParentNode.childNodes.length === 0) {
                                nodeHelpers.removeNode(listParentNode);
                            }
                        }
                    }
                    nodeHelpers.removeChromeArtifacts(listElement);
                }
            });
        };
        InsertListCommandPatch.prototype.queryState = function () {
            try {
                return _super.prototype.queryState.call(this);
            }
            catch (err) {
                if (err.name == 'NS_ERROR_UNEXPECTED') {
                    return false;
                }
                else {
                    throw err;
                }
            }
        };
        return InsertListCommandPatch;
    }(command_patch_4.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["insertOrderedList"] = new InsertListCommandPatch(scribe, "insertOrderedList");
        scribe.commandPatches["insertUnorderedList"] = new InsertListCommandPatch(scribe, "insertUnorderedList");
    };
});
define("scribe/plugins/core/patches/commands/outdent", ["require", "exports", "scribe/api/command-patch", "scribe/node"], function (require, exports, command_patch_5, nodeHelpers) {
    "use strict";
    var OutdentCommand = (function (_super) {
        __extends(OutdentCommand, _super);
        function OutdentCommand(scribe) {
            _super.call(this, scribe, "outdent");
        }
        OutdentCommand.prototype.execute = function () {
            var _this = this;
            this.scribe.transactionManager.run(function () {
                var selection = new _this.scribe.api.Selection();
                var range = selection.range;
                var blockquoteNode = selection.getContaining(function (node) { return node.nodeName === 'BLOCKQUOTE'; });
                if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
                    selection.placeMarkers();
                    selection.selectMarkers(true);
                    var selectedNodes = range.cloneContents();
                    blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
                    range.deleteContents();
                    selection.selectMarkers();
                    if (blockquoteNode.textContent === '') {
                        blockquoteNode.parentNode.removeChild(blockquoteNode);
                    }
                }
                else {
                    var pNode = selection.getContaining(function (node) {
                        return node.nodeName === 'P';
                    });
                    if (pNode) {
                        var nextSiblingNodes = nodeHelpers.nextSiblings(pNode);
                        if (!!nextSiblingNodes.length) {
                            var newContainerNode = document.createElement(blockquoteNode.nodeName);
                            while (!!nextSiblingNodes.length) {
                                newContainerNode.appendChild(nextSiblingNodes[0]);
                                nextSiblingNodes.shift();
                            }
                            blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
                        }
                        selection.placeMarkers();
                        blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
                        selection.selectMarkers();
                        if (blockquoteNode.innerHTML === '') {
                            blockquoteNode.parentNode.removeChild(blockquoteNode);
                        }
                    }
                    else {
                        _super.prototype.execute.call(_this);
                    }
                }
            });
        };
        return OutdentCommand;
    }(command_patch_5.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["outdent"] = new OutdentCommand(scribe);
    };
});
define("scribe/plugins/core/patches/commands/create-link", ["require", "exports", "scribe/api/command-patch"], function (require, exports, command_patch_6) {
    "use strict";
    var CreateLinkCommand = (function (_super) {
        __extends(CreateLinkCommand, _super);
        function CreateLinkCommand(scribe) {
            _super.call(this, scribe, "createLink");
        }
        CreateLinkCommand.prototype.execute = function (value) {
            var selection = new this.scribe.api.Selection();
            if (selection.range.collapsed) {
                var aElement = document.createElement('a');
                aElement.setAttribute('href', value);
                aElement.textContent = value;
                selection.range.insertNode(aElement);
                var newRange = document.createRange();
                newRange.setStartBefore(aElement);
                newRange.setEndAfter(aElement);
                selection.selection.removeAllRanges();
                selection.selection.addRange(newRange);
            }
            else {
                _super.prototype.execute.call(this, value);
            }
        };
        return CreateLinkCommand;
    }(command_patch_6.CommandPatch));
    return function (scribe) {
        scribe.commandPatches["createLink"] = new CreateLinkCommand(scribe);
    };
});
define("scribe/plugins/core/patches/commands", ["require", "exports", "scribe/plugins/core/patches/commands/bold", "scribe/plugins/core/patches/commands/indent", "scribe/plugins/core/patches/commands/insert-html", "scribe/plugins/core/patches/commands/insert-list", "scribe/plugins/core/patches/commands/outdent", "scribe/plugins/core/patches/commands/create-link"], function (require, exports, bold, indent, insertHTML, insertList, outdent, createLink) {
    "use strict";
    exports.bold = bold;
    exports.indent = indent;
    exports.insertHTML = insertHTML;
    exports.insertList = insertList;
    exports.outdent = outdent;
    exports.createLink = createLink;
});
define("scribe/plugins/core/patches/events", ["require", "exports", "scribe/node"], function (require, exports, nodeHelpers) {
    "use strict";
    var BACKSPACE = 8;
    var DELETE = 46;
    return function (scribe) {
        if (scribe.allowsBlockElements()) {
            scribe.el.addEventListener('keyup', function (event) {
                if (event.keyCode === BACKSPACE || event.keyCode === DELETE) {
                    var selection = new scribe.api.Selection();
                    var containerPElement = selection.getContaining(function (node) { return node.nodeName === 'P'; });
                    if (containerPElement) {
                        scribe.transactionManager.run(function () {
                            selection.placeMarkers();
                            nodeHelpers.removeChromeArtifacts(containerPElement);
                            selection.selectMarkers();
                        }, true);
                    }
                }
            });
        }
    };
});
define("scribe/plugins/core/patches", ["require", "exports", "scribe/plugins/core/patches/commands", "scribe/plugins/core/patches/events"], function (require, exports, commands, events) {
    "use strict";
    exports.commands = commands;
    exports.events = events;
});
define("scribe/api/selection", ["require", "exports", "scribe/node"], function (require, exports, nodeHelpers) {
    "use strict";
    function createMarker() {
        var node = document.createElement('em');
        node.style.display = 'none';
        node.classList.add('scribe-marker');
        return node;
    }
    function insertMarker(range, marker) {
        range.insertNode(marker);
        if (marker.nextSibling && nodeHelpers.isEmptyTextNode(marker.nextSibling)) {
            nodeHelpers.removeNode(marker.nextSibling);
        }
        if (marker.previousSibling && nodeHelpers.isEmptyTextNode(marker.previousSibling)) {
            nodeHelpers.removeNode(marker.previousSibling);
        }
    }
    var ScribeSelection = (function () {
        function ScribeSelection(scribe) {
            this.scribe = scribe;
            this.rootDoc = scribe.el.ownerDocument;
            if (this.rootDoc.compareDocumentPosition(scribe.el) & Node.DOCUMENT_POSITION_DISCONNECTED) {
                var currentElement = scribe.el.parentNode;
                while (currentElement && nodeHelpers.isFragment(currentElement)) {
                    currentElement = currentElement.parentNode;
                }
                if (currentElement && currentElement["getSelection"]) {
                    this.rootDoc = currentElement;
                }
            }
            this.selection = this.rootDoc.getSelection();
            if (this.selection.rangeCount && this.selection.anchorNode) {
                var startNode = this.selection.anchorNode;
                var startOffset = this.selection.anchorOffset;
                var endNode = this.selection.focusNode;
                var endOffset = this.selection.focusOffset;
                if (startNode === endNode && endOffset < startOffset) {
                    var tmp = startOffset;
                    startOffset = endOffset;
                    endOffset = tmp;
                }
                else if (nodeHelpers.isBefore(endNode, startNode)) {
                    var tmpNode = startNode;
                    var tmpOffset = startOffset;
                    startNode = endNode;
                    startOffset = endOffset;
                    endNode = tmpNode;
                    endOffset = tmpOffset;
                }
                this.range = document.createRange();
                this.range.setStart(startNode, startOffset);
                this.range.setEnd(endNode, endOffset);
            }
        }
        ScribeSelection.prototype.getContaining = function (nodeFilter) {
            var range = this.range;
            if (!range) {
                return;
            }
            var node = this.range.commonAncestorContainer;
            return !(node && this.scribe.el === node) && nodeFilter(node)
                ? node
                : nodeHelpers.getAncestor(node, this.scribe.el, nodeFilter);
        };
        ;
        ScribeSelection.prototype.placeMarkers = function () {
            var range = this.range;
            if (!range) {
                return;
            }
            if (!document.contains(this.scribe.el)) {
                return;
            }
            if (this.scribe.el.contains(range.startContainer) && this.scribe.el.contains(range.endContainer)) {
                insertMarker(range.cloneRange(), createMarker());
                if (!range.collapsed) {
                    var rangeEnd = range.cloneRange();
                    rangeEnd.collapse(false);
                    insertMarker(rangeEnd, createMarker());
                }
                this.selection.removeAllRanges();
                this.selection.addRange(range);
            }
        };
        ScribeSelection.prototype.getMarkers = function () {
            return this.scribe.el.querySelectorAll('em.scribe-marker');
        };
        ScribeSelection.prototype.removeMarkers = function () {
            Array.prototype.forEach.call(this.getMarkers(), function (marker) {
                var markerParent = marker.parentNode;
                nodeHelpers.removeNode(marker);
                markerParent.normalize();
            });
        };
        ScribeSelection.prototype.selectMarkers = function (keepMarkers) {
            var markers = this.getMarkers();
            if (!markers.length) {
                return;
            }
            var newRange = document.createRange();
            newRange.setStartBefore(markers[0]);
            newRange.setEndAfter(markers.length >= 2 ? markers[1] : markers[0]);
            if (!keepMarkers) {
                this.removeMarkers();
            }
            this.selection.removeAllRanges();
            this.selection.addRange(newRange);
        };
        ;
        ScribeSelection.prototype.isCaretOnNewLine = function () {
            var containerPElement = this.getContaining(function (node) {
                return node.nodeName === 'P';
            });
            return !!containerPElement && nodeHelpers.isEmptyInlineElement(containerPElement);
        };
        return ScribeSelection;
    }());
    exports.ScribeSelection = ScribeSelection;
});
define("scribe/api/simple-command", ["require", "exports", "scribe/api/command"], function (require, exports, command_6) {
    "use strict";
    var SimpleCommand = (function (_super) {
        __extends(SimpleCommand, _super);
        function SimpleCommand(scribe, commandName, nodeName) {
            _super.call(this, scribe, commandName);
            this._nodeName = nodeName;
        }
        SimpleCommand.prototype.queryState = function () {
            var _this = this;
            var selection = new this.scribe.api.Selection();
            return _super.prototype.queryState.call(this) && !!selection.getContaining(function (node) {
                return node.nodeName === _this._nodeName;
            });
        };
        return SimpleCommand;
    }(command_6.Command));
    exports.SimpleCommand = SimpleCommand;
});
define("scribe/api", ["require", "exports", "scribe/api/command-patch", "scribe/api/command", "scribe/api/selection", "scribe/api/simple-command"], function (require, exports, command_patch_7, command_7, selection_1, simple_command_1) {
    "use strict";
    var ScribeApi = (function () {
        function ScribeApi(scribe) {
            var _this = this;
            this.CommandPatch = (function (commandName) { return new command_patch_7.CommandPatch(_this.scribe, commandName); });
            this.Command = (function (commandName) { return new command_7.Command(_this.scribe, commandName); });
            this.Selection = (function () { return new selection_1.ScribeSelection(_this.scribe); });
            this.SimpleCommand = (function (commandName, nodeName) { return new simple_command_1.SimpleCommand(_this.scribe, commandName, nodeName); });
            this.scribe = scribe;
        }
        return ScribeApi;
    }());
    exports.ScribeApi = ScribeApi;
});
define("scribe/transaction-manager", ["require", "exports", "scribe/events"], function (require, exports, eventNames) {
    "use strict";
    var TransactionManager = (function () {
        function TransactionManager(scribe) {
            this.history = [];
            this.scribe = scribe;
        }
        TransactionManager.prototype.start = function () {
            this.history.push(1);
        };
        TransactionManager.prototype.end = function () {
            this.history.pop();
            if (this.history.length === 0) {
                this.scribe.pushHistory();
                this.scribe.trigger(eventNames.legacyContentChanged);
                this.scribe.trigger(eventNames.contentChanged);
            }
        };
        TransactionManager.prototype.run = function (transaction, forceMerge) {
            this.start();
            try {
                if (transaction) {
                    transaction();
                }
            }
            finally {
                this.scribe._forceMerge = forceMerge === true;
                this.end();
                this.scribe._forceMerge = false;
            }
        };
        return TransactionManager;
    }());
    exports.TransactionManager = TransactionManager;
});
define("scribe/undo-manager", ["require", "exports"], function (require, exports) {
    "use strict";
    var ScribeUndoManager = (function () {
        function ScribeUndoManager(limit, undoScopeHost) {
            this._stack = [];
            this._limit = limit;
            this._fireEvent = (typeof CustomEvent != 'undefined' && undoScopeHost != null && undoScopeHost.dispatchEvent != null);
            this._ush = undoScopeHost;
            this.position = 0;
            this.length = 0;
        }
        ScribeUndoManager.prototype.transact = function (transaction, merge) {
            if (arguments.length < 2) {
                throw new TypeError('Not enough arguments to UndoManager.transact.');
            }
            transaction.execute();
            if (this.position > 0) {
                this.clearRedo();
            }
            var transactions;
            if (merge && this.length) {
                this._stack[0].push(transaction);
                this._stack.shift();
                this._stack.unshift(transactions);
            }
            else {
                transactions = [transaction];
                this._stack.unshift(transactions);
                this.length++;
                if (this._limit && this.length > this._limit) {
                    this.clearUndo(this._limit);
                }
            }
            this._dispatch('DOMTransaction', transactions);
        };
        ScribeUndoManager.prototype.undo = function () {
            if (this.position >= this.length) {
                return;
            }
            var transactions = this._stack[this.position];
            var i = transactions.length;
            while (i--) {
                transactions[i].undo();
            }
            this.position++;
            this._dispatch('undo', transactions);
        };
        ;
        ScribeUndoManager.prototype.redo = function () {
            if (this.position === 0) {
                return;
            }
            this.position--;
            var transactions = this._stack[this.position];
            for (var i = 0; i < transactions.length; i++) {
                transactions[i].redo();
            }
            this._dispatch('redo', transactions);
        };
        ;
        ScribeUndoManager.prototype.item = function (index) {
            return index >= 0 && index < this.length ?
                this._stack[index] :
                null;
        };
        ScribeUndoManager.prototype.clearUndo = function (position) {
            this._stack.length = position !== undefined ? position : this.position;
            this.length = this._stack.length;
        };
        ScribeUndoManager.prototype.clearRedo = function () {
            this._stack = this._stack.slice(this.position);
            this.length = this._stack.length;
            this.position = 0;
        };
        ScribeUndoManager.prototype._dispatch = function (event, transactions) {
            if (this._fireEvent) {
                this._ush.dispatchEvent(new CustomEvent(event, {
                    detail: { transactions: transactions },
                    bubbles: true,
                    cancelable: false
                }));
            }
        };
        return ScribeUndoManager;
    }());
    exports.ScribeUndoManager = ScribeUndoManager;
});
define("scribe/event-emitter", ["require", "exports", "scribe/util"], function (require, exports, util_5) {
    "use strict";
    var EventEmitter = (function () {
        function EventEmitter() {
            this._listeners = {};
        }
        EventEmitter.prototype.on = function (name, listener) {
            if (!this._listeners[name]) {
                this._listeners[name] = [];
            }
            this._listeners[name].push(listener);
        };
        EventEmitter.prototype.off = function (name, listener) {
            if (listener) {
                util_5.removeValue(this._listeners[name], listener);
            }
            else {
                this._listeners[name] = [];
            }
        };
        EventEmitter.prototype.trigger = function (name, args) {
            if (args === void 0) { args = []; }
            var events = name.split(":");
            while (events.length > 0) {
                var current = events.join(":");
                var listeners = this._listeners[current];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, args); });
                }
                events.pop();
            }
        };
        return EventEmitter;
    }());
    exports.EventEmitter = EventEmitter;
});
define("scribe/config", ["require", "exports", "scribe/util"], function (require, exports, util_6) {
    "use strict";
    var blockModePlugins = [
        'setRootPElement',
        'enforcePElements',
        'ensureSelectableContainers',
    ];
    var inlineModePlugins = [
        'inlineElementsMode'
    ];
    var defaultOptions = {
        allowBlockElements: true,
        debug: false,
        undo: {
            manager: null,
            enabled: true,
            limit: 100,
            interval: 250
        },
        defaultCommandPatches: [
            'bold',
            'indent',
            'insertHTML',
            'insertList',
            'outdent',
            'createLink'
        ],
        defaultPlugins: blockModePlugins.concat(inlineModePlugins),
        defaultFormatters: [
            'escapeHtmlCharactersFormatter',
            'replaceNbspCharsFormatter'
        ]
    };
    function checkOptions(userSuppliedOptions) {
        var options = userSuppliedOptions || {};
        if (options.defaultPlugins) {
            options.defaultPlugins = options.defaultPlugins.filter(filterByPluginExists(defaultOptions.defaultPlugins));
        }
        if (options.defaultFormatters) {
            options.defaultFormatters = options.defaultFormatters.filter(filterByPluginExists(defaultOptions.defaultFormatters));
        }
        return Object.freeze(util_6.merge(defaultOptions, options));
    }
    exports.checkOptions = checkOptions;
    function sortByPlugin(priorityPlugin) {
        return function (pluginCurrent, pluginNext) {
            if (pluginCurrent === priorityPlugin) {
                return -1;
            }
            else if (pluginNext === priorityPlugin) {
                return 1;
            }
            return 0;
        };
    }
    exports.sortByPlugin = sortByPlugin;
    function filterByBlockLevelMode(isBlockLevelMode) {
        return function (plugin) {
            return (isBlockLevelMode ? blockModePlugins : inlineModePlugins).indexOf(plugin) !== -1;
        };
    }
    exports.filterByBlockLevelMode = filterByBlockLevelMode;
    function filterByPluginExists(pluginList) {
        return function (plugin) {
            return pluginList.indexOf(plugin) !== -1;
        };
    }
    exports.filterByPluginExists = filterByPluginExists;
});
define("scribe", ["require", "exports", "scribe/plugins/core/plugins", "scribe/plugins/core/commands", "scribe/plugins/core/formatters", "scribe/plugins/core/events", "scribe/events", "scribe/plugins/core/patches", "scribe/api", "scribe/transaction-manager", "scribe/undo-manager", "scribe/event-emitter", "scribe/node", "scribe/config"], function (require, exports, plugins, commands, formatters, events, eventNames, patches, api_1, transaction_manager_1, undo_manager_1, event_emitter_1, nodeHelpers, config) {
    "use strict";
    var FilterList = (function () {
        function FilterList() {
            this.filters = [];
        }
        FilterList.prototype.filter = function (content) {
            return this.filters.reduce(function (formattedData, formatter) { return formatter(formattedData); }, content);
        };
        FilterList.prototype.add = function (filter) {
            this.filters.push(filter);
        };
        return FilterList;
    }());
    exports.FilterList = FilterList;
    var Scribe = (function (_super) {
        __extends(Scribe, _super);
        function Scribe(el, options) {
            var _this = this;
            _super.call(this);
            this._mergeTimer = 0;
            this._lastItem = { content: '' };
            this.filters = {
                text: new FilterList(),
                sanitize: new FilterList(),
                normalize: new FilterList(),
                export: new FilterList()
            };
            this.options = config.checkOptions(options);
            this.el = el;
            this.commands = {};
            this.commandPatches = {};
            this.api = new api_1.ScribeApi(this);
            this.transactionManager = new transaction_manager_1.TransactionManager(this);
            var options = this.options;
            if (options.undo.enabled) {
                if (options.undo.manager) {
                    this.undoManager = options.undo.manager;
                }
                else {
                    this.undoManager = new undo_manager_1.ScribeUndoManager(options.undo.limit, this.el);
                }
                this._merge = false;
                this._forceMerge = false;
                this._mergeTimer = 0;
                this._lastItem = { content: '' };
            }
            this.setHTML(this.getHTML());
            this.el.setAttribute('contenteditable', 'true');
            this.el.addEventListener('input', function () { _this.transactionManager.run(); }, false);
            var corePlugins = options.defaultPlugins
                .filter(config.filterByBlockLevelMode(this.allowsBlockElements()))
                .sort(config.sortByPlugin('setRootPElement'))
                .map(function (plugin) { return plugins[plugin]; });
            var defaultFormatters = options.defaultFormatters
                .filter(function (formatter) { return !!formatters[formatter]; })
                .map(function (formatter) { return formatters[formatter]; });
            var defaultPatches = [patches.events];
            var defaultCommandPatches = options.defaultCommandPatches
                .map(function (patch) { return patches.commands[patch]; });
            var defaultCommands = [
                'indent',
                'insertList',
                'outdent',
                'redo',
                'subscript',
                'superscript',
                'undo'
            ].map(function (command) { return commands[command]; });
            var allPlugins = [].concat(corePlugins, defaultFormatters, defaultPatches, defaultCommandPatches, defaultCommands);
            allPlugins.forEach(function (plugin) { return _this.use(plugin); });
            this.use(events);
        }
        Scribe.prototype.use = function (configurePlugin) {
            configurePlugin(this);
            return this;
        };
        Scribe.prototype.setHTML = function (html, skipFormatters) {
            if (skipFormatters === void 0) { skipFormatters = false; }
            if (this.options.undo.enabled) {
                this._lastItem.content = html;
            }
            if (skipFormatters) {
                this._skipFormatters = true;
            }
            if (this.el.innerHTML !== html) {
                this.el.innerHTML = html;
            }
        };
        Scribe.prototype.getHTML = function () {
            return this.el.innerHTML;
        };
        Scribe.prototype.getContent = function () {
            return this.formatForExport(this.getHTML().replace(/<br>$/, ''));
        };
        Scribe.prototype.getTextContent = function () {
            return this.el.textContent;
        };
        Scribe.prototype.pushHistory = function () {
            var _this = this;
            if (this.options.undo.enabled) {
                var lastContentNoMarkers = this._lastItem.content.replace(/<em [^>]*class="scribe-marker"[^>]*>[^<]*?<\/em>/g, '');
                if (this.getHTML() !== lastContentNoMarkers) {
                    var selection = new this.api.Selection();
                    selection.placeMarkers();
                    var content = this.getHTML();
                    selection.removeMarkers();
                    var previousItem = this.undoManager.item(this.undoManager.position);
                    if ((this._merge || this._forceMerge) && previousItem && this._lastItem == previousItem[0]) {
                        this._lastItem.content = content;
                    }
                    else {
                        this._lastItem = {
                            previousItem: this._lastItem,
                            content: content,
                            scribe: this,
                            execute: function () { },
                            undo: function () { this.scribe.restoreFromHistory(this.previousItem); },
                            redo: function () { this.scribe.restoreFromHistory(this); }
                        };
                        this.undoManager.transact(this._lastItem, false);
                    }
                    clearTimeout(this._mergeTimer);
                    this._merge = true;
                    this._mergeTimer = setTimeout(function () { _this._merge = false; }, this.options.undo.interval);
                    return true;
                }
            }
            return false;
        };
        Scribe.prototype.getCommand = function (commandName) {
            return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
        };
        Scribe.prototype.restoreFromHistory = function (historyItem) {
            this._lastItem = historyItem;
            this.setHTML(historyItem.content, true);
            var selection = new this.api.Selection();
            selection.selectMarkers();
            this.trigger(eventNames.legacyContentChanged);
            this.trigger(eventNames.contentChanged);
        };
        Scribe.prototype.allowsBlockElements = function () {
            return this.options.allowBlockElements;
        };
        Scribe.prototype.setContent = function (content) {
            if (!this.allowsBlockElements()) {
                content = content + '<br>';
            }
            this.setHTML(content);
            this.trigger(eventNames.legacyContentChanged);
            this.trigger(eventNames.contentChanged);
        };
        Scribe.prototype.insertPlainText = function (plainText) {
            this.insertHTML('<p>' + this.formatForExport(plainText) + '</p>');
        };
        Scribe.prototype.insertHTML = function (html) {
            this.getCommand('insertHTML').execute(this.format(html));
        };
        Scribe.prototype.isDebugModeEnabled = function () {
            return this.options.debug;
        };
        Scribe.prototype.registerHTMLFormatter = function (phase, formatter) {
            this.filters[phase].add(formatter);
        };
        Scribe.prototype.registerPlainTextFormatter = function (formatter) {
            this.filters["text"].add(formatter);
        };
        Scribe.prototype.format = function (html) {
            return this.filters["normalize"].filter(this.filters["sanitize"].filter(html));
        };
        Scribe.prototype.formatForExport = function (html) {
            return this.filters["text"].filter(html);
        };
        Scribe.prototype.destroy = function () {
            this.trigger(eventNames.destroy);
        };
        Scribe.node = nodeHelpers;
        Scribe.element = Scribe.node;
        return Scribe;
    }(event_emitter_1.EventEmitter));
    exports.Scribe = Scribe;
});
//# sourceMappingURL=scribe.js.map