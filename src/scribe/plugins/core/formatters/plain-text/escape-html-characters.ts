import escape = require("lodash-amd/modern/string/escape")

  export = function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(escape);
    };
  };
