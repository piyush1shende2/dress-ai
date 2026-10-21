# Dressify – Try-On Studio (React + Vite)

**Live demo:** https://piyush1shende2.github.io/dress-1/

## Offline use
- After the first visit the site is cached by a service worker and opens without internet (production build / live site).
- 3D mannequins, dress cut-out, colours and recommendations work fully offline.
- Face / live "try on me" features use MediaPipe. Its engine files are bundled in `public/mediapipe/wasm`. The two model files must be placed in `public/models/` for these features to work offline (otherwise they are downloaded online as a fallback):
  ```
  curl.exe -L -o public\models\face_landmarker.task https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
  curl.exe -L -o public\models\pose_landmarker_full.task https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task
  ```
- The Sora font comes from Google Fonts; offline it falls back to the system font.

## Run locally

    npm install && npm run dev

## About

Flow: pick a mannequin (5 men, 5 women, 5 kids) → dress type (shirt, T-shirt, pants, kurta, sherwani, saree, lehenga, dress) → one of 12 designs → colour (skin-tone based suggestions) → size and material. The model wears it on a 3D podium; drag to rotate. Real 3D mannequin (Three.js). Posture buttons, stop/resume, clockwise/anticlockwise and front/side/back views sit under the podium.
- src/data/wardrobe.js: models, types, designs, palette, colour suggestions
- src/components/Figure.jsx: SVG model + garments; Podium.jsx: CSS 3D podium
- src/services/tryOn.js: hook for a realistic try-on API
