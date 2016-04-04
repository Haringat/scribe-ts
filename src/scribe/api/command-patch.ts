import { Scribe } from "../scribe"

export class CommandPatch {

    scribe: Scribe

    commandName: string

    constructor(scribe: Scribe, commandName: string) {
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
