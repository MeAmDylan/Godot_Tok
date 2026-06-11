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
- Browser `localStorage` for playlists and user-added videos
- Responsive layout: bottom nav on mobile, side rail on desktop

---

## Credits

- [GDQuest](https://gdquest.github.io/learn-gdscript/) — Learn GDScript From Zero, free and open source (CC BY 4.0)
- [Godot Engine](https://godotengine.org) — documentation and logo (CC BY 4.0)
- [Brackeys](https://www.youtube.com/@Brackeys), [Clear Code](https://www.youtube.com/@ClearCode), [GDQuest](https://www.youtube.com/@GDQuest), [GodotCon](https://www.youtube.com/@GodotEngineOfficial), [FencerDevLog](https://www.youtube.com/@FencerDevLog) — seeded video content
- Claude fable for some code

---

## License

MIT
