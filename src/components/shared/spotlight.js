/**
 * Pointer handler for `.panel[data-spotlight]` surfaces. Moves the glow to the cursor,
 * batching updates to one per frame.
 * @param {React.PointerEvent<HTMLElement>} event
 */
export function trackSpotlight(event) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const { clientX, clientY } = event;
  if (el.dataset.spotFrame) return;
  el.dataset.spotFrame = "1";
  requestAnimationFrame(() => {
    delete el.dataset.spotFrame;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${clientY - rect.top}px`);
  });
}
