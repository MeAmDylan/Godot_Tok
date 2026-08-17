# GodotTok

A TikTok-style video feed for Godot Engine game developers. It combines a vertical tutorial feed with sourced flashcards, quizzes, guides, references, and the GDQuest Learn GDScript app.

Runs as a static Progressive Web App with no backend or account. The same web code is packaged for desktop and mobile with Tauri 2.

**Live app:** https://meamdylan.github.io/Godot_Tok/

---

## Features

**Feed**
- Vertical snap-scroll feed for YouTube and TikTok
- Review-gated automatic imports from allowlisted YouTube channels
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
- Ranked in-app search across videos, flashcards, quizzes, guides, reference entries, Code Library recipes, and game bundles
- Results open inside GodotTok, including videos in the in-app player and documentation in the built-in Docs view
- External Godot Docs, GDQuest, and community searches run only after the user chooses an external action

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

**Code Library**
- 71 complete Godot 4.7.1 recipes across 2D, 3D, and Shared systems
- 18 recommended game bundles with mechanic maps and ordered assembly milestones
- Category, difficulty, keyword, node, API, and code filtering
- Exact scene trees, visual and sprite attachment, Input Map actions, Inspector settings, signal wiring, complete files, numbered setup, and test checklists
- Minimum original art and audio lists for every game bundle
- Clean and guided-comment script views plus individual and ZIP downloads
- Deep links to individual recipes and bundles
- Every recipe cites version-pinned Godot documentation, Godot Engine sources, or GDQuest
- CI exports and parses all 113 GDScript files with the official Godot 4.7.1 editor

**General**
- Add any YouTube or TikTok video by pasting a URL
- On-device playlist / saved videos
- Nord dark theme
- Responsive: phone, tablet, desktop, Galaxy Z Fold
- Expandable desktop sidebar and viewport-sized video workspace
- Installable as a PWA with a custom app icon
- In-app install and update notifications where supported
- Offline app shell for the cheatsheet, flashcards, and saved local data
- Tauri desktop packaging for Windows, Linux, Apple Silicon macOS, and Intel macOS
- Android test APK and iOS Simulator build workflows
- Signed desktop updater support that remains disabled until repository signing keys are configured
- Native builds refresh the reviewed automatic video catalogue from the live site and fall back to validated cached or bundled data

---

## Install as an App (PWA)

1. Host the repository files over HTTPS
2. Open the live link in **Chrome** on Android
3. Chrome menu → **Add to Home screen**

The app opens in standalone mode. Video playback and external learning sites still require a connection.

---

## Native Apps

GodotTok uses [Tauri 2](https://v2.tauri.app/) to package the existing HTML, CSS, and JavaScript without maintaining a second interface. `scripts/prepare-native.mjs` creates a clean `dist/` directory and a SHA-256 manifest from explicitly allowlisted app assets. Tauri loads that local bundle into the system webview.

Native-only behavior is isolated in `js/native.js` and the small Rust application in `src-tauri/`:

- External links use Tauri's official opener plugin.
- Desktop update checks use Tauri's signed updater plugin.
- The automatic YouTube catalogue is fetched from `content/videos.json`, schema-validated, deduplicated against manual videos, and cached locally. A failed or invalid response falls back safely.
- The browser PWA install and service-worker update prompts are disabled inside the native shell.

### Local desktop development

Install the [official Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system, including Node.js and Rust. Then run:

```bash
npm ci
npm test
npm run native:dev
```

Create a local installer with:

```bash
npm run native:build
```

The source configuration is audited by `npm test`. Pull requests also compile the Rust application on Ubuntu in the `Validate native app` workflow.

### Desktop releases and updates

The `Publish native desktop apps` workflow follows Tauri's [official GitHub release pipeline](https://v2.tauri.app/distribute/pipelines/github/). It creates a draft release containing Windows, Linux, Apple Silicon macOS, Intel macOS, and updater artifacts. It refuses to publish unless updater signing is configured.

One-time signing setup:

1. On a trusted local computer, generate an updater key outside this repository by following the [official Tauri updater guide](https://v2.tauri.app/plugin/updater/):

   ```bash
   npm run tauri signer generate -- -w /a/private/location/godottok.key
   ```

2. Add the public key text as the GitHub Actions secret `GODOTTOK_UPDATER_PUBLIC_KEY`.
3. Add the private key content as `TAURI_SIGNING_PRIVATE_KEY`. If it has a password, add that as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
4. Run `Publish native desktop apps` manually or push a tag matching the app version, such as `app-v0.1.0`.
5. Download and test every artifact from the draft GitHub release before publishing it.

The updater signature proves update integrity, but it is separate from operating-system trust. The workflow uses macOS ad-hoc signing by default. Public production distribution should also configure an Apple Developer ID certificate and notarization, plus a trusted Windows code-signing certificate, using Tauri's official platform signing guides.

Keep these three version values identical before each release:

- `package.json` `version`
- `src-tauri/tauri.conf.json` `version`
- `src-tauri/Cargo.toml` package `version`

### Android and iOS test builds

The `Build native mobile test apps` workflow compiles both platforms on native pull requests. A manual run can build an Android arm64 debug APK, an iOS Simulator debug app, or both. The artifacts are uploaded to that workflow run for testing.

For local mobile work, first complete Tauri's [Android and iOS prerequisites](https://v2.tauri.app/start/prerequisites/#configure-for-mobile-targets), then run:

```bash
npm ci
npm run native:android:init
npm run native:android:dev
```

On macOS with Xcode and CocoaPods:

```bash
npm ci
npm run native:ios:init
npm run native:ios:dev
```

Store-ready builds require credentials that are never committed to this repository. Android release distribution needs a private upload key and Google Play account. iOS release distribution needs an Apple Developer account, signing certificate, provisioning profile, and App Store Connect setup. Follow Tauri's official [Android signing](https://v2.tauri.app/distribute/sign/android/) and [iOS distribution](https://v2.tauri.app/distribute/app-store/) guides before submitting.

---

## Adding Videos

**In the app:** tap the **+** tab, paste a YouTube or TikTok URL.

**In the source:** edit the `manual` array in `js/data/videos.js`:

```js
{id:'yt_YOURID', type:'yt', vid:'YOURID', title:'Title', creator:'Name', long:false},
```

- `vid`: YouTube uses the 11-character string after `v=`. TikTok uses the number at the end of `@user/video/NUMBER`.
- `type`: `'yt'` for YouTube, `'tt'` for TikTok.
- `long`: `false` for shorts and regular videos, `true` for long tutorials.
- For TikTok add `handle:'@username'`

> TikTok: use the full URL from your browser address bar. Open shortened `vm.tiktok.com` links first, then copy the resolved URL.

### Automatic YouTube updates

The `Sync YouTube videos` workflow runs at 04:23 UTC every Tuesday and Friday and can also be run manually. It uses the official YouTube Data API to:

1. Resolve each allowlisted handle to its uploads playlist
2. Page through recent uploads
3. Read canonical title, creator, duration, visibility, and embed status
4. Apply source-specific Godot keyword rules
5. Remove duplicates against hand-picked content
6. Update the generated `automatic` arrays in `js/data/videos.js` and `content/videos.json`
7. Run the sync unit tests and the complete content audit
8. Open or update a pull request for human review

The workflow never merges video changes by itself.

One-time repository setup:

1. In Google Cloud, enable [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started) and create an API key restricted to that API.
2. In GitHub, open **Settings > Secrets and variables > Actions > New repository secret** and add it as `YOUTUBE_API_KEY`.
3. Open **Settings > Actions > General > Workflow permissions**, enable read and write permissions, and allow GitHub Actions to create pull requests.
4. Open **Actions > Sync YouTube videos > Run workflow** for the first reviewed import.

Edit `config/youtube-sources.json` to change channels, per-channel scan limits, retained counts, or keyword filters. The default allowlist is Godot Engine, GDQuest, and Godot-related Brackeys uploads. TikTok remains manual because this project does not scrape pages or store TikTok account credentials.

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

## Validate Content

Run the complete audit before publishing:

```bash
npm ci
npm test
npm run native:prepare
```

The tests cover YouTube duration parsing, filtering, deduplication, both generated catalogue formats, learning counts, 71-recipe and 18-bundle completeness, cross-references, approved source domains, pinned Godot docs, all 113 scripts under the official Godot 4.7.1 parser, local assets, unique HTML IDs, service-worker cache coverage, Tauri configuration, and the deterministic native asset bundle.

---

## Self Hosting

The web app is static and requires `index.html`, `assets/`, `content/`, `js/`, `manifest.webmanifest`, `sw.js`, `icon.png`, and `icon-192.png`.

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
- No frontend framework or runtime backend
- Tauri 2.11 native shell with official opener and signed updater plugins
- Deterministic native frontend preparation with an asset hash manifest
- Official YouTube Data API v3 for review-gated catalogue updates
- GitHub Actions schedule plus manual dispatch for the import workflow
- Official YouTube IFrame Player API for playback, volume, speed, seeking, and scrubber updates
- Nearby-only iframe lifecycle to reduce mobile memory and network use
- Fisher-Yates shuffle on app launch for feed randomisation
- Browser `localStorage` for playlists, user videos, custom flashcards, and learning progress
- Web app manifest and service worker for installation and offline app-shell caching
- Responsive layout: bottom nav on mobile, side rail on desktop
- Hash-based in-app routing for searchable learning items, references, and Code Library recipes

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

*Pull requests are welcome. Keep the browser application framework-free and preserve the shared web codebase.*
