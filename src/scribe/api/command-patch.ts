import { Scribe } from "../../scribe"
import { CommandInterface } from "./command"

export class CommandPatch implements CommandInterface {
    
    protected scribe: Scribe
    
    event: Event
    commandName: string
    
    constructor(scribe: Scribe, commandName: string) {
        this.scribe = scribe
        this.commandName = commandName
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
