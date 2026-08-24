# TechFest 2030 — 3D CYBORG Experience

> **TechFest 2030: CYBORG — 3D Interactive Website**  
> 30th Edition · Dec 16–18 · Neo-City Hub

A 3D interactive web experience built with **Three.js r128**, **GSAP ScrollTrigger**, and vanilla web technologies.

## 3D Features & Architecture

- **WebGL 3D Kernel (Three.js r128)**
  - Central **CYBORG Core** — Glowing icosahedron sphere surrounded by dual rotating cyan & magenta wireframe torus rings
  - **Neural Node Network** — 140 dynamic 3D particles connected by dynamic line meshes
  - **Holographic Event Pads** — Interactive 3D wireframe boxes with glowing inner cores
  - **Infinite Floor Grid** — Cyan spatial perspective grid with volumetric fog
- **Scroll-Driven Camera Journey (GSAP ScrollTrigger)**
  - 600vh smooth camera path traversing 4 distinct zones:
    - **Zone 0: Initiate (Hero)** — Camera focused on central core with 3D parallax
    - **Zone 1: Matrix (Events)** — Camera pans left to focus on interactive 3D holographic pads
    - **Zone 2: Timeline (Sequence)** — Camera moves into high-angle view of floor grid
    - **Zone 3: CTA (Initiate Link)** — Camera zooms deep into the glowing core
- **3D Raycasting & Interactions**
  - Hovering over 3D holographic pads highlights them with emission glow
  - Clicking 3D pads or HTML event rows triggers track registration modal
- **Command Terminal (`Ctrl+K`)** — Interactive 3D shell (`help`, `events`, `status`, `register`, `clear`)
- **Overlay HTML System** — Glassmorphism panels with Space Grotesk, Inter, and JetBrains Mono typography

## Tech Stack

- **Three.js r128** (WebGL Rendering Engine)
- **GSAP 3 + ScrollTrigger** (Camera Scroll Journey)
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **Font Awesome 6** & **Google Fonts**

## Local Setup

Serve locally using Python or Node:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Visit `http://localhost:8000`.

## License

© 2026 TechFest 30th Edition. All rights reserved.
