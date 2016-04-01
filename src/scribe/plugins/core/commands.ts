import indent = require("./commands/indent")
import insertList = require("./commands/insert-list")
import outdent = require("./commands/outdent")
import redo = require("./commands/redo")
import subscript = require("./commands/subscript")
import superscript = require("./commands/superscript")
import undo = require("./commands/undo")

var plugins = {
    indent,
    insertList,
    outdent,
    redo,
    subscript,
    superscript,
    undo
}

export = plugins
