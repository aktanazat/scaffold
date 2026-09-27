import { registerHooks } from "node:module";

// Lets `node --test` load the app's TypeScript as Next resolves it: maps the `@/` alias to the
// repo root and adds the `.ts` extension that imports leave off.
const root = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const spec = specifier.startsWith("@/") ? new URL(specifier.slice(2), root).href : specifier;
    const local = context.parentURL && (spec.startsWith(".") || spec.startsWith("file:"));
    if (local && !/\.[cm]?[jt]sx?$/.test(spec)) return nextResolve(`${spec}.ts`, context);
    return nextResolve(spec, context);
  },
});
