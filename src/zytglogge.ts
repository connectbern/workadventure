/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

onReady(() => {
  // Live clock (like the starter kit's clock popup)
  WA.room.area.onEnter("clock").subscribe(() => {
    const d = new Date();
    const time = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
    popup("clockPopup", `🕰️ The Zytglogge\n\nIt is ${time}.\n\nLegend says the tower opens its vault only to those who walk the hours in order: 1 → 2 → 3.`);
  });

  // Sequence puzzle: step the hour plates in order 1,2,3
  const order = [1, 2, 3];
  let progress = 0;
  let solved = false;
  for (const n of order) {
    WA.room.area.onEnter("hour" + n).subscribe(() => {
      if (solved) return;
      if (n === order[progress]) {
        progress++;
        if (progress === order.length) {
          solved = true;
          WA.chat.sendChatMessage("🔓 The vault clicks open!");
        } else {
          WA.chat.sendChatMessage(`✅ Hour ${n}… ${progress}/3`);
        }
      } else {
        progress = 0;
        WA.chat.sendChatMessage(`❌ Wrong hour — the gears reset. Start at 1.`);
      }
    });
  }

  WA.room.area.onEnter("vault").subscribe(() => {
    if (solved) popup("vaultPopup", "🏆 The Vault\n\nYou solved the Zytglogge! Inside you find the secret of Bern: time spent with good people is never wasted. ⏳🐻", [{ label: "✨ Nice", className: "success" }]);
    else popup("vaultPopup", "🔒 The vault is locked.\n\nStep on the hour-plates in order: 1 → 2 → 3.");
  });

  console.log("Zytglogge puzzle ready");
});
