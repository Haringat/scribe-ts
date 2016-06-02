scribe-ts
=========

This is an unofficial Typescript port of [Scribe](https://github.com/guardian/scribe) by The Guardian.

At this time, this project tries to be as compatible as possible with the original Scribe - however,
there may be differences, especially in terms of internal strucure and sub-packaging.

Unlike the original Scribe, the Scribe constructor isn't exported as a top-level export, but rather
as a symbol, since it also needs to export many other symbols for external use, e.g. by plug-ins.


## Building

To build continuously during development:

    npm run watch

To build the release version for deployment:

    npm run build
