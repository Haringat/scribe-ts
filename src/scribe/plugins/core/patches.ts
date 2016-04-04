import bold = require("./patches/commands/bold")
import indent = require("./patches/commands/indent")
import insertHTML = require("./patches/commands/insert-html")
import insertList = require("./patches/commands/insert-list")
import outdent = require("./patches/commands/outdent")
import createLink = require("./patches/commands/create-link")
import events = require("./patches/events")

/**
 * Command patches browser inconsistencies. They do not perform core features
 * of the editor, such as ensuring P elements are created when
 * applying/unapplying commands — that is the job of the core commands.
 */

var patches = {
    commands: {
        bold,
        indent,
        insertHTML,
        insertList,
        outdent,
        createLink,
    },
    events
}

export = patches
