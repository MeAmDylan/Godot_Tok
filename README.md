# GodotTok

A TikTok style video feed for Godot Engine game developers. Vertical swipe feed of Godot and GDScript tutorials from YouTube and TikTok, with a built in GDScript cheatsheet, flashcards, the official docs, KidsCanCode recipes, and the GDQuest Learn GDScript app all in one place.

Runs as a Progressive Web App. One HTML file, no backend, no account, no build step.

**Live app:** https://meamdylan.github.io/Godot_Tok/Index.html

---

## Features

**Feed**
- Vertical snap-scroll video feed — YouTube and TikTok
- Tap to pause / play
- Double-tap left third to rewind 10 seconds
- Double-tap right third to skip forward 10 seconds
- Hold anywhere for 2× speed
- Drag the scrubber bar at the bottom of any video to seek
- Mute / unmute toggle per video
- Indie game dev tip cards interleaved at random
- Feed order randomised on every app launch
- Longform toggle to show or hide longer tutorials
- Share or save any video to your on-device playlist

**Search**
- Live search across all seeded and user-added videos
- One-tap links to search the Godot docs, GDQuest, and Godot QA for any term

**Learn**
- GDQuest Learn GDScript From Zero app embedded
- Flashcard deck with 25 built-in GDScript / Godot cards
- Study mode with flip animation, skip, and got-it progression
- Add custom flashcards via the in-app form or directly in the HTML

**Reference**
- Godot official documentation embedded with quick-nav chips
- Full inline GDScript cheatsheet: variables, functions, control flow, arrays, signals, nodes, CharacterBody2D movement, input, Vector2, tween, node type table
- KidsCanCode Godot 4 Recipes embedded

**General**
- Add any YouTube or TikTok video by pasting a URL
- On-device playlist / saved videos
- Nord dark theme
- Responsive: phone, tablet, desktop, Galaxy Z Fold
- Installable as a PWA with a custom app icon

---

## Install as an App (PWA)

1. Upload both `Index.html` and `icon.png` to your GitHub repo root
2. Open the live link in **Chrome** on Android
3. Chrome menu → **Add to Home screen**

The app opens fullscreen with the custom icon. Both files must be in the repo for the icon to work.

---

## Adding Videos

**In the app:** tap the **+** tab, paste a YouTube or TikTok URL.

**In the HTML file:** open `Index.html` in a text editor, search for `ADD VIDEOS HERE`. Copy any existing line and change four values:

```js
{id:'yt_YOURID', type:'yt', vid:'YOURID', title:'Title', creator:'Name', long:false},
```

- `vid` — YouTube: the 11-character string after `v=` in the URL. TikTok: the number at the end of `@user/video/NUMBER`
- `type` — `'yt'` for YouTube, `'tt'` for TikTok
- `long` — `false` for shorts and regular videos, `true` for long tutorials (hidden behind the longform toggle)
- For TikTok add `handle:'@username'`

> TikTok: use the full URL from your browser address bar. Short `vm.tiktok.com` links will not work — open them in a browser first.

---

## Adding Custom Flashcards

**In the app:** Learn tab → Flashcards → Add Card.

**In the HTML file:** search for `ADD CUSTOM FLASHCARDS HERE` near the top of the script section:

```js
const MY_CARDS = [
  {q:'Your question here', a:'Your answer here'},
  {q:'What node for physics movement?', a:'CharacterBody2D', code:'move_and_slide()'},
];
```

Add a `code` field to show a code block on the back of the card.

---

## Self Hosting

The app is a single `Index.html` file plus `icon.png`.

**GitHub Pages (what this repo uses):**

1. Fork this repo
2. Settings → Pages → Source: main branch, root folder
3. Your URL: `https://YOUR-USERNAME.github.io/Godot_Tok/Index.html`

**Local:**

```bash
python -m http.server 8080
# open http://localhost:8080/Index.html
```

**Any static host:** drop both files onto Netlify, Cloudflare Pages, or any nginx / Apache server. No server-side code required.

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
| GodotCon 2025 | Official talks — C#, OS dev, plugins, web |
| FencerDevLog | 3D particle trails |
| @godot_tutorial | TikTok tips |
| Red Fools Studio | Full 2025 beginner course (longform) |

---

## Tech

- Plain HTML + CSS + vanilla JavaScript
- No framework, no build step, no dependencies
- YouTube IFrame postMessage API — tap-to-pause, 2× speed, seek, scrubber via `infoDelivery` events
- Fisher-Yates shuffle on app launch for feed randomisation
- Browser localStorage for playlists, user videos, and custom flashcards
- Responsive layout: bottom nav on mobile, side rail on desktop

---

## Credits

- [GDQuest](https://gdquest.github.io/learn-gdscript/) — Learn GDScript From Zero, CC BY 4.0
- [Godot Engine](https://godotengine.org) — documentation (CC BY 4.0)
- [KidsCanCode](https://kidscancode.org/godot_recipes/4.x/) — Godot 4 Recipes
- Godot logo: Andrea Calabrò / Godot Foundation, CC BY 4.0
- App icon: AI generated, Nord colour palette Godot icon. THIS WILL BE REPLACED WITH REAL ART. (currnetly a placeholder.
- App made by me, with assistnce in generated code.

---

## License

MIT

---

## Roadmap

**Offline mode / service worker**
Cache the app shell, tip cards, cheatsheet, and flashcards locally so everything except video playback works without a connection.

**In-browser GDScript workspace**
A lightweight code editor tab with syntax highlighting for sketching logic and following along with tutorials without switching apps.

**Keyboard shortcuts for desktop**
Space to pause, arrow keys to navigate, F for fullscreen, M to mute.

**Spaced repetition for flashcards**
Track which cards you struggled with and surface them more often using a simple SM-2 algorithm.

**Devlog RSS feed**
Pull recent posts from indie Godot devlogs into a read-later list.

---

*Pull requests welcome. Keep it as a single HTML file with no build step.*
