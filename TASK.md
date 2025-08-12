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

## Landing Page (apps/landing)

- [x] Create new Next.js app skeleton in `apps/landing/` with Tailwind CSS
- [x] Base config files: `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `jest.config.cjs`, `jest.setup.ts`, `next-env.d.ts`
- [x] Global styles wired via `app/globals.css`
- [x] App router scaffold: `app/layout.tsx`, `app/page.tsx`
- [x] Components scaffolded:
  - `components/Header.tsx` (trust bar + nav)
  - `components/Hero.tsx` (CTA + image, placeholder quote form)
  - `components/SocialProof.tsx` (awards + Elfsight placeholder)
  - `components/PricingSection.tsx` (animated header + cards)
  - `components/MovingProcess.tsx`
  - `components/Differentiators.tsx`
  - `components/FinalCTA.tsx`
  - `components/Footer.tsx`
- [x] Minimal tests: `__tests__/Header.test.tsx`, `__tests__/Hero.test.tsx`, `__tests__/SocialProof.test.tsx`
- [x] Install deps and run tests for landing app
- [x] Hook up Elfsight reviews (requires widget ID)
- [ ] Polish copy, imagery, and brand assets to match spec exactly

## Quote Form (apps/landing)

- [x] Step 1: Service Type (tile-based; 6 options)
- [x] Step 2: Move Type & Property Type (conditional by service)
- [x] Step 3: Location Details (Google Autocomplete; handicaps; multi-address)
  - [x] Dual-address sub-slides (From → To)
  - [x] "Multiple stops?" only on last/only slide
  - [x] Exactly one Additional Stop, asking same questions (address, unit, stairs, walk distance) + Stop Type
- [x] Step 4: Additional Info (multi-select)
- [x] Step 5: Conditional Follow-Ups
- [ ] Step 6: Contact Info (email → name → phone)
- [ ] Step 7: Loader / Manual Review triggers
- [ ] Real-time pricing integration (shared package)
- [ ] CRM pipeline integration and autosave
- [ ] Unit tests for each step and error states
  - Added: `__tests__/QuoteForm.MoveDetails.test.tsx` (Step 2)
  - Added: `__tests__/QuoteForm.LocationDetails.test.tsx` (Step 3 single vs dual address flows; Additional Stop includes stairs/walk and Stop Type)
  - Added: `__tests__/QuoteForm.AdditionalInfo.test.tsx` (Step 4 labels and multi-select toggling)
  - Added: `__tests__/QuoteForm.ConditionalFollowUps.test.tsx` (Step 5 conditional sections, exact labels, visibility gating)

### Notes
- Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/landing/.env.local` for Google Places Autocomplete to be enabled in production. The UI gracefully falls back to a regular input if missing.
 - Step 3 refined: Dual-address flows use sub-slides (From → To). "Multiple stops?" checkbox appears on the last slide (or the only slide for single-address flows) and reveals an Additional Stop address with Pickup/Dropoff selection. Exactly one Additional Stop is supported and includes the same questions as other locations (address, unit, stairs, walk distance) + Stop Type.
