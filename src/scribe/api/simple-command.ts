import { Scribe } from "../scribe"
import { Command } from "./command"

export class SimpleCommand extends Command {

    private _nodeName: string

    constructor(scribe: Scribe, commandName: string, nodeName: string) {
        super(scribe, commandName)

        this._nodeName = nodeName
    }

    queryState() {
        var selection = new this.scribe.api.Selection()
        
        return super.queryState() && !!selection.getContaining((node) => {
            return node.nodeName === this._nodeName
        })
    }

}
