import { Scribe } from "../../../scribe"

/**
 * Sets the default content of the scribe so that each carriage return creates
 * a P.
 */

export = function(scribe: Scribe) {
    // The content might have already been set, in which case we don't want
    // to apply.
    if (scribe.getHTML().trim() === '') {
        /**
         * We have to begin with the following HTML, because otherwise some
         * browsers(?) will position the caret outside of the P when the scribe is
         * focused.
         */
        scribe.setContent('<p><br></p>')
    }
}
