import{o as h,p as s}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";const o=[{q:"🐻 What animal is the symbol of Bern?",a:["Eagle","Bear","Lion"],correct:1,fact:"The bear has been Bern's heraldic animal since the city was founded in 1191."},{q:"🏛️ What is the German name of the Swiss parliament building?",a:["Bundeshaus","Reichstag","Rathaus"],correct:0,fact:"The Bundeshaus has housed the Federal Assembly since 1902."},{q:"🌊 Which river flows through Bern?",a:["Rhine","Aare","Limmat"],correct:1,fact:"The Aare loops almost all the way around Bern's old town."},{q:"🕰️ How old is the Zytglogge clock tower (roughly)?",a:["~100 years","~400 years","~800 years"],correct:2,fact:"The Zytglogge was built around 1218–1220 — over 800 years old!"}];h(()=>{let r=0;const t=new Set;for(let e=0;e<o.length;e++)WA.room.area.onEnter("quiz"+e).subscribe(()=>{const a=o[e];if(t.has(e)){s(`quiz${e}Popup`,`✔️ Already answered.

💡 ${a.fact}`);return}s(`quiz${e}Popup`,a.q,a.a.map((l,c)=>({label:l,className:"primary",cb:()=>{t.add(e);const n=c===a.correct;n&&r++;const i=`

🏅 Score: ${r}/${o.length}`+(t.size===o.length?r===o.length?" — perfect! 🎉":" — all done!":"");s(`quiz${e}Popup`,`${n?"✅ Correct!":"❌ Not quite."}

💡 ${a.fact}${i}`)}})))});console.log("Bärengraben trivia ready")});
//# sourceMappingURL=baerengraben-5d1f4185.js.map
