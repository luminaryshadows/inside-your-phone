# Credits and choices

Every component here that the team did not write is listed with what it does, what it cost us, and
what we checked it against. The mechanism we are explaining — the induced voltage, the decoder, the
signed payment and the counter check — is written by us in `dist/physics.js`, `dist/receiver.js`,
`dist/app.js` and `dist/model.js`; nothing in that path depends on a hosted service.

All libraries are vendored into `dist/vendor/` and loaded with a plain `<script>` tag. There is no
build step, no package manager and no network fetch at runtime, so the site works from a static host
and judges can read the exact source that runs.

---

## GSAP 3.15.1 + ScrollTrigger — https://gsap.com

**What it does for us:** drives the opening hardware tour — the pinned section where the phone's
camera, display, antenna, board and battery captions are tied to scroll progress — and the
approach / tilt / teardown / payment-route timelines.

**Why this one:** scroll-linked scrubbing needs deterministic, reversible interpolation of a long
timeline against scroll position, plus the ability to pin a section and release it cleanly. GSAP's
`scrub` does that from one timeline object, and it keeps the whole timeline addressable so a single
`matchMedia` branch can swap in a reduced-motion version.

**Cost:** 72 KB core plus 44 KB for ScrollTrigger, minified and vendored. It is a large dependency
for one animation system, and its licence is GreenSock's own standard licence rather than MIT —
free for this use, but it is not an OSI licence, so it is named here explicitly.

**Rejected:** writing the scrub by hand on `scroll` events. That is where jitter and layout thrash
come from on trackpads; and CSS `scroll-timeline` still cannot pin a section and drive canvas
frames with a single reversible clock across the browsers judges will use.

---

## Three.js 0.187.0 — https://threejs.org

**What it does for us:** renders the live hardware tour, the field model, the nearby-phone
comparison, the teardown and the payment route into one WebGL canvas.

**Why this one:** the tour needs a real camera that can be orbited and zoomed while the rest of the
page keeps its state, and the field and payment scenes reuse the same renderer. Three.js gives
orbit controls, raycasting and GLTF-free procedural geometry without pulling in a full engine.

**Cost:** 596 KB unminified and vendored, which is the single biggest file we ship. We accept it
because it is the thing the page is *about* — the geometry has to be real and rotatable, not a
video of a rotation.

**Rejected:** a canvas 2D projection of the phone. It cannot sort depth or light a curved shell, and
every new camera angle becomes a hand-written matrix. Devices without WebGL 2 fall back to the
canvas diagrams and HTML experiments, so the page is never blank.

---

## Barba.js 2.10.3 — https://barba.js.org

**What it does for us:** chapter navigation. It swaps the page shell and runs the leave/enter
transition while the mounted simulations keep their settings and progress, including reduced-motion
users who get an immediate transition.

**Why this one:** it is deliberately small and only handles the container swap and lifecycle
hooks — the part we would otherwise get wrong (scroll restoration, duplicate listeners, transitions
that outlive the element). It imposes no routing model on us.

**Cost:** 32 KB, plus one abstraction a reader has to follow when tracing a chapter link. Everything
page-specific still lives in our own `chapters.js`.

**Rejected:** a full SPA framework for six chapters, and plain anchors. Plain anchors reload the
document and reset the experiments; a framework would rewrite the parts we already wrote.

---

## React 19.3.1 + ReactDOM — https://react.dev

**What it does for us:** the tour caption component that renders the current part's text and detail
links, re-rendering as scroll progress changes the active part.

**Why this one:** the caption block is a small piece of state-driven UI rendering in the middle of
a scroll timeline; declaring it once keeps the caption, the part buttons and the deep-linkable
close-ups from drifting out of sync.

**Cost:** 220 KB of ReactDOM for a handful of components. This is the dependency we would drop
first if bundle size ever mattered more than editability.

**Rejected:** hand-written DOM updates inside the scroll callback. They work, but every added
caption field becomes a manual text-node edit and a place to forget the ARIA announcement.

---

## DM Sans and STIX Two Text — SIL Open Font License 1.1

**What it does for us:** DM Sans is the interface and body face; STIX Two Text is the serif used for
the physics formulas and field notes, so equations read as mathematics rather than as UI.

**Why these:** both are variable-weight, self-hosted and OFL-licensed, so they ship with the repo
and never touch a third-party CDN — which keeps the page working offline and keeps visitors out of
font-provider logs.

**Cost:** 88 KB + 156 KB of WOFF2 in the repo. Licences are bundled verbatim in
`dist/font-license.txt` and `dist/stix-license.txt`.

**Rejected:** system font stacks. They render the formulas differently on every OS, and the page's
typography is part of how the mechanism is read.

---

## What we wrote ourselves

`dist/physics.js` (transmitter model and slot envelopes), `dist/receiver.js` (calibration, threshold
and per-bit decision), `dist/app.js` (payment: HMAC signing, issuer check, counter reuse),
`dist/model.js` and `dist/scenes.js` (procedural phone, field lines, payment route),
`dist/inspector.js`, `dist/lessons.js`, `dist/tour.js`, `dist/motion.js`, `dist/tap-figure.js`,
`dist/phone-materials.js`, `dist/studio-model.js`, plus `dist/style.css`, `dist/index.html` and the
121-pose turntable strips rendered for this project.
