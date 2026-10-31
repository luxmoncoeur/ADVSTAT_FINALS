"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { parseNumber } from "@/lib/stats";
import { ALPHA_PRESETS, TESTS } from "../config";

/** Fields shown for a test and input mode. */
export function fieldsFor(testId, mode) {
  const test = TESTS[testId];
  return test.modes ? test.modes[mode] : test.fields;
}

/**
 * Parse the α control: a preset or a custom value with 0 < α ≤ 0.5.
 * @returns {{ value: number | null, error: string | null }}
 */
export function readAlpha(choice, customText) {
  if (choice !== "custom") return { value: Number(choice), error: null };
  const value = parseNumber(customText);
  if (value === null) return { value: null, error: "Enter α as a decimal, e.g. 0.025" };
  if (!(value > 0 && value <= 0.5))
    return { value: null, error: "α must be greater than 0 and at most 0.5" };
  return { value, error: null };
}

/**
 * Turn the form strings into the stats-function input, collecting a message
 * for every missing or invalid field.
 */
export function buildInput({ test, fields, values, tail, alpha }) {
  /** @type {Record<string, string>} */
  const errors = {};
  /** @type {Record<string, number | string>} */
  const input = { tail };
  const all = test.nullField ? [test.nullField, ...fields] : fields;
  for (const field of all) {
    const raw = values[field.name] ?? "";
    const parsed = parseNumber(raw);
    if (raw.trim() === "") errors[field.name] = `Enter ${field.symbol}`;
    else if (parsed === null) errors[field.name] = "Not a valid number (use a period for decimals)";
    else input[field.name] = parsed;
  }
  if (alpha.error || alpha.value === null) errors.alpha = alpha.error ?? "Choose α";
  else input.alpha = alpha.value;

  if (Object.keys(errors).length === 0) {
    const result = test.run(input);
    if (!result.ok && result.error.field) errors[result.error.field] = result.error.message;
  }
  return { input, errors };
}

/** State and actions for the hypothesis-testing workspace. */
export function useZTest() {
  const [testId, setTestId] = useState("one-mean");
  const [mode, setMode] = useState("counts");
  const [tail, setTail] = useState("two");
  const [alphaChoice, setAlphaChoice] = useState("0.05");
  const [customAlpha, setCustomAlpha] = useState("");
  const [values, setValues] = useState(/** @type {Record<string, string>} */ ({}));
  const [statements, setStatements] = useState({ h0: "", ha: "" });
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [submitted, setSubmitted] = useState(
    /** @type {null | { testId: string, input: Record<string, number | string>, statements: { h0: string, ha: string } }} */ (
      null
    ),
  );

  const test = TESTS[testId];
  const fields = fieldsFor(testId, mode);
  const alpha = readAlpha(alphaChoice, customAlpha);

  const outcome = useMemo(() => {
    if (!submitted) return null;
    return TESTS[submitted.testId].run(submitted.input);
  }, [submitted]);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const chooseTest = useCallback((id) => {
    setTestId(id);
    setFieldErrors({});
    setSubmitted(null);
  }, []);

  /** Fill the form from a practice scenario; optionally compute straight away. */
  const loadScenario = useCallback(
    (scenario, { autoCompute = false } = {}) => {
      setMode("counts");
      setValues(scenario.values);
      setTail(scenario.tail);
      setAlphaChoice(scenario.alpha);
      setStatements(scenario.statements);
      setFieldErrors({});
      if (autoCompute) {
        const { input, errors } = buildInput({
          test: TESTS[testId],
          fields: fieldsFor(testId, "counts"),
          values: scenario.values,
          tail: scenario.tail,
          alpha: readAlpha(scenario.alpha, ""),
        });
        if (Object.keys(errors).length === 0)
          setSubmitted({ testId, input, statements: scenario.statements });
      } else {
        toast.message(`Scenario loaded: ${scenario.title ?? "example"}`, {
          description: scenario.story,
        });
      }
    },
    [testId],
  );

  const loadExample = useCallback(
    () => loadScenario({ title: "example", ...TESTS[testId].example }),
    [loadScenario, testId],
  );

  const reset = useCallback(() => {
    setValues({});
    setStatements({ h0: "", ha: "" });
    setFieldErrors({});
    setSubmitted(null);
  }, []);

  const compute = useCallback(() => {
    const { input, errors } = buildInput({ test, fields, values, tail, alpha });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Check the highlighted inputs.");
      return;
    }
    setSubmitted({ testId, input, statements });
  }, [alpha, fields, statements, tail, test, testId, values]);

  const stale =
    submitted !== null &&
    (submitted.testId !== testId ||
      submitted.input.tail !== tail ||
      submitted.input.alpha !== alpha.value ||
      (test.nullField ? [test.nullField, ...fields] : fields).some(
        (field) => parseNumber(values[field.name] ?? "") !== submitted.input[field.name],
      ));

  const filled = (field) => (values[field.name] ?? "").trim() !== "";
  const progress = {
    hypotheses: test.nullField ? filled(test.nullField) : true,
    alpha: alpha.value !== null,
    sample: fields.every(filled),
    result: outcome?.ok === true && !stale,
  };

  return {
    testId,
    progress,
    loadScenario,
    test,
    mode,
    setMode: (next) => {
      setMode(next);
      setFieldErrors({});
    },
    tail,
    setTail,
    alphaChoice,
    setAlphaChoice,
    customAlpha,
    setCustomAlpha,
    alpha,
    values,
    setValue,
    statements,
    setStatements,
    fields,
    fieldErrors,
    outcome,
    submitted,
    stale,
    chooseTest,
    loadExample,
    reset,
    compute,
    alphaPresets: ALPHA_PRESETS,
  };
}
