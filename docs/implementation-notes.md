# Implementation notes

The V2 specification was used as the authority because the user explicitly designated it as such. The HTML prototype was consulted for interaction behavior and the embedded reference images for the player and Coverflow layouts. The four gameplay paths that branch (first choice, breakfast result and both location choices) produce sixteen valid combinations that all converge on the same ending.

## Assumptions

- There were no approved shot stills, edited clips, food photos, dialogue audio, subtitle tracks or Mandarin pronunciation files in the worktree. Playback uses labeled generated stills. The sentence game can use an installed Mandarin voice. That voice is platform-dependent. UI and cut descriptions are independent from subtitles.
- Still shots default to four seconds. Premiere timecodes and exact montage cut ordering remain editorial inputs, especially SC04 1C–3D.
- The traditional meal is provisionally configured as youtiao, savory tofu and jianbing. The combination is the V2 prototype rule. It can be changed in `src/data/foods.ts`.
- Prayer category and blessing are deterministic. V2 copy and Pinyin are editable in `src/data/prayers.ts`. The localized strings have not received a language-team review.
- The active playthrough is persisted in one browser. A new playthrough resets the route and episode progress but retains unlocked Journey checkpoints by default. This behavior is controlled in `useMovieStore.ts`. The latest unlocked route through Choice 3 determines its replay frame.
- A Journey replay returns to Journey once its configured branch or follow-up sequence finishes. Episode review starts at the route already taken where known and ends at that episode’s completion boundary. Replay has a close action and its own transient state. Refreshing a replay exits back to the saved main timeline.
- Video assets run against the same state machine and can contain duration, trim, subtitles and a final-frame reference. A temporary synthetic MP4 and VTT verified browser playback, duration detection, both skips, seeking, mute, subtitles, refresh and final-frame freezing. Approved video and caption media were unavailable for editorial validation.

## Motion and accessibility

Interactive elements use a shared spring and short feedback timings. The portrait prompt preserves the mounted Watch state when rotated. The prayer result is committed when “ขอพร” is pressed, so refresh during or after the flash shows the card directly. The sentence game supports touch placement, pointer drag, Space/arrow-key drag and Enter placement. The site plays full animations automatically, including when the browser requests reduced motion.

## UI references

TSU_UIExample supplied proportions and colors for playback controls, choices, the breakfast menu and the sentence board. The controls, frames, cloud ornament and word tiles were recreated with HTML, CSS and SVG. Nine new generated food photographs illustrate the V2 menu. Existing movie stills and layouts support the screens without new references.

## Animation libraries

- Choice and blessing use scoped GSAP timelines with the official React hook. The choice advances the story from the timeline completion callback. GSAP and its React hook ship under the GSAP Standard License. [GSAP Timeline](https://gsap.com/docs/v3/GSAP/Timeline/) · [React integration](https://github.com/greensock/react) · [License](https://gsap.com/community/standard-license/)
- Journey uses the MIT-licensed Swiper React Coverflow, Navigation, Pagination and Keyboard modules. Each tab renders two cycles of three items to satisfy Swiper's centered loop requirements. Pagination represents the three unique checkpoints. [Swiper React](https://swiperjs.com/react) · [Loop options](https://swiperjs.com/swiper-api#param-loop) · [License](https://github.com/nolimits4web/swiper/blob/master/LICENSE)
- Episode details use Motion for React with AnimatePresence inside a native modal dialog. The dialog stays in the top layer during exit and focus returns to the initiating episode card. Motion is MIT-licensed. [AnimatePresence](https://motion.dev/docs/react-animate-presence) · [License](https://github.com/motiondivision/motion/blob/main/LICENSE.md)
- The blessing uses the MIT-licensed tsParticles Basic engine for floating gold particles. GSAP starts, fades and stops that canvas within the reveal timeline. The project evaluated React Bits Particles, Magic UI Particles and Aceternity Sparkles before choosing tsParticles Basic. [tsParticles](https://github.com/tsparticles/tsparticles) · [React Bits](https://reactbits.dev/backgrounds/particles) · [Magic UI](https://magicui.design/docs/components/particles) · [Aceternity](https://ui.aceternity.com/components/sparkles)
