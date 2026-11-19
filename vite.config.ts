import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['lib/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    // lodash는 peerDependency 이므로 번들에 포함하지 않는다.
    deps: { neverBundle: [/^lodash(\/.*)?$/] },
  },
  fmt: {
    singleQuote: true,
    trailingComma: 'all',
  },
});
