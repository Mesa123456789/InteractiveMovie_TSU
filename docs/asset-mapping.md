# Media inventory and cut mapping

The initial Git worktree contained only its Git metadata. There was no public directory or approved film media. The supplied V2 document, approved HTML, screenplay and UX handoff informed the flow and UI. The two layout references were embedded in the V2 document. The standalone Journey screenshot matched the embedded reference. These references are retained outside the production media catalog.

The film currently uses purpose-made generated preview stills. The player identifies them as “ภาพประกอบชั่วคราว” and shows a short screenplay action description as a preview caption. The preview caption is independent of the subtitle selector. Several related cuts share a thematic still. Some visual action is represented only by the caption until the corresponding cuts arrive. Choice 3 uses a different final still for each location branch.

The built-in ImageGen prompts used a winter Beijing lantern-alley hero and two nine-panel sets of scene-specific illustrations, covering the cafeteria, dorm, dumpling preparation, breakfast, Lama Temple, Wangfujing, Summer Palace, snowy campus, Shichahai, Thai kitchen, sink, street, breakfast reaction, prayer-wheel close-up, temple exit, Nanluoguxiang, ordering and departure. The cropped WebP outputs are in `public/preview/`.

The breakfast redesign uses a separate set of nine newly generated food photographs. The ImageGen prompt specified a three-by-three sheet of the V2 dishes on ivory porcelain with warm window light and walnut tables. Per-dish WebPs are in `public/preview/food/` and mapped by food ID in `asset-mapping.ts`. The PNGs in TSU_UIExample served as visual references only.

| Episode | Narrative node | Screenplay references | Preview artwork |
| --- | --- | --- | --- |
| 1 | s1 | SC01 1A–9A, 1B–6B, 1C–6C. SC02 1A–4A | Cafeteria, Thai kitchen, dorm, sink, winter street, lantern alley |
| 2 | s1b | SC02.2 1–3 | Winter street, dorm |
| 2 | s2 | SC02 5A–6A, 1C–3C. SC03 1A–6A | Dumplings, Thai kitchen, ordering, winter street, breakfast |
| 3 | s3a / s3b | SC03 6A–7A / SC03.2 1A–3A | Breakfast reaction |
| 3 | temple | SC04 1A–5A | Temple, prayer-wheel close-up |
| 4 | s4 | SC04 6A–7A | Temple, temple exit |
| 5 | s5a / s5b | SC04 1B–3B / 4B–5B | Wangfujing / Summer Palace |
| 6 | s6a / s6b | SC04 6B–7B / provisional 1C–3D | Hutong / snowy campus |
| 6 | shared | SC05 1A–6A. SC06 1A–3A | Shichahai, lantern alley, ordering |
| 6 | s7 | SC06 4A–6A | Ordering, dumplings, departure |

| Checkpoint | Expected final frame | Preview ID |
| --- | --- | --- |
| C1 | SC02/4A | preview/lantern-alley.webp |
| G1 | SC03/6A | preview/breakfast.webp |
| G2 | SC04/5A | preview/prayer-wheel.webp |
| C2 | SC04/7A | preview/temple-exit.webp |
| C3 via 5A | SC04/3B | preview/wangfujing.webp |
| C3 via 5B | SC04/5B | preview/palace.webp |
| G3 | SC06/3A | preview/ordering.webp |
| Ending | SC06/6A | preview/ending.webp |

## Delivering new media

1. Put source files under `public/` and regenerate `src/data/assets.generated.ts` with `npm run assets`. The scanner accepts case-insensitive PNG, JPG, JPEG, WEBP, AVIF, MP4, WEBM, MP3, WAV and VTT recursively.
2. Configure `shotMedia` in `src/data/asset-mapping.ts`. Use `"s1/SC02/4A": { assetId: "stills/restaurant.webp" }` to map a specific instance, or `"SC03/6A"` to apply a shared cut mapping.
3. For a full clip, populate the appropriate `sequenceMedia` array. Example fields follow. Find the cut against the actual exported file before setting the interaction time. Omitting it plays to the media end.

```ts
{
  id: "s1/final",
  webSceneId: "s1",
  screenplayScene: "SC01–SC02",
  cut: "4A",
  description: "หมวยหยุดหน้าร้านเกี๊ยว",
  assetId: "final/scene-1.mp4",
  fallbackId: stills.hero,
  mediaType: "video",
  durationMs: 108000,
  interactionTime: 108,
  freezeAssetId: "final/c1.webp",
  subtitleTracks: { th: "captions/s1-th.vtt", en: "captions/s1-en.vtt" },
  cameraMotion: "static",
  transition: "dissolve",
}
```

The video element supplies the actual length on metadata load. The preview duration is an estimate while metadata is loading. A `freezeAssetId` still generated from the final timecode gives consistent freezing across browsers and supplies artwork to Journey. With no explicit still, Watch seeks the last video to the boundary and pauses it. The custom playback slider is scoped to the current sequence.

4. Map the hero, episode, checkpoint and food artwork in `asset-mapping.ts`. Choice overlays use their preceding frozen movie frame. Configure `artwork.mandarinAudio` when approved audio exists.
