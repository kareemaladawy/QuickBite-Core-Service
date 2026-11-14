// Jest's globalSetup/globalTeardown load via plain Node `require`, which can't
// resolve the `nodenext`-style `./foo.js` imports in src (they point at `.ts`
// files pre-build). Patch Node's resolver to fall back to `.ts` for those.
import Module from "module"

const originalResolveFilename = (Module as any)._resolveFilename
;(Module as any)._resolveFilename = function (request: string, ...args: unknown[]) {
    try {
        return originalResolveFilename.call(this, request, ...args)
    } catch (error) {
        if (request.endsWith(".js")) {
            return originalResolveFilename.call(this, request.slice(0, -3) + ".ts", ...args)
        }
        throw error
    }
}
