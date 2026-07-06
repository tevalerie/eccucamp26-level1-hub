# ECCU Generative AI & Python Summer Camp 2026 — Level 1 Hub

Landing page, curriculum hub, and resource repository for the
**ECCU Generative AI & Python Summer Camp 2026 · Level 1 · Chat-Bot Edition**.

> The Bot is the GPS. The Human is the Driver.

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page: 4-week journey, Day 1 Vision-Cast, curriculum, case studies, safety, facilitator room, **two-shelf resource repository** (camper / facilitator), past camps. |
| `wiki.html` | "The Studio" camp wiki: bulletin board, camper room, curriculum quick-reference, gallery, free intro course, facilitator room, parents room. |

## Facts

- **Dates:** Jul 13 – Aug 7 2026 · weekdays 9:00 am – 4:00 pm · free (ECCB & TaiwanICDF-supported)
- **Region:** all eight ECCU member countries
- **Level 2 (Multimedia Edition):** hosted separately at <https://enoete.github.io/eccucamp26_masterhub>

## Editing the repository shelf

All resource rows live in one JavaScript array (`var SHELF = [...]`) at the bottom of
`index.html`. One object per file — edit the `url` field to point at a new Drive link.
`aud: "facilitator"` rows appear only on the Facilitator Shelf; `camper`/`parent` rows
appear on both shelves.

Files are hosted in the shared Google Drive folder
(`AI & Python IDD, Curriculum and Lesson Plans`); the site is only the index.
For public access the Drive folder must be shared as **Anyone with the link → Viewer**.

## Deploy

Static site — no build step. Deploy the repo root on Netlify
(build command: none · publish directory: `/`).
