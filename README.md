<p align="center">
  <img src="public/brand/stats-logo.png" alt="AnalytIQ Studio logo" width="160" height="160" />
</p>

<h1 align="center">AnalytIQ Studio</h1>

<p align="center">
  <strong>A statistics lab for linear regression and Z-tests, with every step of the solution shown.</strong>
</p>

<p align="center">
  <a href="https://analytiq-studio.onrender.com/">
    <img src="https://img.shields.io/badge/Live%20site-analytiq--studio.onrender.com-3B5BDB?style=for-the-badge&logo=render&logoColor=white" alt="Live site: analytiq-studio.onrender.com" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Recharts-3-8884D8" alt="Recharts 3" />
  <img src="https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest&logoColor=white" alt="Tested with Vitest" />
  <img src="https://img.shields.io/badge/Playwright-e2e-2EAD33?logo=playwright&logoColor=white" alt="End-to-end tests with Playwright" />
</p>

<p align="center">
  <a href="#introduction">Introduction</a> ·
  <a href="#features">Features</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## Introduction

AnalytIQ Studio is a web app for two core topics in introductory statistics: **simple linear regression** and **Z-based hypothesis testing**. You enter your data or sample values, and AnalytIQ Studio gives you the answer along with the full worked solution, charts, and a plain-language interpretation.

The app is built for learning. Results match standard statistical software, and each formula is shown next to the numbers it produced, so you can check every step against your own work.

The app has five main pages:

| Page               | What you can do                                                                  |
| ------------------ | -------------------------------------------------------------------------------- |
| Dashboard          | Preview a live regression fit and a Z-test sandbox using sample datasets         |
| Linear Regression  | Enter paired data and get the regression line, r, R², charts, and predictions    |
| Hypothesis Testing | Run one- and two-sample Z-tests for means and proportions                        |
| Formulas & Z-Table | Look up every formula the app uses, the decision rules, and the standard Z-table |
| About              | Read about the project and the BSIT-3A class that built it                       |

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

### Printable Reports

- Open a clean report of any regression or hypothesis test result, with the inputs, answer, and worked solution together. Print it or save it as a PDF from the browser.

### General

- Light and dark themes.
- Works on desktop and mobile.
- Accessibility checks are part of the automated test suite.
- Results are tested against Python's SciPy and statsmodels libraries.

## Project Structure

```
AnalytIQ-Studio/
├── public/
│   └── brand/                  # Logo files
├── src/
│   ├── app/                    # Routes (Next.js App Router)
│   │   ├── page.js             # Landing page
│   │   └── (workspace)/        # Pages that share the sidebar layout
│   │       ├── dashboard/
│   │       ├── regression/     # Linear regression
│   │       ├── hypothesis/     # Hypothesis testing
│   │       ├── learn/          # Formulas & Z-table
│   │       └── about/          # About the project and the team
│   ├── components/
│   │   ├── layout/             # Sidebar, header, navigation, logo
│   │   ├── shared/             # Reusable pieces (result cards, number fields, solution steps, reports)
│   │   └── ui/                 # Base UI components (shadcn/ui)
│   ├── features/
│   │   ├── landing/            # Landing page sections and figures
│   │   ├── dashboard/
│   │   ├── regression/         # Data entry, charts, results, example datasets
│   │   ├── hypothesis/         # Test inputs, normal curve, Z-table, explanations
│   │   ├── learn/
│   │   └── about/              # Project info and team members
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
   git clone https://github.com/luxmoncoeur/AnalytIQ-Studio.git
   cd AnalytIQ-Studio
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

## Contributing

1. Create a branch from `main` (for example, `yourname-11/6/26-v1`).
2. Make your changes, then check them before pushing:

   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

3. Push the branch and open a pull request into `main`.
4. A pull request needs one approval from a teammate before it can be merged.

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
  <img src="public/brand/stats-logo-128.png" alt="" width="40" height="40" /><br />
  <strong>AnalytIQ Studio — Statistics Lab</strong><br />
  Built by BSIT-3A as a final project for Advanced Statistics.<br />
  <sub>© 2026 AnalytIQ Studio team. All rights reserved.</sub>
</p>
