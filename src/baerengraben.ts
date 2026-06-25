/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

type Q = { q: string; a: string[]; correct: number; fact: string };
const QUIZ: Q[] = [
  { q: "🐻 What animal is the symbol of Bern?", a: ["Eagle", "Bear", "Lion"], correct: 1,
    fact: "The bear has been Bern's heraldic animal since the city was founded in 1191." },
  { q: "🏛️ What is the German name of the Swiss parliament building?", a: ["Bundeshaus", "Reichstag", "Rathaus"], correct: 0,
    fact: "The Bundeshaus has housed the Federal Assembly since 1902." },
  { q: "🌊 Which river flows through Bern?", a: ["Rhine", "Aare", "Limmat"], correct: 1,
    fact: "The Aare loops almost all the way around Bern's old town." },
  { q: "🕰️ How old is the Zytglogge clock tower (roughly)?", a: ["~100 years", "~400 years", "~800 years"], correct: 2,
    fact: "The Zytglogge was built around 1218–1220 — over 800 years old!" },
];

onReady(() => {
  let score = 0;
  const done = new Set<number>();
  for (let i = 0; i < QUIZ.length; i++) {
    WA.room.area.onEnter("quiz" + i).subscribe(() => {
      const Q = QUIZ[i];
      if (done.has(i)) { popup(`quiz${i}Popup`, `✔️ Already answered.\n\n💡 ${Q.fact}`); return; }
      popup(
        `quiz${i}Popup`,
        Q.q,
        Q.a.map((opt, idx) => ({
          label: opt,
          className: "primary" as const,
          cb: () => {
            done.add(i);
            const ok = idx === Q.correct;
            if (ok) score++;
            const tally = `\n\n🏅 Score: ${score}/${QUIZ.length}` + (done.size === QUIZ.length ? (score === QUIZ.length ? " — perfect! 🎉" : " — all done!") : "");
            popup(`quiz${i}Popup`, `${ok ? "✅ Correct!" : "❌ Not quite."}\n\n💡 ${Q.fact}${tally}`);
          },
        }))
      );
    });
  }
  console.log("Bärengraben trivia ready");
});
