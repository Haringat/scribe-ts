import { Scribe } from "../../../../scribe"

export = function() {
    return function(scribe: Scribe) {
        scribe.commands["superscript"] = new scribe.api.Command("superscript")
    }
}
