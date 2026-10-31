// @ts-check
export {
  erfc,
  normalPdf,
  normalCdf,
  normalSf,
  inverseNormalCdf,
  criticalZ,
  pValue,
} from "./normal.js";
export {
  linearRegression,
  predict,
  classifyCorrelation,
  STRENGTH_SCALE,
  MAX_POINTS,
} from "./regression.js";
export {
  oneMeanZTest,
  oneProportionZTest,
  twoMeansZTest,
  twoProportionsZTest,
  TAIL_OPERATOR,
} from "./ztest.js";
export { parseNumber, parsePairs } from "./parse.js";
export { compensatedSum } from "./summation.js";
