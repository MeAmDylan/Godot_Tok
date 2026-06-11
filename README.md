# GodotTok

A TikTok-style video feed for Godot Engine game developers. Vertical swipe feed of Godot and indie dev tutorials from YouTube and TikTok, with the official Godot documentation and the GDQuest Learn GDScript from Zero app built in.

Runs as a Progressive Web App. One HTML file, no backend, no account, no build step.

**Live app:** https://meamdylan.github.io/Godot_Tok/Index.html

---

## Features

- Vertical snap-scroll video feed, YouTube and TikTok
- Tap to pause / play (YouTube)
- Hold for 2× speed (YouTube)
- Share link, save to private on-device playlist
- Indie game dev tip cards interleaved in the feed
- Longform toggle to show or hide longer tutorials
- Godot official documentation embedded
- GDQuest Learn GDScript From Zero app embedded
- Add any YouTube or TikTok video by pasting a URL
- Nord dark theme
- Responsive: phone, tablet, desktop, Galaxy Z Fold 5

---

## Install as an App (PWA)

1. Open the live link above in **Chrome** on Android
2. Tap the three-dot menu → **Add to Home screen**
3. Opens fullscreen like a native app, no browser UI

---

## Adding Videos

Tap the **+** tab. Paste any YouTube or TikTok URL.

Supported YouTube formats: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`

Supported TikTok format: full URL containing `@user/video/123...`

> If you copy a short `vm.tiktok.com` link from the TikTok app, open it in a browser first and copy the full URL from the address bar.

Tick **longform** when adding longer tutorials so they stay hidden by default and only appear when you switch the longform toggle on in the feed.

Added videos are stored on your device only.

---

## Self Hosting

The app is a single `Index.html` file.

**GitHub Pages (what this repo uses):**

1. Fork this repo
2. Go to Settings → Pages → Source: main branch, root folder
3. Your URL will be `https://YOUR-USERNAME.github.io/Godot_Tok/Index.html`

**Local:**

```bash
python -m http.server 8080
# then open http://localhost:8080/Index.html
```

**Docker / nginx:** drop the file into any static file server. No server-side code required.

---

## Pre-seeded Content

| Creator | Topic |
|---|---|
| Brackeys | Godot 4 beginner series |
| GDQuest | GDScript patterns and tips |
| Clear Code | Godot 4 introduction |
| GodotCon 2025 | Official talks and workshops |
| FencerDevLog | 3D particle effects |

Add your own channels and videos via the + tab.

---

## Tech

- Plain HTML + CSS + vanilla JavaScript
- No framework, no build step, no dependencies
- YouTube IFrame postMessage API for tap-to-pause and 2× speed
- Browser localStorage for playlists and user-added videos
- Responsive layout: bottom nav on mobile, side rail on desktop

---

## Credits

- [GDQuest](https://gdquest.github.io/learn-gdscript/) — Learn GDScript From Zero, free and open source (CC BY 4.0)
- [Godot Engine](https://godotengine.org) — documentation and logo (CC BY 4.0)
- Brackeys, Clear Code, GDQuest, GodotCon, FencerDevLog — seeded video content

---

## License

MIT

---

## Roadmap

Things to add, roughly in priority order.

**More pre-seeded videos**
Wider coverage of the Godot ecosystem — HeartBeast, Bitlytic, Game Endeavor, DevWorm, official GodotCon archives, and short-form tips from TikTok creators. Categorised by topic so the tag filter actually has density.

**In-browser GDScript workspace**
A lightweight code editor tab with syntax highlighting for GDScript. Useful for sketching out logic, testing snippets, and following along with tutorials without switching apps. Likely built on CodeMirror or a plain textarea with a Fira Code font and Nord colours to start.

**Flashcards and tests**
Spaced-repetition flashcards covering GDScript syntax, common node types, signals, physics layers, and Godot-specific patterns. A quick multiple-choice quiz mode at the end of a session. Deck stored locally so progress persists between sessions.

**GDScript cheatsheet**
A single-screen quick reference: variable types, built-in functions, node lifecycle methods, common Vector2 / Vector3 operations, signal syntax. Faster than opening the docs for things you look up ten times a day.

**Offline mode**
Full service worker so the app shell, tip cards, cheatsheet, and any cached docs pages load without a connection. Videos will still need the internet but everything else should work on a plane.

**Devlog RSS feed**
Pull recent posts from indie Godot devlogs (itch.io, personal blogs) into a read-later list. Good for passive learning and staying connected to what people are actually shipping.

**Keyboard shortcuts for desktop**
Space to pause, arrow keys to skip between videos, F for fullscreen, M to mute. The mobile gestures already work; desktop needs the same parity.

---

*Pull requests welcome. If you add something, keep it as a single HTML file with no build step.*
