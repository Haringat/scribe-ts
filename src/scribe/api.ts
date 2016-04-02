import { CommandPatch } from "./api/command-patch"
import { Command } from "./api/command"
import { ScribeSelection } from "./api/selection"
import { SimpleCommand } from "./api/simple-command"
import { Scribe } from "../scribe"

/**
 * TODO This class is essentially a factory-class, alleviating the need to manually pass
 * an instance of Scribe when constructing various objects. It's here for backwards
 * compatibility with Scribe - it should eventually be deprecated, and actual factory
 * functions should be added, instead of overloading the "new" keyword.
 */
export class ScribeApi {
    
    private scribe: Scribe
    
    constructor(scribe: Scribe) {
        this.scribe = scribe
    }
    
    CommandPatch: { new(commandName: string): CommandPatch } = <any> (
        (commandName: string) => new CommandPatch(this.scribe, commandName)
    )
    
    Command: { new(commandName: string): Command } = <any> (
        (commandName: string) => new Command(this.scribe, commandName)
    )
    
    Selection: { new() : ScribeSelection } = <any> (
        () => new ScribeSelection(this.scribe)
    )
    
    SimpleCommand: { new(commandName: string, nodeName: string) : SimpleCommand } = <any> (
        (commandName: string, nodeName: string) => new SimpleCommand(this.scribe, commandName, nodeName)
    )
    
}
