import { Scribe } from "../../../../scribe"

export = function(scribe: Scribe) {
    scribe.commands["subscript"] = new scribe.api.Command('subscript')
}
