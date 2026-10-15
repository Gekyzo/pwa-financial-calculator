# Financial Calculator

An offline Android PWA with four calculators of money, in Spanish and English:

- **Loan / mortgage:** the monthly payment (French amortisation), the total interest and a table
  by year.
- **Term deposit:** the interest at maturity, monthly or yearly, the withholding (19 % by
  default) and the APY (TAE).
- **Savings:** an initial amount and a monthly contribution with monthly compounding, and a table
  by year.
- **Simple interest:** `I = P·r·t`, solved for any one of the four.

The results change as you type. Each calculator keeps its last values on the device. Plain HTML,
CSS and ES modules: no build step and no dependencies. Made from `pwa-template`.

## Develop

```sh
npm run serve   # http://localhost:8082
npm test
```

## Install on Android

Open the deployed URL in Chrome. Use the **Install** button of Settings, or Chrome menu →
**Install app**.

## Release and deploy

1. Write the user-visible changes under `## Unreleased` in `CHANGELOG.md`.
2. `npm run release` (or `npm run release -- minor|major`). It commits `Bump version to X.Y.Z`
   and creates the tag `vX.Y.Z`.
3. `git push --follow-tags`. The workflow `.github/workflows/pages.yml` deploys the tag.

Set the repository's Pages source to "GitHub Actions" once.

## Specification

`docs/spec/README.md`. The calculators are `docs/spec/07-calculators.md`.

## Design system

`styles.css` holds the tokens and the components in five layers. Open `/designs/` on the dev
server for the catalogue. `docs/spec/04-design-system.md` has the rules.
