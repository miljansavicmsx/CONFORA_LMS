# Generator Provenance

MD15_GENERATOR_PROVENANCE_PROVEN = true
MD15_GENERATOR_COMMAND = npm --prefix packages/i18n run build
MD15_PACKAGE_SCRIPT = tsc -b tsconfig.build.json --force
MD15_SOURCE_PATHS = packages/i18n/src/**, packages/i18n/locales/**
MD15_CONFIG_PATHS = packages/i18n/tsconfig.build.json, packages/i18n/tsconfig.json
MD15_OUTPUT_PATH = packages/i18n/dist/index.js
MD15_TOOLCHAIN = typescript
MD15_DETERMINISTIC = true
MD15_NETWORK_AFTER_INSTALL = false
MD15_ENV_SPECIFIC = false

MD16_GENERATOR_PROVENANCE_PROVEN = true
MD16_GENERATOR_COMMAND = npm --prefix packages/i18n run build
MD16_PACKAGE_SCRIPT = tsc -b tsconfig.build.json --force
MD16_SOURCE_PATHS = packages/i18n/src/react.tsx and dependencies
MD16_OUTPUT_PATH = packages/i18n/dist/react.js
MD16_TOOLCHAIN = typescript
MD16_DETERMINISTIC = true
MD16_NETWORK_AFTER_INSTALL = false
MD16_ENV_SPECIFIC = false

MD17_GENERATOR_PROVENANCE_PROVEN = true
MD17_GENERATOR_COMMAND = npm --prefix packages/ui run build
MD17_PACKAGE_SCRIPT = tsc -b tsconfig.build.json --force && tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify
MD17_SOURCE_PATHS = packages/ui/src/styles.css, packages/ui/tailwind.config.ts
MD17_CONFIG_PATHS = packages/ui/postcss.config.cjs, packages/ui/tsconfig.build.json
MD17_OUTPUT_PATH = packages/ui/dist/styles.css
MD17_TOOLCHAIN = typescript + tailwindcss
MD17_DETERMINISTIC = true
MD17_NETWORK_AFTER_INSTALL = false
MD17_ENV_SPECIFIC = false
