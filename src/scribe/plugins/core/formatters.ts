import replaceNbspCharsFormatter = require("./formatters/html/replace-nbsp-chars")
import escapeHtmlCharactersFormatter = require("./formatters/plain-text/escape-html-characters")

var formatters = {
    replaceNbspCharsFormatter,
    escapeHtmlCharactersFormatter
}

export = formatters
