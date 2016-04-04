import { Scribe } from "../scribe"
import { Command } from "./command"

export class CommandPatch extends Command {
    
    constructor(scribe: Scribe, commandName: string) {
        super(scribe, commandName)
    }

    execute(value?) {
        this.scribe.transactionManager.run(() => {
            document.execCommand(this.commandName, false, value || null)
        })
    }

    queryState() {
        return document.queryCommandState(this.commandName)
    }

    queryEnabled() {
        return document.queryCommandEnabled(this.commandName)
    }
    
}
