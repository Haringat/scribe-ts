import { Scribe } from "../../../../../scribe"

const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
}

var REGEX = new RegExp("(?:&|<|>|\"|'|`)", "g")

function escape(char: string) {
    return HTML_ESCAPES[char]
}

function escapeHTML(text: string) {
    return (text == null ? "" : "" + text).replace(REGEX, escape)
}

export = function() {
    return function(scribe: Scribe) {
        scribe.registerPlainTextFormatter(escapeHTML)
    }
}
