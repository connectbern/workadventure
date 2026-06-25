import{o as l,p as n}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";const o=["🔎 Clue 1/5: «Under the arcades, 6 km of covered shopping keep you dry in the rain.»","🔎 Clue 2/5: «A fountain figure devours children — the Kindlifresserbrunnen!»","🔎 Clue 3/5: «Einstein wrote his theory of relativity in a flat on Kramgasse.»","🔎 Clue 4/5: «The bear has guarded this city's flag for over 800 years.»","🔎 Clue 5/5: «312 steps lead up the Münster tower to the best view in Bern.»"];l(()=>{const s=new Set;for(let e=0;e<o.length;e++)WA.room.area.onEnter("clue"+e).subscribe(()=>{const r=!s.has(e);s.add(e);const t=`

🗺️ Clues found: ${s.size}/${o.length}`;n("clue"+e+"Popup",o[e]+t+(s.size===o.length?`

🏆 You found them all! Visit the Münster to claim your discovery.`:""),[{label:r?"Got it!":"Close",className:"success"}])});WA.room.area.onEnter("muenster").subscribe(()=>{s.size===o.length?n("muensterPopup",`🏆 Treasure found!

You explored every corner of the old town. The real treasure of Bern? Its people — and now you know your way around. 🐻`,[{label:"🎉",className:"success"}]):n("muensterPopup",`🏰 Berner Münster

Switzerland's tallest cathedral (100 m). Climb 312 steps for the view!

Keep hunting — ${o.length-s.size} clue(s) still hidden.`)}),console.log("Old Town hunt ready")});
//# sourceMappingURL=oldtown-7abeff47.js.map
