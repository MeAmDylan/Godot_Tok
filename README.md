# GodotTok

A TikTok-style video feed for Godot Engine game developers. It combines a vertical tutorial feed with sourced flashcards, quizzes, guides, references, and the GDQuest Learn GDScript app.

Runs as a static Progressive Web App with no backend, account, framework, or build step.

**Live app:** https://meamdylan.github.io/Godot_Tok/

---

## Features

**Feed**
- Vertical snap-scroll feed for YouTube and TikTok
- Tap to pause / play
- Double-tap left third to rewind 10 seconds
- Double-tap right third to skip forward 10 seconds
- Hold anywhere for 2× speed
- Drag the scrubber bar at the bottom of any video to seek
- Mute toggle and adjustable volume slider for YouTube videos
- Visible fullscreen control with an in-app theatre fallback
- Indie game dev tip cards interleaved at random
- Feed order randomised on every app launch
- Longform toggle to show or hide longer tutorials
- Setting to show or hide TikTok videos
- Share or save any video to your on-device playlist
- Lazy loading keeps only nearby video embeds active
- Desktop shortcuts: Space to pause, arrow keys to navigate or seek, M to mute, and F for fullscreen

**Search**
- Live search across all seeded and user added videos
- One tap links to search the Godot docs, GDQuest, and Godot QA for any term

**Learn**
- GDQuest Learn GDScript From Zero app embedded
- 70 Godot 4.7 flashcards across seven categories and three difficulty levels
- Four-rating spaced review with filters, progress, and stable item IDs
- 63 sourced quiz questions with explanations, missed-question review, and mastery tracking
- Christophe's interactive guides and cheatsheet catalogue
- Custom flashcards with category, topic, and difficulty fields

**Reference**
- Godot official documentation embedded with quick-nav chips
- Full inline GDScript cheatsheet: variables, functions, control flow, arrays, signals, nodes, CharacterBody2D movement, input, Vector2, tween, node type table
- KidsCanCode Godot 4 Recipes embedded

**General**
- Add any YouTube or TikTok video by pasting a URL
- On-device playlist / saved videos
- Nord dark theme
- Responsive: phone, tablet, desktop, Galaxy Z Fold
- Expandable desktop sidebar and viewport-sized video workspace
- Installable as a PWA with a custom app icon
- In-app install and update notifications where supported
- Offline app shell for the cheatsheet, flashcards, and saved local data

---

## Install as an App (PWA)

1. Host the repository files over HTTPS
2. Open the live link in **Chrome** on Android
3. Chrome menu → **Add to Home screen**

The app opens in standalone mode. Video playback and external learning sites still require a connection.

---

## Adding Videos

**In the app:** tap the **+** tab, paste a YouTube or TikTok URL.

**In the HTML file:** open `index.html` in a text editor, search for `ADD VIDEOS HERE`. Copy an existing line and change its values:

```js
{id:'yt_YOURID', type:'yt', vid:'YOURID', title:'Title', creator:'Name', long:false},
```

- `vid`: YouTube uses the 11-character string after `v=`. TikTok uses the number at the end of `@user/video/NUMBER`.
- `type`: `'yt'` for YouTube, `'tt'` for TikTok.
- `long`: `false` for shorts and regular videos, `true` for long tutorials.
- For TikTok add `handle:'@username'`

> TikTok: use the full URL from your browser address bar. Open shortened `vm.tiktok.com` links first, then copy the resolved URL.

---

## Adding Custom Flashcards

**In the app:** Learn tab → Flashcards → Add Card.

**In the source:** built-in content is stored in `js/data/learning.js` and validated when loaded:

```js
const flashcards = [
  // Each item includes a stable ID, category, topic, difficulty,
  // Godot version, and an approved source URL.
];
```

Built-in code-bearing items must cite Godot 4.7 documentation, the Godot repository, or GDQuest.

---

## Self Hosting

The app is static and requires `index.html`, `assets/`, `js/`, `manifest.webmanifest`, `sw.js`, `icon.png`, and `icon-192.png`.

**GitHub Pages (what this repo uses):**

1. Fork this repo
2. Settings → Pages → Source: main branch, root folder
3. Your URL: `https://YOUR-USERNAME.github.io/Godot_Tok/`

**Local:**

```bash
python -m http.server 8080
# open http://localhost:8080/
```

**Any static host:** deploy the repository contents to a static host. No server-side code is required.

---

## Pre-seeded Content

| Creator | Type |
|---|---|
| Brackeys | Godot 4 beginner series (longform) |
| Clear Code | Ultimate Godot 4 introduction (longform) |
| GDQuest | GDScript tips and roadmap |
| Zenva | Godot 4.6 news, AI and Godot |
| DevWorm | Resources vs Dictionaries |
| Bitlytic | Disabling nodes tip |
| DeveloperEzra | Procedural dungeon generation |
| Chap.C Creates | 3D pathfinding |
| GodotCon 2025 | Official talks: C#, OS development, plugins, web |
| FencerDevLog | 3D particle trails |
| @godot_tutorial | TikTok tips |
| Red Fools Studio | Full 2025 beginner course (longform) |

---

## Tech

- Plain HTML + CSS + vanilla JavaScript
- No framework, no build step, no dependencies
- Official YouTube IFrame Player API for playback, volume, speed, seeking, and scrubber updates
- Nearby-only iframe lifecycle to reduce mobile memory and network use
- Fisher-Yates shuffle on app launch for feed randomisation
- Browser `localStorage` for playlists, user videos, custom flashcards, and learning progress
- Web app manifest and service worker for installation and offline app-shell caching
- Responsive layout: bottom nav on mobile, side rail on desktop

---

## Credits

- [GDQuest](https://gdquest.github.io/learn-gdscript/): Learn GDScript From Zero, CC BY 4.0
- [Godot Engine](https://godotengine.org): documentation, CC BY 4.0
- [KidsCanCode](https://kidscancode.org/godot_recipes/4.x/): Godot 4 Recipes
- Godot logo: Andrea Calabrò / Godot Foundation, CC BY 4.0
- App icon: AI-generated placeholder using the Nord colour palette
- App created by Dylan with assistance from generated code

---

## License

[MIT](LICENSE)

---

## Roadmap

**In-browser GDScript workspace**
A lightweight code editor tab with syntax highlighting for sketching logic and following along with tutorials without switching apps.

**Topic tags and filters**
Filter the feed by 2D, 3D, shaders, UI, beginner, advanced, and creator.

**Export and import**
Back up added videos, saved videos, flashcards, and learning progress as JSON.

**Content health checks**
Detect removed or non-embeddable videos and keep seeded tutorial metadata current.

**Devlog RSS feed**
Pull recent posts from indie Godot devlogs into a read-later list.

---

*Pull requests are welcome. Keep the application dependency-free and build-step-free.*
