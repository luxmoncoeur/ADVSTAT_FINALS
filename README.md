# ADVSTAT — Statistics Lab

> Run linear regression and Z-tests in your browser, with every step of the solution shown.

## Introduction

ADVSTAT is a web app for two core topics in introductory statistics: **simple linear regression** and **Z-based hypothesis testing**. You enter your data or sample values, and ADVSTAT gives you the answer along with the full worked solution, charts, and a plain-language interpretation.

The app is built for learning. Results match standard statistical software, and each formula is shown next to the numbers it produced, so you can check every step against your own work.

## Features

### Linear Regression

- **Three ways to enter data.** Type values into an editable table, paste them from a spreadsheet, or upload a `.csv` / `.txt` file.
- **Example datasets.** A gallery of ready-made datasets, such as study hours vs. exam score and temperature vs. ice cream sales, including cases with a perfect relationship and with no relationship.
- **Complete results.** The regression equation (Ŷ = a + bX), correlation coefficient (r), coefficient of determination (R²), and a strength-of-relationship rating.
- **Charts.** A scatter plot with the line of best fit, a residual plot, and visual meters for r and R².
- **Prediction.** Enter any X value to get a predicted Y.
- **Step-by-step solution.** A summation table and each formula filled in with your numbers.

### Hypothesis Testing

- **Four Z-tests:**
  - One population mean (σ known)
  - One population proportion
  - Difference between two means
  - Difference between two proportions
- **Left-, right-, and two-tailed tests** at any significance level (α).
- **Clear decisions.** The Z statistic, critical value, p-value, and the decision to reject or not reject H₀, with an explanation in plain language.
- **Normal curve chart.** Shows the rejection region and where your test statistic lands.
- **Z-table lookup** and worked examples for each test.

### Learn

- A reference page with every formula the app uses, decision rules, a table of common critical values, and a full standard normal (Z) table.

### General

- Light and dark themes.
- Works on desktop and mobile.
- Accessibility checks are part of the automated test suite.
- Results are tested against Python's SciPy and statsmodels libraries.

## Project Structure

```
ADVSTAT_FINALS/
├── src/
│   ├── app/                    # Pages (Next.js App Router)
│   │   ├── page.js             # Dashboard
│   │   ├── regression/         # Linear regression page
│   │   ├── hypothesis/         # Hypothesis testing page
│   │   └── learn/              # Formulas & Z-table page
│   ├── components/
│   │   ├── layout/             # Sidebar, header, navigation
│   │   ├── shared/             # Reusable pieces (result cards, number fields, solution steps)
│   │   └── ui/                 # Base UI components (shadcn/ui)
│   ├── features/
│   │   ├── dashboard/
│   │   ├── regression/         # Data entry, charts, results, example datasets
│   │   ├── hypothesis/         # Test inputs, normal curve, Z-table, explanations
│   │   └── learn/
│   ├── hooks/                  # Shared React hooks
│   └── lib/
│       ├── stats/              # Statistics engine (regression, Z-tests, normal distribution)
│       │   └── __tests__/      # Unit tests and reference fixtures
│       ├── format.js           # Number formatting
│       └── utils.js
├── tests/
│   └── e2e/                    # End-to-end and accessibility tests (Playwright)
├── scripts/
│   └── reference/              # Python script that generates reference test values
├── package.json
├── next.config.mjs
├── vitest.config.mjs
└── playwright.config.mjs
```

The statistics engine in `src/lib/stats/` contains plain JavaScript functions with no UI code. The pages and components call into it and only handle display.

## Installation

**Requirements**

- [Node.js](https://nodejs.org) 20.9 or newer
- npm (included with Node.js)
- _Optional:_ Python 3, only needed to regenerate the reference test values

**Steps**

1. Clone the repository and open the project folder:

   ```bash
   git clone https://github.com/luxmoncoeur/ADVSTAT_FINALS.git
   cd ADVSTAT_FINALS
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Optional: end-to-end tests**

Playwright needs its browsers installed once before you run the end-to-end tests:

```bash
npx playwright install
```

**Optional: reference fixtures**

To regenerate the test values computed with SciPy and statsmodels, set up a Python virtual environment in `scripts/reference/`:

```bash
python3 -m venv scripts/reference/.venv
scripts/reference/.venv/bin/pip install -r scripts/reference/requirements.txt
npm run fixtures
```

## Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start the development server at `localhost:3000`         |
| `npm run build`        | Create an optimized production build                     |
| `npm run start`        | Serve the production build                               |
| `npm run lint`         | Check the code with ESLint                               |
| `npm run format`       | Format all files with Prettier                           |
| `npm run format:check` | Check formatting without changing files                  |
| `npm test`             | Run all unit and component tests once                    |
| `npm run test:watch`   | Run tests in watch mode, re-running as files change      |
| `npm run test:stats`   | Run only the statistics engine tests                     |
| `npm run coverage`     | Run tests and generate a code coverage report            |
| `npm run test:e2e`     | Run end-to-end and accessibility tests in a real browser |
| `npm run fixtures`     | Regenerate reference test values with Python (see above) |

## Tech Stack

| Area             | Tools                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev)                                                                 |
| Language         | JavaScript with JSDoc type annotations                                                                                                       |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com)                                                                                                    |
| UI components    | [shadcn/ui](https://ui.shadcn.com), [Base UI](https://base-ui.com), [Radix UI](https://www.radix-ui.com), [Lucide](https://lucide.dev) icons |
| Charts           | [Recharts](https://recharts.org)                                                                                                             |
| Animation        | [Motion](https://motion.dev)                                                                                                                 |
| Notifications    | [Sonner](https://sonner.emilkowal.ski)                                                                                                       |
| Theming          | [next-themes](https://github.com/pacocoursey/next-themes)                                                                                    |
| Unit testing     | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), [fast-check](https://fast-check.dev)                           |
| End-to-end tests | [Playwright](https://playwright.dev), [axe-core](https://github.com/dequelabs/axe-core)                                                      |
| Reference values | Python with [NumPy](https://numpy.org), [SciPy](https://scipy.org), [statsmodels](https://www.statsmodels.org)                               |
| Code quality     | ESLint, Prettier                                                                                                                             |

---

<p align="center">
  <strong>ADVSTAT — Statistics Lab</strong><br />
  Built as a final project for Advanced Statistics.<br />
  <sub>© 2026 ADVSTAT team. All rights reserved.</sub>
</p>
