/**
 * MD13 — IsoStaticPages named-export surface required by App.tsx.
 *
 * App.tsx imports `{ IsoReportsPage }` from this module. The reports page
 * implementation already exists as the default export of IsoReportsPage.tsx.
 * This file restores the missing MB_E import edge without duplicating UI logic
 * and without inventing standards content.
 */

export { default as IsoReportsPage } from "./IsoReportsPage";
