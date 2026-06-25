# 🐻 Connect Bern — WorkAdventure Worlds

This repo now contains **10 themed worlds** built around the iconic places of Bern.
Open `index.html` (the deployed landing page) to see them all with thumbnails and
Play buttons. Each world is one `.tmj` map file in the repo root.

| World | File | What's special |
|-------|------|----------------|
| 🐻 Connect Bern — Hub | `connectbern.tmj` | Central map of Bern landmarks; portals to every world |
| 🚉 Central Station — Welcome | `station.tmj` | Onboarding guide + "Let's Talk" support corner (issue #2, #5) |
| 🏠 Staying in Bern | `staying-in-bern.tmj` | Kitchen/bath/living read-&-confirm popups + **day/night** toggle |
| 📚 Library — Ask Paola | `library.tmj` | Bookshelves open embedded websites; helper NPC |
| 🏛️ Parliament — Meeting Halls | `parliament.tmj` | Jitsi video chambers + a vote mini-game |
| 🐻 Bärengraben Trivia | `baerengraben.tmj` | 4-question Bern quiz with scoring |
| 🕰️ Zytglogge Time Puzzle | `zytglogge.tmj` | Live clock + hour-plate sequence puzzle |
| 🌹 Rose Garden | `rosengarten.tmj` | Chill social space with city viewpoints |
| 🏰 Old Town Treasure Hunt | `oldtown.tmj` | 5-clue scavenger hunt around the Münster |
| 🌊 Aare Float Challenge | `aare-float.tmj` | Timed float Eichholz→Marzili, collect ducks 🦆 |

### 🔁 How to switch between worlds (the `.tmj` files)

1. **From the landing page** (`index.html`): click a world's **Play** button. Open several tabs to try worlds simultaneously.
2. **In-game:** walk onto a glowing exit tile. The Hub links to all worlds; every world has a portal back.
3. **By URL:** a world link ends in its map file, e.g. `…/connectbern.tmj`. Change the filename (`library.tmj`, `aare-float.tmj`, …) to load another world.

### 🛠️ Regenerate / edit the maps

The maps are produced by a generator so they're easy to tweak:

```bash
node tools/generate-maps.mjs            # rebuild all 10 .tmj files
pwsh -File tools/thumbnails.ps1         # rebuild the 512×512 thumbnails (Windows)
```

You can also open any `.tmj` in [Tiled](https://www.mapeditor.org/) to edit by hand.
Each world's interactive script lives in `src/<world>.ts` (shared helpers in `src/lib.ts`).

---

Check out the issues section to see our progress and also this issue:
https://github.com/connectbern/meta/issues/2


Some ideas we are thinking of implementing:


🏠 Interactive Space Map – Idea 🏠

🍳 Kitchen, 🚿 Bathroom, 🛋 Living Room – all mapped out in the system.

When you go to one of these spots, a website pops up 💻.

Optional: you’re blocked ⛔ until you:

Read the page 📖

Click a confirmation ✅

(Or even answer a short quiz 📝 — maybe too advanced for now).

📍 Two Main Areas in the Map

Connect Bern 🔗

The main interactive map area with different rooms and features.

Staying in Bern 🏡

Part 1: Info & guidelines for volunteers 🤝

Part 2: Social space to meet people 🥳

Day mode 🌞 – lively and welcoming.

Night mode 🌙 – a different look & vibe.

💡 Extra Touch:
A day/night theme change would make the space feel alive and dynamic ✨.






Here's the description for the developer:


# 🗺️ WorkAdventure Map Starter Kit

<a href="https://discord.gg/G6Xh9ZM9aR" target="blank"><img src="https://img.shields.io/discord/821338762134290432.svg?style=flat&label=Join%20Community&color=7289DA" alt="Join Community Badge"/></a>
<a href="https://x.com/workadventure_" target="blank"><img src="https://img.shields.io/twitter/follow/workadventure_.svg?style=social" /></a>
![visitors](https://vbr.nathanchung.dev/badge?page_id=workadventure.map-starter-kit&color=00cf00)

![office map thumbnail](./office.png)

🗺️ This is a starter kit to help you build your own map for [WorkAdventure](https://workadventu.re).

📚 To understand how to use this starter kit, follow [our tutorial](https://docs.workadventu.re/map-building/tiled-editor/).

👨🏻‍🔧 If you have any questions, feel free to ask in the [WorkAdventure office](https://play.staging.workadventu.re/@/tcm/workadventure/wa-village).

## 🚀 Upload your map

In the `.env` file, you can set your upload strategy to `GH_PAGES` (default) or `MAP_STORAGE`. Simply comment out the option you don't want to use.

Uploading a map using [GitHub Pages](https://docs.github.com/pages) will host your project on GitHub servers, and it's the most straightforward way to add new maps to your world.

Uploading a map using the [WA map storage](https://docs.workadventu.re/map-building/tiled-editor/publish/wa-hosted) will host your project on WA servers. It's a bit more difficult to set up, but it comes with great advantages, like being able to have private repositories.

## 🗂️ Structure

We recommend following this file structure:

- *`public/`*: Static files like PDFs or audio files
- *`src/`*: Script files or design source files
- *`tilesets/`*: All PNG tilesets

> [!TIP]
> - If you want to use more than one map file, just add the new map file in the root folder (we recommend creating a copy of *office.tmj* and editing it to avoid any mistakes).
> - We recommend using **512x512** images for the map thumbnails.
> - If you are going to create custom websites to embed in the map, please reference the HTML files in the `input` option in *vite.config.js*.

## 📜 Requirements

- Node.js version >= 18

## Installation and testing

## 🛠️ Installation and Testing

With npm installed (which comes with [Node.js](https://nodejs.org/en/)), run the following command in the root directory of the project:

```bash
npm install
```

Then, you can test your map by running:

```bash
npm run dev
```

You can also test the optimized map as it will be in production by running:

```bash
npm run build
npm run prod
```

You can manually [upload your map to the WA Map Storage]([WA Map Storage](https://github.com/workadventure/upload-maps)) by running:

```bash
npm run upload
```

The three important variables that control the upload feature are:

1. `MAP_STORAGE_URL` *(local: created in .env by the upload command / CI: to be added as a Github secret optionally)*
2. `MAP_STORAGE_API_KEY` *(local: created in .env.secret by the upload command / CI: to be added as a Github secret)*
3. `UPLOAD_DIRECTORY` *(local: created in .env by the upload command / CI: to be added as a Github secret optionally)*

Read [the documentation](https://docs.workadventu.re/map-building/tiled-editor/publish/wa-hosted) to learn more about the upload feature.

## 📜 Licenses

This project contains multiple licenses as follows:

* [Code license](./LICENSE.code) *(all files except those for other licenses)*
* [Map license](./LICENSE.map) *(`office.tmj` and the map visual as well)*
* [Assets license](./LICENSE.assets) *(the files inside the `tilesets/` folder)*

> [!IMPORTANT]
> If you add third party assets in your map, do not forget to:
> 1. Credit the author and license of a tileset with the "tilesetCopyright" property by etiding the tileset in Tiled.
> 2. Add the tileset license text in *LICENSE.assets*.
> 3. Credit the author and license of a map with the "mapCopyright" property in the custom properties of the map.
> 4. Add the map license text in *LICENSE.map*.

## ❓ Need Help

If you have any questions or need further assistance, don't hesitate to ask either by [email](mailto:hello@workadventu.re) or [Discord](https://discord.gg/G6Xh9ZM9aR)!
