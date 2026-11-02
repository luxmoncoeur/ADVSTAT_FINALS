"use client";

import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

/**
 * @typedef {Object} ToasterToast
 * @property {string} id
 * @property {React.ReactNode} [title]
 * @property {React.ReactNode} [description]
 * @property {React.ReactNode} [action]
 * @property {string} [variant]
 * @property {React.ReactNode} [icon]
 * @property {boolean} [open]
 * @property {(open: boolean) => void} [onOpenChange]
 * @property {number} [duration]
 * @property {string} [className]
 */

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${count}`;
}

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const toastTimeouts = new Map();

/** @param {string} toastId */
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/** @param {string} toastId */
const clearFromRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
    toastTimeouts.delete(toastId);
  }
};

const clearAllRemoveQueue = () => {
  toastTimeouts.forEach((timeout) => clearTimeout(timeout));
  toastTimeouts.clear();
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST: {
      clearFromRemoveQueue(action.toast.id);
      const exists = state.toasts.some((t) => t.id === action.toast.id);
      if (exists) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast, open: true } : t,
          ),
        };
      }
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    }

    case actionTypes.UPDATE_TOAST:
      clearFromRemoveQueue(action.toast.id);
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast, open: true } : t,
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((t) => {
          addToRemoveQueue(t.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        clearAllRemoveQueue();
        return {
          ...state,
          toasts: [],
        };
      }
      clearFromRemoveQueue(action.toastId);
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

/** @type {Array<(state: { toasts: ToasterToast[] }) => void>} */
const listeners = [];

/** @type {{ toasts: ToasterToast[] }} */
let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Normalise toast options whether passed as a string or an object.
 * @param {string | number | React.ReactNode | Partial<ToasterToast>} input
 * @param {Partial<ToasterToast>} [options]
 * @returns {Partial<ToasterToast>}
 */
function normalizeToastArgs(input, options = {}) {
  if (typeof input === "string" || typeof input === "number" || React.isValidElement(input)) {
    return { title: input, ...options };
  }
  return { ...input, ...options };
}

/**
 * Trigger a toast notification.
 * @param {string | number | React.ReactNode | Partial<ToasterToast>} input
 * @param {Partial<ToasterToast>} [options]
 */
function toast(input, options) {
  const props = normalizeToastArgs(input, options);
  const id = props.id || genId();

  const update = (/** @type {Partial<ToasterToast>} */ nextProps) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...nextProps, id },
    });

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
        props.onOpenChange?.(open);
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

/** Success toast helper */
toast.success = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast({ ...parsed, variant: "success" });
};

/** Error / destructive toast helper */
toast.error = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast({ ...parsed, variant: "destructive" });
};

/** Info toast helper */
toast.info = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast({ ...parsed, variant: "info" });
};

/** Warning toast helper */
toast.warning = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast({ ...parsed, variant: "warning" });
};

/** Neutral message toast helper */
toast.message = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast(parsed);
};

/** Loading toast helper */
toast.loading = (input, options) => {
  const parsed = normalizeToastArgs(input, options);
  return toast({ duration: Infinity, ...parsed, variant: "loading" });
};

/** Dismiss a specific toast or all toasts */
toast.dismiss = (toastId) => {
  dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
};

/** Immediately clear all toasts */
toast.clear = () => {
  clearAllRemoveQueue();
  dispatch({ type: actionTypes.REMOVE_TOAST });
};

/** Custom promise helper */
toast.promise = (promise, { loading, success, error }) => {
  const ref = toast.loading(
    typeof loading === "string" || typeof loading === "number" || React.isValidElement(loading)
      ? loading
      : (loading?.title ?? "Loading..."),
    typeof loading === "object" && !React.isValidElement(loading) ? loading : {},
  );

  const p = typeof promise === "function" ? promise() : promise;

  return p
    .then((data) => {
      const succ = typeof success === "function" ? success(data) : success;
      const succProps = normalizeToastArgs(succ);
      ref.update({
        id: ref.id,
        variant: "success",
        duration: 5000,
        ...succProps,
      });
      return data;
    })
    .catch((err) => {
      const fail = typeof error === "function" ? error(err) : error;
      const failProps = normalizeToastArgs(fail);
      ref.update({
        id: ref.id,
        variant: "destructive",
        duration: 5000,
        ...failProps,
      });
      throw err;
    });
};

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
