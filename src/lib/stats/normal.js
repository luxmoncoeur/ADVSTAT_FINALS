// @ts-check

/**
 * Standard normal distribution: density, CDF Φ, survival 1 − Φ, and inverse CDF Φ⁻¹.
 *
 * - erfc: W. J. Cody (1969), "Rational Chebyshev approximations for the error
 *   function", Math. Comp. 23, 631–637 (netlib SPECFUN CALERF). Max relative
 *   error < 6e-19 in exact arithmetic, so float64 rounding (~1e-16) dominates.
 * - Φ⁻¹: M. J. Wichura (1988), Algorithm AS 241 "The percentage points of the
 *   normal distribution" (PPND16), Applied Statistics 37, 477–484. Relative
 *   error about 1e-16.
 *
 * Upper-tail areas are computed directly with normalSf, never as 1 − Φ, so tiny
 * p-values keep full relative precision.
 */

/** @typedef {'left' | 'right' | 'two'} Tail */

const INV_SQRT_2PI = 0.3989422804014327; // 1 / √(2π)
const ONE_OVER_SQRT_PI = 5.6418958354775628695e-1;
const THRESHOLD = 0.46875;
const X_BIG = 26.543;

const A = [
  3.1611237438705656, 1.1386415415105016e2, 3.7748523768530202e2, 3.2093775891384695e3,
  1.8577770618460315e-1,
];
const B = [2.3601290952344122e1, 2.4402463793444417e2, 1.2826165260773723e3, 2.8442368334391706e3];
const C = [
  5.6418849698867009e-1, 8.8831497943883759, 6.6119190637141634e1, 2.9863513819740013e2,
  8.8195222124176909e2, 1.7120476126340706e3, 2.0510783778260716e3, 1.2303393547979972e3,
  2.1531153547440383e-8,
];
const D = [
  1.5744926110709835e1, 1.176939508913125e2, 5.3718110186200986e2, 1.6213895745666902e3,
  3.2907992357334597e3, 4.3626190901432472e3, 3.4393676741437216e3, 1.2303393548037495e3,
];
const P = [
  3.0532663496123236e-1, 3.6034489994980445e-1, 1.2578172611122926e-1, 1.6083785148742277e-2,
  6.5874916152983678e-4, 1.6315387137302097e-2,
];
const Q = [
  2.5685201922898682, 1.8729528499234604, 5.2790510295142837e-1, 6.051834131244132e-2,
  2.3352049762686918e-3,
];

/**
 * exp(−y²) computed as exp(−s²)·exp(−(y−s)(y+s)) with s = y truncated to 1/16,
 * which avoids the cancellation error of squaring y directly (Cody's trick).
 * @param {number} y
 */
function expNegSquare(y) {
  const s = Math.trunc(y * 16) / 16;
  const del = (y - s) * (y + s);
  return Math.exp(-s * s) * Math.exp(-del);
}

/**
 * Complementary error function erfc(x) = 1 − erf(x).
 * @param {number} x
 * @returns {number}
 */
export function erfc(x) {
  const y = Math.abs(x);
  let result;

  if (y <= THRESHOLD) {
    const ysq = y > 1.11e-16 ? y * y : 0;
    let num = A[4] * ysq;
    let den = ysq;
    for (let i = 0; i < 3; i += 1) {
      num = (num + A[i]) * ysq;
      den = (den + B[i]) * ysq;
    }
    return 1 - (x * (num + A[3])) / (den + B[3]);
  }

  if (y <= 4) {
    let num = C[8] * y;
    let den = y;
    for (let i = 0; i < 7; i += 1) {
      num = (num + C[i]) * y;
      den = (den + D[i]) * y;
    }
    result = ((num + C[7]) / (den + D[7])) * expNegSquare(y);
  } else if (y >= X_BIG) {
    result = 0;
  } else {
    const ysq = 1 / (y * y);
    let num = P[5] * ysq;
    let den = ysq;
    for (let i = 0; i < 4; i += 1) {
      num = (num + P[i]) * ysq;
      den = (den + Q[i]) * ysq;
    }
    result = (ysq * (num + P[4])) / (den + Q[4]);
    result = ((ONE_OVER_SQRT_PI - result) / y) * expNegSquare(y);
  }

  return x < 0 ? 2 - result : result;
}

/**
 * Standard normal probability density φ(z).
 * @param {number} z
 */
export function normalPdf(z) {
  return INV_SQRT_2PI * Math.exp(-0.5 * z * z);
}

/**
 * Standard normal cumulative distribution Φ(z) = P(Z ≤ z).
 * @param {number} z
 */
export function normalCdf(z) {
  return 0.5 * erfc(-z * Math.SQRT1_2);
}

/**
 * Standard normal survival function 1 − Φ(z) = P(Z > z), computed directly.
 * @param {number} z
 */
export function normalSf(z) {
  return 0.5 * erfc(z * Math.SQRT1_2);
}

/**
 * Inverse standard normal CDF Φ⁻¹(p) (Wichura AS 241, PPND16).
 * Returns −∞ for p = 0, +∞ for p = 1 and NaN outside [0, 1].
 * @param {number} p
 * @returns {number}
 */
export function inverseNormalCdf(p) {
  if (Number.isNaN(p) || p < 0 || p > 1) return Number.NaN;
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;

  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return (
      (q *
        (((((((2.5090809287301226727e3 * r + 3.3430575583588128105e4) * r +
          6.7265770927008700853e4) *
          r +
          4.5921953931549871457e4) *
          r +
          1.3731693765509461125e4) *
          r +
          1.9715909503065514427e3) *
          r +
          1.3314166789178437745e2) *
          r +
          3.387132872796366608)) /
      (((((((5.226495278852854561e3 * r + 2.8729085735721942674e4) * r + 3.930789580009271061e4) *
        r +
        2.1213794301586595867e4) *
        r +
        5.3941960214247511077e3) *
        r +
        6.871870074920579083e2) *
        r +
        4.2313330701600911252e1) *
        r +
        1)
    );
  }

  let r = q < 0 ? p : 1 - p;
  r = Math.sqrt(-Math.log(r));
  let value;
  if (r <= 5) {
    r -= 1.6;
    value =
      (((((((7.7454501427834140764e-4 * r + 2.27238449892691845833e-2) * r +
        2.4178072517745061177e-1) *
        r +
        1.27045825245236838258) *
        r +
        3.64784832476320460504) *
        r +
        5.7694972214606914055) *
        r +
        4.6303378461565452959) *
        r +
        1.42343711074968357734) /
      (((((((1.05075007164441684324e-9 * r + 5.475938084995344946e-4) * r +
        1.51986665636164571966e-2) *
        r +
        1.4810397642748007459e-1) *
        r +
        6.8976733498510000455e-1) *
        r +
        1.6763848301838038494) *
        r +
        2.05319162663775882187) *
        r +
        1);
  } else {
    r -= 5;
    value =
      (((((((2.01033439929228813265e-7 * r + 2.71155556874348757815e-5) * r +
        1.2426609473880784386e-3) *
        r +
        2.6532189526576123093e-2) *
        r +
        2.9656057182850489123e-1) *
        r +
        1.7848265399172913358) *
        r +
        5.4637849111641143699) *
        r +
        6.6579046435011037772) /
      (((((((2.04426310338993978564e-15 * r + 1.4215117583164458887e-7) * r +
        1.8463183175100546818e-5) *
        r +
        7.868691311456132591e-4) *
        r +
        1.4875361290850614852e-2) *
        r +
        1.3692988092273580531e-1) *
        r +
        5.9983220655588793769e-1) *
        r +
        1);
  }
  return q < 0 ? -value : value;
}

/**
 * Critical z-value(s) that bound the rejection region for significance level α.
 * Upper-tail quantiles are computed as −Φ⁻¹(α) rather than Φ⁻¹(1 − α) to avoid
 * losing precision in 1 − α.
 *
 * @param {number} alpha  Significance level, 0 < α < 1.
 * @param {Tail} tail
 * @returns {{ lower: number | null, upper: number | null }}
 */
export function criticalZ(alpha, tail) {
  if (!(alpha > 0 && alpha < 1)) throw new RangeError("alpha must be in (0, 1)");
  if (tail === "two") {
    const upper = -inverseNormalCdf(alpha / 2);
    return { lower: -upper, upper };
  }
  if (tail === "right") return { lower: null, upper: -inverseNormalCdf(alpha) };
  if (tail === "left") return { lower: inverseNormalCdf(alpha), upper: null };
  throw new RangeError(`unknown tail: ${tail}`);
}

/**
 * p-value of an observed z statistic.
 * @param {number} z
 * @param {Tail} tail
 * @returns {number}
 */
export function pValue(z, tail) {
  if (tail === "left") return normalCdf(z);
  if (tail === "right") return normalSf(z);
  if (tail === "two") return Math.min(1, 2 * (z <= 0 ? normalCdf(z) : normalSf(z)));
  throw new RangeError(`unknown tail: ${tail}`);
}
