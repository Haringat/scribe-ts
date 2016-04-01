import buildCommandPatch = require("./api/command-patch")
import buildCommand = require("./api/command")
import buildSelection = require("./api/selection")
import buildSimpleCommand = require("./api/simple-command")

  export = function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };
