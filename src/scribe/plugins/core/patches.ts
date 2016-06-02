import commands = require("./patches/commands")
import events = require("./patches/events")

/**
 * Command patches browser inconsistencies. They do not perform core features
 * of the editor, such as ensuring P elements are created when
 * applying/unapplying commands — that is the job of the core commands.
 */

export {
    commands,
    events
}
