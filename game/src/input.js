// Keyboard and mouse input. WASD or arrow keys move the thief; a click sets a
// spot to walk to. Space or Enter confirms (start / restart), P or Escape
// pauses, 1 throws a smoke bomb, 2 fires the jammer.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SMOKE = 4;
export const ACTION_JAMMER = 8;

/** Wire up the listeners and return the live input state. */
export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;
  let clickX = null;
  let clickY = null;

  function keyCode(event) {
    return event.code;
  }

  window.addEventListener('keydown', (event) => {
    const code = keyCode(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) event.preventDefault();
    if (event.repeat) return;
    keys.add(code);
    if (code === 'Space' || code === 'Enter') actions |= ACTION_CONFIRM;
    if (code === 'KeyP' || code === 'Escape') actions |= ACTION_PAUSE;
    if (code === 'Digit1' || code === 'KeyQ') actions |= ACTION_SMOKE;
    if (code === 'Digit2' || code === 'KeyE') actions |= ACTION_JAMMER;
  });
  window.addEventListener('keyup', (event) => keys.delete(keyCode(event)));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    // The canvas fills the window while the field is 1280x720: scale the click
    // into field coordinates the same way the renderer scales the drawing.
    const scale = Math.min(rect.width / 1280, rect.height / 720);
    const offsetX = (rect.width - 1280 * scale) / 2;
    const offsetY = (rect.height - 720 * scale) / 2;
    clickX = (event.clientX - rect.left - offsetX) / scale;
    clickY = (event.clientY - rect.top - offsetY) / scale;
  });

  function direction() {
    let x = 0;
    let y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    return { x, y };
  }

  return {
    direction,
    /** Actions pressed since the last call (consumed by reading). */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The latest click target in field coordinates, or null (consumed by reading). */
    takeClick() {
      if (clickX === null || clickY === null) return null;
      const target = { x: clickX, y: clickY };
      clickX = null;
      clickY = null;
      return target;
    },
  };
}
