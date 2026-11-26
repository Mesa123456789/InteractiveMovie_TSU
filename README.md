# ร่วมค้นพบไปกับหมวย

A Thai-language interactive film about an exchange student in winter Beijing. The six presentation episodes follow seven main web scenes and their branches. Viewers make three choices, build a Beijing breakfast, receive a temple blessing and arrange a Mandarin sentence. Playback returns to Home after the last scene, where «เริ่มใหม่» starts a new playthrough.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The experience stores the active playthrough and settings in the current browser. Journey replays are isolated, and browsing episode details on Home leaves playback progress intact. Watch is designed for landscape on phones.

```sh
npm run lint
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Playwright uses Chromium at 1440 × 900 and at iPhone 13 viewport sizes. Screenshots, failure traces and reports are local test outputs. The development debug control is in the lower right and can jump to any narrative node or the prayer reveal, inspect state, unlock checkpoints or reset progress.

## Implementation

- `src/app` contains the Home, Watch and Journey pages, the legacy ending redirect, and styles.
- `src/data` contains screenplay cuts, the episode map, interactions and media assignments.
- `src/engine` resolves the narrative, frame boundaries, timeline and game rules.
- `src/stores/useMovieStore.ts` manages versioned progress, unlocks and settings with Zustand and keeps replay in memory.
- `src/components/player` handles still and video playback, controls, subtitles, retries and orientation. `src/features` contains Journey and the three games.
- Motion for React handles component transitions, gestures and selection feedback. GSAP drives the reversible homepage episode reveal and the single prayer flash. CSS handles ambient effects, and dnd-kit provides pointer and keyboard tile movement.

## Swap in approved media

Place stills, final clips, audio and subtitle tracks in `public/`, then run `npm run assets`. Use the generated IDs in `src/data/asset-mapping.ts`. A still can be replaced by exact shot ID or by screenplay cut. For a final clip spanning an entire sequence, use `sequenceMedia` in `src/data/shots.ts` with the same narrative node, a video asset ID, optional start or interaction time in seconds, and a final-frame still when available. The narrative graph stays the same.

See [asset mapping](docs/asset-mapping.md) for examples and [implementation notes](docs/implementation-notes.md) for the preview assumptions.
