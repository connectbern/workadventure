/// <reference types="@workadventure/iframe-api-typings" />
// Small shared helpers used by every Connect Bern world script.
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

export function onReady(fn: () => void) {
  WA.onInit()
    .then(() => {
      fn();
      // Scripting API Extra adds advanced map properties (door, variables, etc.)
      bootstrapExtra().catch((e) => console.error(e));
    })
    .catch((e) => console.error(e));
}

type Btn = { label: string; className?: ButtonDescriptorClass; cb?: (p: any) => void };
type ButtonDescriptorClass =
  | "normal" | "primary" | "success" | "warning" | "error" | "disabled";

let openPopups: any[] = [];
export function closeAll() {
  openPopups.forEach((p) => { try { p.close(); } catch {} });
  openPopups = [];
}

/** Open a popup anchored on a Tiled object (e.g. "<zone>Popup"). */
export function popup(anchor: string, message: string, buttons: Btn[] = []) {
  closeAll();
  const btns = buttons.map((b) => ({
    label: b.label,
    className: b.className ?? "primary",
    callback: (p: any) => { try { b.cb?.(p); } finally { p.close(); } },
  }));
  if (btns.length === 0) {
    btns.push({ label: "Close", className: "normal", callback: (p: any) => p.close() });
  }
  const p = WA.ui.openPopup(anchor, message, btns as any);
  openPopups.push(p);
  return p;
}

/** Show a "Press SPACE …" prompt while inside an area; run cb on SPACE. */
export function onAction(area: string, prompt: string, cb: () => void) {
  let msg: any;
  WA.room.area.onEnter(area).subscribe(() => {
    msg = WA.ui.displayActionMessage({ message: prompt, callback: () => cb() });
  });
  WA.room.area.onLeave(area).subscribe(() => { msg?.remove?.(); });
}

/** Fire a one-shot popup the moment the player walks into an area. */
export function onEnterPopup(area: string, message: string, buttons: Btn[] = []) {
  WA.room.area.onEnter(area).subscribe(() => popup(area + "Popup", message, buttons));
  WA.room.area.onLeave(area).subscribe(() => closeAll());
}
