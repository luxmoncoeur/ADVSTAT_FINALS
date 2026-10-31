"""Generate reference values for the ADVSTAT stats tests.

Every number here comes from SciPy / NumPy / statsmodels, independently of the
JavaScript implementation, and is written to src/lib/stats/__tests__/fixtures/.

Run with:  npm run fixtures
"""

import json
import math
from pathlib import Path

import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

OUT = Path(__file__).resolve().parents[2] / "src" / "lib" / "stats" / "__tests__" / "fixtures"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(20261030)
norm = stats.norm
TAILS = {"two": "two-sided", "right": "larger", "left": "smaller"}


def write(name, data):
    (OUT / name).write_text(json.dumps(data, indent=1) + "\n")
    print(f"wrote {name}")


def p_value(z, tail):
    if tail == "left":
        return float(norm.cdf(z))
    if tail == "right":
        return float(norm.sf(z))
    return float(min(1.0, 2 * norm.sf(abs(z))))


def critical(alpha, tail):
    if tail == "two":
        upper = float(norm.isf(alpha / 2))
        return {"lower": -upper, "upper": upper}
    if tail == "right":
        return {"lower": None, "upper": float(norm.isf(alpha))}
    return {"lower": float(norm.ppf(alpha)), "upper": None}


# ---------------------------------------------------------------- normal
zs = sorted(set([round(z, 4) for z in np.linspace(-38, 38, 1521)] + [0.0, 1.0, -1.0, 1.96, -1.96, 2.576, 8.3, -8.3]))
ps = sorted(
    set(
        [float(p) for p in np.linspace(0.0005, 0.9995, 1999)]
        + [float(10.0 ** -k) for k in range(1, 301, 7)]
        + [1 - float(10.0 ** -k) for k in range(1, 16)]
        + [0.5, 0.025, 0.975, 0.05, 0.95, 0.005, 0.995, 0.1, 0.9]
    )
)
alphas = [0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.001]
write(
    "normal.json",
    {
        "cdf": [[z, float(norm.cdf(z)), float(norm.sf(z)), float(norm.pdf(z))] for z in zs],
        "ppf": [[p, float(norm.ppf(p))] for p in ps],
        "critical": [{"alpha": a, "tail": t, **critical(a, t)} for a in alphas for t in TAILS],
    },
)

# ---------------------------------------------------------------- regression
datasets = [
    {"name": "textbook-small", "x": [1, 2, 3, 4, 5], "y": [2, 4, 5, 4, 5]},
    {"name": "study-hours", "x": [2, 3, 5, 7, 9, 10, 12, 15], "y": [62, 65, 70, 74, 80, 82, 88, 95]},
    {"name": "negative", "x": [10, 20, 30, 40, 50, 60], "y": [95.5, 81.2, 70.4, 52.9, 44.1, 30.7]},
    {"name": "decimals", "x": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], "y": [1.05, 1.31, 1.42, 1.77, 1.86, 2.2, 2.31]},
    {"name": "perfect-positive", "x": [1, 2, 3, 4], "y": [3, 5, 7, 9]},
    {"name": "perfect-negative", "x": [1, 2, 3, 4], "y": [10, 7, 4, 1]},
    {"name": "large-offset", "x": [1e9 + i for i in range(10)], "y": [5e8 + 2.5 * i + (0.1 if i % 2 else -0.1) for i in range(10)]},
    {"name": "two-points", "x": [3, 8], "y": [4, -6]},
]
for i in range(20):
    n = int(rng.integers(3, 60))
    x = rng.normal(rng.uniform(-50, 50), rng.uniform(0.5, 30), n)
    y = rng.uniform(-3, 3) * x + rng.normal(0, rng.uniform(0.1, 40), n) + rng.uniform(-100, 100)
    datasets.append({"name": f"random-{i}", "x": [float(v) for v in x], "y": [float(v) for v in y]})

regression = []
for d in datasets:
    x = np.array(d["x"], dtype=float)
    y = np.array(d["y"], dtype=float)
    fit = stats.linregress(x, y)
    regression.append(
        {
            **d,
            "n": len(x),
            "sumX": math.fsum(x),
            "sumY": math.fsum(y),
            "sumXY": math.fsum(x * y),
            "sumX2": math.fsum(x * x),
            "sumY2": math.fsum(y * y),
            "slope": float(fit.slope),
            "intercept": float(fit.intercept),
            "r": float(fit.rvalue),
        }
    )
write("regression.json", regression)

# ---------------------------------------------------------------- z-tests
ztests = []
for i in range(12):
    for tail in TAILS:
        alpha = [0.1, 0.05, 0.01][i % 3]

        # one mean (σ known): formula + SciPy normal distribution
        n = int(rng.integers(5, 200))
        sigma = float(rng.uniform(0.5, 40))
        mu0 = float(round(rng.uniform(-100, 500), 2))
        mean = float(round(mu0 + rng.normal(0, 2.2) * sigma / math.sqrt(n), 3))
        z = (mean - mu0) / (sigma / math.sqrt(n))
        ztests.append({"test": "one-mean", "tail": tail, "alpha": alpha,
                       "input": {"sampleMean": mean, "mu0": mu0, "sigma": sigma, "n": n},
                       "z": z, "pValue": p_value(z, tail), "critical": critical(alpha, tail)})

        # one proportion: statsmodels proportions_ztest with prop_var = p0
        n = int(rng.integers(30, 2000))
        p0 = float(round(rng.uniform(0.05, 0.95), 2))
        x = int(min(n, max(0, round(n * p0 + rng.normal(0, 2) * math.sqrt(n * p0 * (1 - p0))))))
        z, p = proportions_ztest(x, n, value=p0, alternative=TAILS[tail], prop_var=p0)
        ztests.append({"test": "one-proportion", "tail": tail, "alpha": alpha,
                       "input": {"successes": x, "n": n, "p0": p0},
                       "z": float(z), "pValue": float(p), "critical": critical(alpha, tail)})

        # two means (σ₁, σ₂ known): formula + SciPy
        n1, n2 = int(rng.integers(10, 300)), int(rng.integers(10, 300))
        s1, s2 = float(rng.uniform(1, 30)), float(rng.uniform(1, 30))
        d0 = float([0, 0, 2.5][i % 3])
        m1 = float(round(rng.uniform(20, 80), 2))
        m2 = float(round(m1 - d0 + rng.normal(0, 2) * math.sqrt(s1**2 / n1 + s2**2 / n2), 2))
        z = ((m1 - m2) - d0) / math.sqrt(s1**2 / n1 + s2**2 / n2)
        ztests.append({"test": "two-means", "tail": tail, "alpha": alpha,
                       "input": {"mean1": m1, "sigma1": s1, "n1": n1, "mean2": m2, "sigma2": s2, "n2": n2, "delta0": d0},
                       "z": z, "pValue": p_value(z, tail), "critical": critical(alpha, tail)})

        # two proportions (pooled): statsmodels proportions_ztest
        n1, n2 = int(rng.integers(40, 1500)), int(rng.integers(40, 1500))
        base = float(rng.uniform(0.1, 0.9))
        x1 = int(rng.binomial(n1, base))
        x2 = int(rng.binomial(n2, min(0.99, max(0.01, base + rng.normal(0, 0.05)))))
        z, p = proportions_ztest([x1, x2], [n1, n2], alternative=TAILS[tail])
        ztests.append({"test": "two-proportions", "tail": tail, "alpha": alpha,
                       "input": {"x1": x1, "n1": n1, "x2": x2, "n2": n2},
                       "z": float(z), "pValue": float(p), "critical": critical(alpha, tail)})

write("ztest.json", ztests)
