# KNN Concept Check

An interactive, formative quiz that accompanies [KNN Interactive](https://alexbernardino.github.io/knn-interactive/). Ten questions give immediate feedback about neighbourhood size, class overlap, accuracy, precision, distance weighting, consistency, and predictor variance.

## Test locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Verify the GitHub Pages build

```bash
PAGES_BASE_PATH=/knn-quiz npm run build:pages
```

## Deploy

Push the repository to GitHub, then select **Settings → Pages → Source → GitHub Actions**. Every push to `main` deploys the quiz to:

<https://alexbernardino.github.io/knn-quiz/>
