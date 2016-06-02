declare module "scribe/plugins/core/set-root-p-element" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/util" {
    export type ItemList<T> = {
        length: number;
        item(i: number): T;
    };
    export type Predicate<T> = {
        (value: T): boolean;
    };
    export function removeValue(array: any[], value: any): void;
    export function toArray<T>(values: ItemList<T>): Array<T>;
    export function some<T>(values: ItemList<T>, predicate: Predicate<T>): boolean;
    export function merge(...objects: Object[]): Object;
}
declare module "scribe/constants" {
    export const blockElementNames: string[];
    export const inlineElementNames: string[];
}
declare module "scribe/node" {
    export function isBlockElement(node: Node): node is Element;
    export function isInlineElement(node: Node): node is Element;
    export function isHTMLElement(node: Node): node is HTMLElement;
    export function hasContent(node: any): boolean;
    export function isEmptyInlineElement(node: Node): boolean;
    export function isText(node: Node): node is CharacterData;
    export function isEmptyTextNode(node: Node): boolean;
    export function isFragment(node: Node): boolean;
    export function isBefore(node1: Node, node2: Node): number;
    export function isSelectionMarkerNode(node: Node): node is HTMLElement;
    export function isCaretPositionNode(node: Node): node is HTMLElement;
    export function isWhitespaceOnlyTextNode(node: Node): boolean;
    export function firstDeepestChild(node: Node): Node;
    export function insertAfter(newNode: Node, referenceNode: Node): Node;
    export function removeNode(node: Node): Node;
    export type NodeFilter = {
        (node: Node): boolean;
    };
    export function getAncestor(node: Node, rootElement: Node, nodeFilter: NodeFilter): Node;
    export function nextSiblings(node: Node): Node[];
    export function wrap(nodes: Node[], parentNode: Node): Node;
    export function unwrap(node: Node, childNode: Node): void;
    export function wrapChildNodes(parentNode: Node): void;
    export function removeChromeArtifacts(parentElement: Node): void;
}
declare module "scribe/plugins/core/formatters/html/enforce-p-elements" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/formatters/html/ensure-selectable-containers" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/inline-elements-mode" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/plugins" {
    import setRootPElement = require("scribe/plugins/core/set-root-p-element");
    import enforcePElements = require("scribe/plugins/core/formatters/html/enforce-p-elements");
    import ensureSelectableContainers = require("scribe/plugins/core/formatters/html/ensure-selectable-containers");
    import inlineElementsMode = require("scribe/plugins/core/inline-elements-mode");
    export { setRootPElement, enforcePElements, ensureSelectableContainers, inlineElementsMode };
}
declare module "scribe/api/command-patch" {
    import { Scribe } from "scribe";
    import { CommandInterface } from "scribe/api/command";
    export class CommandPatch implements CommandInterface {
        protected scribe: Scribe;
        event: Event;
        commandName: string;
        constructor(scribe: Scribe, commandName: string);
        execute(value?: any): void;
        queryState(): boolean;
        queryEnabled(): boolean;
    }
}
declare module "scribe/api/command" {
    import { Scribe } from "scribe";
    import { CommandPatch } from "scribe/api/command-patch";
    export interface CommandInterface {
        event: Event;
        commandName: string;
        execute(value?: any): void;
        queryState(): boolean;
        queryEnabled(): boolean;
    }
    export class Command implements CommandInterface {
        protected scribe: Scribe;
        commandName: string;
        event: Event;
        constructor(scribe: Scribe, commandName: string);
        patch: CommandPatch;
        execute(value?: any): void;
        queryState(): boolean;
        queryEnabled(): boolean;
    }
}
declare module "scribe/plugins/core/commands/indent" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands/insert-list" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands/outdent" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/keystrokes" {
    export function isUndoKeyCombination(event: KeyboardEvent): boolean;
    export function isRedoKeyCombination(event: KeyboardEvent): boolean;
}
declare module "scribe/plugins/core/commands/redo" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands/subscript" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands/superscript" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands/undo" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/commands" {
    import indent = require("scribe/plugins/core/commands/indent");
    import insertList = require("scribe/plugins/core/commands/insert-list");
    import outdent = require("scribe/plugins/core/commands/outdent");
    import redo = require("scribe/plugins/core/commands/redo");
    import subscript = require("scribe/plugins/core/commands/subscript");
    import superscript = require("scribe/plugins/core/commands/superscript");
    import undo = require("scribe/plugins/core/commands/undo");
    export { indent, insertList, outdent, redo, subscript, superscript, undo };
}
declare module "scribe/plugins/core/formatters/html/replace-nbsp-chars" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/formatters/plain-text/escape-html-characters" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/formatters" {
    import replaceNbspCharsFormatter = require("scribe/plugins/core/formatters/html/replace-nbsp-chars");
    import escapeHtmlCharactersFormatter = require("scribe/plugins/core/formatters/plain-text/escape-html-characters");
    export { replaceNbspCharsFormatter, escapeHtmlCharactersFormatter };
}
declare module "scribe/mutations" {
    export function determineMutationObserver(window: Window): typeof MutationObserver;
}
declare module "scribe/dom-observer" {
    declare var _default: (el: Node, callback: Function) => MutationObserver;
    export = _default;
}
declare module "scribe/plugins/core/events" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/events" {
    export const contentChanged: string;
    export const legacyContentChanged: string;
    export const destroy: string;
}
declare module "scribe/plugins/core/patches/commands/bold" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands/indent" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands/insert-html" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands/insert-list" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands/outdent" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands/create-link" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches/commands" {
    import bold = require("scribe/plugins/core/patches/commands/bold");
    import indent = require("scribe/plugins/core/patches/commands/indent");
    import insertHTML = require("scribe/plugins/core/patches/commands/insert-html");
    import insertList = require("scribe/plugins/core/patches/commands/insert-list");
    import outdent = require("scribe/plugins/core/patches/commands/outdent");
    import createLink = require("scribe/plugins/core/patches/commands/create-link");
    export { bold, indent, insertHTML, insertList, outdent, createLink };
}
declare module "scribe/plugins/core/patches/events" {
    import { Scribe } from "scribe";
    declare var _default: (scribe: Scribe) => void;
    export = _default;
}
declare module "scribe/plugins/core/patches" {
    import commands = require("scribe/plugins/core/patches/commands");
    import events = require("scribe/plugins/core/patches/events");
    export { commands, events };
}
declare module "scribe/api/selection" {
    import { Scribe } from "scribe";
    export class ScribeSelection {
        private scribe;
        private rootDoc;
        selection: Selection;
        range: Range;
        constructor(scribe: Scribe);
        getContaining(nodeFilter: any): Node;
        placeMarkers(): void;
        getMarkers(): NodeListOf<Element>;
        removeMarkers(): void;
        selectMarkers(keepMarkers?: boolean): void;
        isCaretOnNewLine(): boolean;
    }
}
declare module "scribe/api/simple-command" {
    import { Scribe } from "scribe";
    import { Command } from "scribe/api/command";
    export class SimpleCommand extends Command {
        private _nodeName;
        constructor(scribe: Scribe, commandName: string, nodeName: string);
        queryState(): boolean;
    }
}
declare module "scribe/api" {
    import { CommandPatch } from "scribe/api/command-patch";
    import { Command } from "scribe/api/command";
    import { ScribeSelection } from "scribe/api/selection";
    import { SimpleCommand } from "scribe/api/simple-command";
    import { Scribe } from "scribe";
    export class ScribeApi {
        private scribe;
        constructor(scribe: Scribe);
        CommandPatch: {
            new (commandName: string): CommandPatch;
        };
        Command: {
            new (commandName: string): Command;
        };
        Selection: {
            new (): ScribeSelection;
        };
        SimpleCommand: {
            new (commandName: string, nodeName: string): SimpleCommand;
        };
    }
}
declare module "scribe/transaction-manager" {
    import { Scribe } from "scribe";
    export class TransactionManager {
        history: any[];
        private scribe;
        constructor(scribe: Scribe);
        start(): void;
        end(): void;
        run(transaction?: Function, forceMerge?: boolean): void;
    }
}
declare module "scribe/undo-manager" {
    export class ScribeUndoManager implements UndoManager {
        private _ush;
        private _stack;
        private _limit;
        private _fireEvent;
        position: number;
        length: number;
        constructor(limit: number, undoScopeHost: HTMLElement);
        transact(transaction: DOMTransaction, merge: boolean): void;
        undo(): void;
        redo(): void;
        item(index: number): DOMTransaction[];
        clearUndo(position?: number): void;
        clearRedo(): void;
        _dispatch(event: string, transactions: DOMTransaction[]): void;
    }
}
declare module "scribe/event-emitter" {
    export class EventEmitter {
        private _listeners;
        constructor();
        on(name: string, listener: Function): void;
        off(name: string, listener?: Function): void;
        trigger(name: string, args?: any[]): void;
    }
}
declare module "scribe/config" {
    export interface ScribeOptions {
        allowBlockElements?: boolean;
        debug?: boolean;
        undo?: {
            limit?: number;
            interval?: number;
            enabled?: boolean;
            manager?: UndoManager;
        };
        defaultPlugins?: string[];
        defaultFormatters?: string[];
        defaultCommandPatches?: string[];
    }
    export function checkOptions(userSuppliedOptions: ScribeOptions): ScribeOptions;
    export interface Sorter {
        (a: any, b: any): number;
    }
    export function sortByPlugin(priorityPlugin: string): Sorter;
    export interface Filter {
        (value: any): boolean;
    }
    export function filterByBlockLevelMode(isBlockLevelMode: boolean): Filter;
    export function filterByPluginExists(pluginList: string[]): Filter;
}
declare module "scribe" {
    import { ScribeApi } from "scribe/api";
    import { TransactionManager } from "scribe/transaction-manager";
    import { EventEmitter } from "scribe/event-emitter";
    import * as nodeHelpers from "scribe/node";
    import { CommandInterface } from "scribe/api/command";
    import { CommandPatch } from "scribe/api/command-patch";
    import { ScribeOptions } from "scribe/config";
    export interface ScribePlugin {
        (scribe: Scribe): void;
    }
    export interface Filter {
        (html: string): string;
    }
    export class FilterList {
        private filters;
        filter(content: string): string;
        add(filter: Filter): void;
    }
    export class Scribe extends EventEmitter {
        static node: typeof nodeHelpers;
        static element: typeof nodeHelpers;
        el: HTMLElement;
        commands: {
            [name: string]: CommandInterface;
        };
        commandPatches: {
            [name: string]: CommandPatch;
        };
        api: ScribeApi;
        options: ScribeOptions;
        transactionManager: TransactionManager;
        undoManager: UndoManager;
        _merge: boolean;
        _forceMerge: boolean;
        _mergeTimer: number;
        _lastItem: any;
        _skipFormatters: boolean;
        constructor(el: HTMLElement, options: ScribeOptions);
        use(configurePlugin: ScribePlugin): this;
        setHTML(html: string, skipFormatters?: boolean): void;
        getHTML(): string;
        getContent(): string;
        getTextContent(): string;
        pushHistory(): boolean;
        getCommand(commandName: string): CommandInterface;
        restoreFromHistory(historyItem: any): void;
        allowsBlockElements(): boolean;
        setContent(content: string): void;
        insertPlainText(plainText: string): void;
        insertHTML(html: string): void;
        isDebugModeEnabled(): boolean;
        filters: {
            [name: string]: FilterList;
        };
        registerHTMLFormatter(phase: string, formatter: Filter): void;
        registerPlainTextFormatter(formatter: Filter): void;
        format(html: string): string;
        formatForExport(html: string): string;
        destroy(): void;
    }
}
