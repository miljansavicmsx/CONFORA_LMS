# 03 Validation

CMD = npm run test -- --run src/test/__tests__/iso-static-pages.residual.test.ts
RESULT = PASS
TESTS = 3
ASSERTIONS =
- named export IsoReportsPage is a function
- App.tsx import edge preserved
- IsoStaticPages is re-export only (no duplicated reports implementation)
