import { Scribe } from "../scribe"
import eventNames = require("../scribe/events")

export class TransactionManager {

    history = []

    private scribe: Scribe

    constructor(scribe: Scribe) {
        this.scribe = scribe
    }

    start() {
        this.history.push(1)
    }

    end() {
        this.history.pop()

        if (this.history.length === 0) {
            this.scribe.pushHistory()
            this.scribe.trigger(eventNames.legacyContentChanged)
            this.scribe.trigger(eventNames.contentChanged)
        }
    }

    run(transaction?: Function, forceMerge?: boolean) {
        this.start();
        // If there is an error, don't prevent the transaction from ending.
        try {
            if (transaction) {
                transaction();
            }
        } finally {
            this.scribe._forceMerge = forceMerge === true;
            this.end();
            this.scribe._forceMerge = false;
        }
    }
}
