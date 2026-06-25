/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

const CLUES = [
  "🔎 Clue 1/5: «Under the arcades, 6 km of covered shopping keep you dry in the rain.»",
  "🔎 Clue 2/5: «A fountain figure devours children — the Kindlifresserbrunnen!»",
  "🔎 Clue 3/5: «Einstein wrote his theory of relativity in a flat on Kramgasse.»",
  "🔎 Clue 4/5: «The bear has guarded this city's flag for over 800 years.»",
  "🔎 Clue 5/5: «312 steps lead up the Münster tower to the best view in Bern.»",
];

onReady(() => {
  const found = new Set<number>();
  for (let i = 0; i < CLUES.length; i++) {
    WA.room.area.onEnter("clue" + i).subscribe(() => {
      const fresh = !found.has(i);
      found.add(i);
      const tail = `\n\n🗺️ Clues found: ${found.size}/${CLUES.length}`;
      popup(
        "clue" + i + "Popup",
        CLUES[i] + tail + (found.size === CLUES.length ? "\n\n🏆 You found them all! Visit the Münster to claim your discovery." : ""),
        [{ label: fresh ? "Got it!" : "Close", className: "success" }]
      );
    });
  }

  WA.room.area.onEnter("muenster").subscribe(() => {
    if (found.size === CLUES.length)
      popup("muensterPopup", "🏆 Treasure found!\n\nYou explored every corner of the old town. The real treasure of Bern? Its people — and now you know your way around. 🐻", [{ label: "🎉", className: "success" }]);
    else
      popup("muensterPopup", `🏰 Berner Münster\n\nSwitzerland's tallest cathedral (100 m). Climb 312 steps for the view!\n\nKeep hunting — ${CLUES.length - found.size} clue(s) still hidden.`);
  });

  console.log("Old Town hunt ready");
});
