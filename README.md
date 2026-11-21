# Inside your phone

A visitor holds a simulated phone one centimetre above a reader, turns it edge-on, and sees its induced peak voltage fall from 1.43 V to approximately zero. The phone then tries to recover the four bits the reader sent. Rotating the loop back restores the signal. [Open the live site](https://luminaryshadows.github.io/inside-your-phone/).

Choose **Break the signal**, then **Inspect the samples** to see the voltages behind the failed tap. Set the coil tilt to 60° to see the peak fall to half its face-to-face value.

The hardware tour follows the OLED display, rear cameras, NFC antenna, logic board and lithium-ion cell. A React component and GSAP ScrollTrigger tie the captions and Three.js model to scroll progress. Choose any part directly, or skip to the tap experiment. Reduced-motion and short-screen layouts use the part buttons. During the pinned tour, a canvas scrubs 121 rendered poses, packed six per WebP strip. Dragging switches to the live Three.js view when available. The short-screen and reduced-motion layouts also have stills of all five parts.

Scroll through the tap experiment, signal lab, teardown and payment trail in order. Chapter links and field notes are available in the footer. Barba handles chapter navigation, while the mounted simulations keep their settings and progress during the visit. Visitors who prefer reduced motion get immediate transitions. [Barba.js](https://github.com/barbajs/barba).

The hardware tour draws its live model directly into the visible WebGL canvas. With WebGL 2, the opening tap, field model, nearby phones, teardown and payment route share a Three.js renderer. Drag to orbit, use the arrow keys to rotate, use +/− to zoom and Home to reset the camera. Changing the camera leaves the experimental inputs intact. The waveform retains its fixed voltage scale. Devices without WebGL 2 use the original canvas diagrams and HTML experiments. [Three.js license](dist/vendor/three-license.txt).

## Try it

1. Turn the phone edge-on and lay it flat. Watch the voltage while the gap stays fixed.
2. In the signal lab, choose a four-bit message. Change the gap, tilt or interference. Both traces use the same voltage scale. The upper trace always uses a flat, quiet tap at 1 cm for comparison.
3. Open **Inspect the receiver’s samples**. Compare the receiver’s calibration levels, threshold and individual bit decisions with the transmitted message.
4. Open the phone to find the coil, then follow a fictional purchase from device authorization to the issuer’s decision. A second attempt to use the same signed message demonstrates the model’s counter check.

Choose **Magnify component** in the teardown to inspect any of the four layers at up to 12×. The close-up draws the component artwork at the current scale. Drag to pan, pinch or scroll at a point to zoom, or use the detail selector to centre a named feature. The close-up URL can be reopened directly.

The camera experiment plots how far an image moves during one exposure. The battery experiment plots remaining usable energy under a constant load. The signal lab lets visitors vary the number of turns while comparing against a five-turn reference.

## What is computed

The field along the axis of a circular transmitting loop decreases in proportion to `[1 + (distance / radius)²]⁻³ᐟ²`. For a small receiving loop, the component of the field perpendicular to its surface varies with `cos(tilt)`. With the carrier frequency held constant, the induced voltage amplitude scales with that component. The lab uses a 2 cm transmitter radius and a reference peak of 2 V at zero distance. These are illustrative parameters. [OpenStax derivation](https://openstax.org/books/university-physics-volume-2/pages/12-4-magnetic-field-of-a-current-loop).

The transmitter in `dist/physics.js` sends a high reference slot, a low reference slot, then four data slots. The two amplitude levels are 100% and 55% of the induced peak. A repeatable disturbance lets visitors compare runs with the same conditions. The chart draws the carrier using the same slot envelopes that supply the six sampled voltages.

The receiver in `dist/receiver.js` accepts only those six readings. It finds the midpoint between the two references, then compares each data sample with that threshold. It marks uncertainty when the reference separation is under 55 mV or a sample falls within 15 mV of the threshold. The tests include an independent hand-built capture and all sixteen four-bit payloads.

## Boundaries of the model

The phone and terminal drawings show component placement, angle and separation schematically. The dotted field lines are illustrated. The electrical model assumes centred coils and a small receiver. Calibration, coding, interference and carrier timing are simplified for inspection. Real NFC operates at 13.56 MHz with protocol-specific modulation and coding. [NFC Forum technical overview](https://nfc-forum.org/learn/nfc-technology/).

The payment exercise runs locally with fictional data, a generated HMAC key and a counter. The radio lab demonstrates the reader-to-phone direction. The payment walkthrough illustrates the later credential exchange and authorization route separately. The nearby-sharing comparison uses a received-power estimate and a discovery threshold. [Apple payment authorization](https://support.apple.com/guide/security/secc1f57e189/web) · [AirDrop security](https://support.apple.com/guide/security/sec2261183f4/web).

## Run and check

From this directory, run `python3 -m http.server 8492 --directory dist` and open `http://localhost:8492/`. Run `node check.cjs` to test the transmitter and independent receiver. The site uses browser Canvas and Web Crypto and has no build step.

The live site is GitHub Pages on the `gh-pages` branch, which holds the contents of `dist/` at its root. After changing `dist/`, publish with `git subtree push --prefix dist origin gh-pages`.

## Credits

The project draws its own diagrams. The bundled GSAP 3.15.1 core animates the approach, tilt, teardown and payment route. Motion follows the system’s reduced-motion preference. [GreenSock Standard License](https://gsap.com/standard-license/). DM Sans and STIX Two Text are included under their bundled SIL Open Font Licenses in `dist/font-license.txt` and `dist/stix-license.txt`. The organisers’ exemplar inspired the paired signal comparison and the decision to test the receiver independently. [Hackathon exemplar project notes](https://github.com/cishackathon/exemplar/blob/main/submission/README.md).
