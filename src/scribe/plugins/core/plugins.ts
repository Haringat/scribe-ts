import setRootPElement = require("./set-root-p-element")
import enforcePElements = require("./formatters/html/enforce-p-elements")
import ensureSelectableContainers = require("./formatters/html/ensure-selectable-containers")
import inlineElementsMode = require("./inline-elements-mode")

  var plugins = {
    setRootPElement,
    enforcePElements,
    ensureSelectableContainers,
    inlineElementsMode
  }

export = plugins
