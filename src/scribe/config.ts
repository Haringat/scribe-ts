import { merge } from "./util"

export interface ScribeOptions {
    allowBlockElements?: boolean
    debug?: boolean
    undo?: {
        limit?: number
        interval?: number
        enabled?: boolean
        manager?: UndoManager
    }
    defaultPlugins?: string[]
    defaultFormatters?: string[]
    defaultCommandPatches?: string[]
}

const blockModePlugins = [
    'setRootPElement',
    'enforcePElements',
    'ensureSelectableContainers',
]

const inlineModePlugins = [
    'inlineElementsMode'
]

const defaultOptions: ScribeOptions = {
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
}

/**
 * Overrides defaults with user's options
 *
 * @param  userSuppliedOptions - The user's options
 * @return - The overridden options
 */
export function checkOptions(userSuppliedOptions: ScribeOptions) {
    var options: ScribeOptions = userSuppliedOptions || {}

    // Remove invalid plugins
    if (options.defaultPlugins) {
        options.defaultPlugins = options.defaultPlugins.filter(filterByPluginExists(defaultOptions.defaultPlugins))
    }

    if (options.defaultFormatters) {
        options.defaultFormatters = options.defaultFormatters.filter(filterByPluginExists(defaultOptions.defaultFormatters))
    }

    return Object.freeze(merge(defaultOptions, options)) as ScribeOptions
}

interface Sorter {
    (a, b): number
}

/**
 * Sorts a plugin list by a specified plugin name
 *
 * @param priorityPlugin - The plugin name to be given priority
 * @return - Sorting function for the given plugin name
 */
export function sortByPlugin(priorityPlugin: string): Sorter {
    return function(pluginCurrent, pluginNext) {
        if (pluginCurrent === priorityPlugin) {
            // pluginCurrent comes before plugin next
            return -1
        } else if (pluginNext === priorityPlugin) {
            // pluginNext comes before pluginCurrent
            return 1
        }

        // Do no swap
        return 0
    }
}

interface Filter {
    (value): boolean
}

/**
 * Filters a list of plugins by block level / inline level mode.
 *
 * @param isBlockLevelMode - Whether block level mode is enabled
 * @return - Filtering function based upon the given mode
 */
export function filterByBlockLevelMode(isBlockLevelMode: boolean): Filter {
    return function(plugin) {
        return (isBlockLevelMode ? blockModePlugins : inlineModePlugins).indexOf(plugin) !== -1;
    }
}

/**
 * Filters a list of plugins by their validity
 *
 * @param  pluginList - List of plugins to check against
 * @return - Filtering function based upon the given list
 */
export function filterByPluginExists(pluginList: string[]): Filter {
    return function(plugin) {
        return pluginList.indexOf(plugin) !== -1;
    }
}
