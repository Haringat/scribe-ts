import { Scribe } from "../../../../scribe"

export = function(scribe: Scribe) {
    scribe.commands["superscript"] = new scribe.api.Command("superscript")
}
