# TASKS

## Estimation & Pricing Engine (packages/shared)

- [x] Shared package scaffolding (package.json, tsconfig.json)
- [x] Jest configuration stabilized (jest.config.cjs) and scripts updated
- [x] Added dev types (@types/node)
- [x] Pricing constants (`packages/shared/src/utils/pricing/constants.ts`)
- [x] Day-split logic (`packages/shared/src/utils/pricing/daySplit.ts`)
- [x] Pricing engine (`packages/shared/src/utils/pricing/engine.ts`)
- [x] Estimation constants (`packages/shared/src/utils/estimation/constants.ts`)
- [x] Estimation engine (`packages/shared/src/utils/estimation/engine.ts`)
- [x] Zod schemas (`packages/shared/src/api/schemas/pricing.ts`, `packages/shared/src/api/schemas/estimation.ts`)
- [x] API contracts (`packages/shared/src/api/contracts/pricing.ts`, `packages/shared/src/api/contracts/estimation.ts`)
- [x] Unit tests for pricing, day-split, estimation, schemas
 - [x] All tests passing (19) and build succeeds

## Discovered During Work

- Add more edge-case tests:
  - Unknown day-split for distance > 120 miles
  - Distance cost behavior at and below 30 miles
  - Handicap threshold boundaries and caps
- Plan semantic versioning for the shared package once integrated across apps.

## Cleanup Completed

- Removed redundant `packages/shared/jest.config.ts` (using `jest.config.cjs` exclusively)
