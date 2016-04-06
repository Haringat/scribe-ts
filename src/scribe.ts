import * as plugins from "./scribe/plugins/core/plugins"
import * as commands from "./scribe/plugins/core/commands"
import * as formatters from "./scribe/plugins/core/formatters"
import events = require("./scribe/plugins/core/events")
import * as patches from "./scribe/plugins/core/patches"
import { ScribeApi } from "./scribe/api"
import { TransactionManager } from "./scribe/transaction-manager"
import { ScribeUndoManager } from "./scribe/undo-manager"
import EventEmitter = require("./scribe/event-emitter")
import * as nodeHelpers from "./scribe/node"
import * as config from "./scribe/config"
import { CommandInterface } from "./scribe/api/command"
import { CommandPatch } from "./scribe/api/command-patch"
import { ScribeOptions } from "./scribe/config"

export interface ScribePlugin {
    (scribe: Scribe): void
}

export interface Filter {
    (html: string): string
}

export class Scribe extends EventEmitter {

    static node = nodeHelpers
    static element = Scribe.node // TODO eliminate duplicate

    el: HTMLElement
    commands: { [name: string]: CommandInterface }
    commandPatches: { [name: string]: CommandPatch }
    api: ScribeApi
    options: ScribeOptions
    transactionManager: TransactionManager
    undoManager: UndoManager
    _merge: boolean
    _forceMerge: boolean
    _mergeTimer = 0
    _lastItem: DOMTransaction = { content: '' } // TODO ???
    _skipFormatters: boolean

    constructor(el: HTMLElement, options: ScribeOptions) {
        super()

        this.options = config.checkOptions(options)
        this.el = el
        this.commands = {}
        this.commandPatches = {}
        
        this.api = new ScribeApi(this)

        this.transactionManager = new TransactionManager(this)

        var options = this.options

        if (options.undo.enabled) {
            if (options.undo.manager) {
                this.undoManager = options.undo.manager
            } else {
                this.undoManager = new ScribeUndoManager(options.undo.limit, this.el)
            }
            this._merge = false
            this._forceMerge = false
            this._mergeTimer = 0
            this._lastItem = { content: '' }
        }

        this.setHTML(this.getHTML())

        this.el.setAttribute('contenteditable', 'true')

        /**
         * This event triggers when either the user types something or a native
         * command is executed which causes the content to change (i.e.
         * `document.execCommand('bold')`). We can't wrap a transaction around
         * these actions, so instead we run the transaction in this event.
         */
        this.el.addEventListener('input', () => { this.transactionManager.run() }, false)

        /**
         * Core Plugins
         */
        var corePlugins = options.defaultPlugins
            .filter(config.filterByBlockLevelMode(this.allowsBlockElements()))
            .sort(config.sortByPlugin('setRootPElement')) // Ensure `setRootPElement` is always loaded first
            .map<ScribePlugin>(plugin => plugins[plugin]) // TODO avoid explicit type mapping

        // Formatters
        var defaultFormatters = options.defaultFormatters
            .filter(formatter => !!formatters[formatter])
            .map<ScribePlugin>(formatter => formatters[formatter]) // TODO avoid explicit type mapping

        // Patches

        var defaultPatches: ScribePlugin[] = [patches.events]

        var defaultCommandPatches = options.defaultCommandPatches
            .map<ScribePlugin>(patch => patches.commands[patch]) // TODO avoid explicit type mapping

        var defaultCommands = [
            'indent',
            'insertList',
            'outdent',
            'redo',
            'subscript',
            'superscript',
            'undo'
        ].map<ScribePlugin>(command => commands[command]) // TODO avoid explicit type mapping

        var allPlugins: ScribePlugin[] = [].concat(
            corePlugins,
            defaultFormatters,
            defaultPatches,
            defaultCommandPatches,
            defaultCommands)

        allPlugins.forEach(plugin => this.use(plugin))

        this.use(events)
    }

    // For plugins
    // TODO: tap combinator?
    use(configurePlugin: ScribePlugin) {
        configurePlugin(this);
        return this;
    }

    setHTML(html: string, skipFormatters: boolean = false) {
        if (this.options.undo.enabled) {
            this._lastItem.content = html;
        }

        if (skipFormatters) {
            this._skipFormatters = true;
        }
        // IE11: Setting HTML to the value it already has causes breakages elsewhere (see #336)
        if (this.el.innerHTML !== html) {
            this.el.innerHTML = html;
        }
    }

    getHTML(): string {
        return this.el.innerHTML;
    }

    getContent() {
        // Remove bogus BR element for Firefox — see explanation in BR mode files.
        return this.formatForExport(this.getHTML().replace(/<br>$/, ''));
    }

    getTextContent() {
        return this.el.textContent;
    }

    pushHistory() {
        /**
         * Chrome and Firefox: If we did push to the history, this would break
         * browser magic around `Document.queryCommandState` (http://jsbin.com/eDOxacI/1/edit?js,console,output).
         * This happens when doing any DOM manipulation.
         */

        if (this.options.undo.enabled) {
            // Get scribe previous content, and strip markers.
            var lastContentNoMarkers = this._lastItem.content.replace(/<em [^>]*class="scribe-marker"[^>]*>[^<]*?<\/em>/g, '')

            // We only want to push the history if the content actually changed.
            if (this.getHTML() !== lastContentNoMarkers) {
                var selection = new this.api.Selection()

                selection.placeMarkers()
                var content = this.getHTML()
                selection.removeMarkers()

                // Checking if there is a need to merge, and that the previous history item
                // is the last history item of the same scribe instance.
                // It is possible the last transaction is not for the same instance, or
                // even not a scribe transaction (e.g. when using a shared undo manager).
                var previousItem = this.undoManager.item(this.undoManager.position);
                if ((this._merge || this._forceMerge) && previousItem && this._lastItem == previousItem[0]) {
                    // If so, merge manually with the last item to save more memory space.
                    this._lastItem.content = content
                }
                else {
                    // Otherwise, create a new history item, and register it as a new transaction
                    this._lastItem = {
                        previousItem: this._lastItem,
                        content: content,
                        scribe: this,
                        execute: function() { },
                        undo: function() { this.scribe.restoreFromHistory(this.previousItem) },
                        redo: function() { this.scribe.restoreFromHistory(this) }
                    }

                    this.undoManager.transact(this._lastItem, false)
                }

                // Merge next transaction if it happens before the interval option, otherwise don't merge.
                clearTimeout(this._mergeTimer)
                this._merge = true
                this._mergeTimer = setTimeout(() => { this._merge = false }, this.options.undo.interval)

                return true
            }
        }

        return false
    }

    getCommand(commandName: string): CommandInterface {
        return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName)
    }

    restoreFromHistory(historyItem) {
        this._lastItem = historyItem

        this.setHTML(historyItem.content, true)

        // Restore the selection
        var selection = new this.api.Selection()
        selection.selectMarkers()

        // Because we skip the formatters, a transaction is not run, so we have to
        // emit this event ourselves.
        this.trigger('content-changed')
    }

    // This will most likely be moved to another object eventually
    allowsBlockElements(): boolean {
        return this.options.allowBlockElements
    }

    setContent(content: string) {
        if (!this.allowsBlockElements()) {
            // Set bogus BR element for Firefox — see explanation in BR mode files.
            content = content + '<br>'
        }

        this.setHTML(content)

        this.trigger('content-changed')
    }

    insertPlainText(plainText: string) {
        this.insertHTML('<p>' + this.formatForExport(plainText) + '</p>')
    }

    insertHTML(html: string) {
        /**
         * When pasting text from Google Docs in both Chrome and Firefox,
         * the resulting text will be wrapped in a B tag. So it would look
         * something like <b><p>Text</p></b>, which is invalid HTML. The command
         * insertHTML will then attempt to fix this content by moving the B tag
         * inside the P. The result is: <p><b></b></p><p>Text</p>, which is valid
         * but means an extra P is inserted into the text. To avoid this we run the
         * formatters before the insertHTML command as the formatter will
         * unwrap the P and delete the B tag. It is acceptable to remove invalid
         * HTML as Scribe should only accept valid HTML.
         *
         * See http://jsbin.com/cayosada/3/edit for more
         **/

        // TODO: error if the selection is not within the Scribe instance? Or
        // focus the Scribe instance if it is not already focused?
        this.getCommand('insertHTML').execute(this.format(html))
    }

    isDebugModeEnabled(): boolean {
        return this.options.debug
    }

    filters: { [name: string] : FilterList } = {
        text: new FilterList(),
        sanitize: new FilterList(),
        normalize: new FilterList(),
        export: new FilterList()
    }
    
    registerHTMLFormatter(phase: string, formatter: Filter) {
        this.filters[phase].add(formatter)
    }

    registerPlainTextFormatter(formatter: Filter) {
        this.filters["text"].add(formatter)
    }
    
    format(html: string): string {
        return this.filters["normalize"].filter(
            this.filters["sanitize"].filter(html)
        )
    }

    formatForExport(html: string): string {
        return this.filters["text"].filter(html)
    }
}

class FilterList {
    private filters: Filter[] = []

    filter(content: string): string {
        return this.filters.reduce((formattedData, formatter) => formatter(formattedData), content)
    }
    
    add(filter: Filter) {
        this.filters.push(filter)
    }
}
