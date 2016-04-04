import { Scribe } from "../scribe"

export class Command {

    protected scribe: Scribe

    commandName: string
    patch: Command
    event: Event // TODO necessary? only for some third-party plug-in, reportedly

    constructor(scribe: Scribe, commandName: string) {
        this.scribe = scribe
        this.commandName = commandName
        this.patch = scribe.commandPatches[this.commandName]
    }

    execute(value?): void {
        if (this.patch) {
            this.patch.execute(value)
        } else {
            this.scribe.transactionManager.run(() => {
                document.execCommand(this.commandName, false, value || null)
            })
        }
    }

    queryState(): boolean {
        if (this.patch) {
            return this.patch.queryState()
        } else {
            return document.queryCommandState(this.commandName)
        }
    }

    queryEnabled(): boolean {
        if (this.patch) {
            return this.patch.queryEnabled()
        } else {
            return document.queryCommandEnabled(this.commandName)
        }
    }
}
