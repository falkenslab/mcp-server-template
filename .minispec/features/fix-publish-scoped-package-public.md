# A server made from the template can't be published: npm asks for payment

Issue: [#2](https://github.com/falkenslab/mcp-server-template/issues/2)

## Problem

The first `npm publish` of a server made from the template fails with `E402 Payment Required - You must sign up for private packages`. docker-mcp hit it on its first release (falkenslab/docker-mcp@19a05c5). moodle-mcp doesn't, because it sets the access by hand.

## Cause

Every server is a scoped package (`@falkenslab/<name>`), and npm publishes scoped packages as private, a paid feature, unless told otherwise. The template's `package.json` has no `publishConfig`, so nothing tells npm to publish it as public.

It isn't a guard against publishing by mistake: that guard is `"private": true` (4465ce1), which `npm run init` removes from the new server (`scripts/init.mjs`). `publishConfig` has never been in the template.

## Solution

- Add `"publishConfig": { "access": "public" }` to the template's `package.json`, after `files`, as moodle-mcp has it. `"private": true` keeps blocking any publish of the template itself; `init` keeps `publishConfig` in the new server.
- A regression test that reads `package.json`: `publishConfig.access` is `"public"`, and `"private"` is `true` while it's still the template.
- The release skill's preconditions mention both: no `"private": true`, and `publishConfig.access` set to `"public"`.

## Verification

- The new test passes, with the rest of the `verify` skill.
- `npm publish --dry-run` on the template still refuses (private), and on a server after `npm run init` reports `access: public`.
