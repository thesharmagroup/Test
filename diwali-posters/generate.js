const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];

// seeded random for repeatable layouts
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const R = (a, b) => a + rnd() * (b - a);

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@500;700&family=Playfair+Display:ital,wght@0,500;1,400&family=Poppins:wght@300;400;500&family=Tiro+Devanagari+Hindi&family=Yatra+One&display=swap" rel="stylesheet">`;

/* ---------- SVG building blocks ---------- */
let uid = 0;
function diya(x, y, s, bowl = '#b4361c', trim = '#f2b544') {
  const id = 'd' + uid++;
  return `<g transform="translate(${x},${y}) scale(${s})">
  <defs>
   <radialGradient id="${id}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc552" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a1f" stop-opacity="0"/></radialGradient>
   <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bowl}"/><stop offset="1" stop-color="#4a1208"/></linearGradient>
   <linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a00"/><stop offset=".45" stop-color="#ffd23d"/><stop offset="1" stop-color="#fffbe6"/></linearGradient>
   <radialGradient id="${id}o" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#c77a12"/></radialGradient>
  </defs>
  <circle cx="0" cy="-70" r="130" fill="url(#${id}g)"/>
  <ellipse cx="0" cy="62" rx="120" ry="16" fill="#000" opacity=".25"/>
  <path d="M-110,-8 Q-100,60 0,62 Q100,60 110,-8 Q118,-14 132,-22 Q110,-2 108,-4 Z" fill="url(#${id}b)"/>
  <ellipse cx="0" cy="-8" rx="110" ry="22" fill="${trim}"/>
  <ellipse cx="0" cy="-8" rx="100" ry="16" fill="url(#${id}o)"/>
  <path d="M-92,14 Q0,40 92,14" stroke="${trim}" stroke-width="4" fill="none" opacity=".9"/>
  <path d="M-80,30 Q0,52 80,30" stroke="${trim}" stroke-width="2.5" fill="none" stroke-dasharray="3 9" stroke-linecap="round" opacity=".9"/>
  ${[-60, -30, 0, 30, 60].map(a => `<circle cx="${a}" cy="${22 + Math.abs(a) * -0.05 + 8}" r="4.5" fill="${trim}"/>`).join('')}
  <path d="M0,-12 C-22,-40 -14,-80 0,-118 C14,-80 22,-40 0,-12 Z" fill="url(#${id}f)"/>
  <path d="M0,-16 C-9,-34 -6,-58 0,-78 C6,-58 9,-34 0,-16 Z" fill="#fffef5" opacity=".9"/>
  <rect x="-2" y="-22" width="4" height="14" rx="2" fill="#3a1a08"/>
  </g>`;
}

function marigold(x, y, r, c1 = '#ff9f1a', c2 = '#e8620c') {
  let g = `<g transform="translate(${x},${y})">`;
  const layers = [[1, c2], [0.78, c1], [0.55, '#ffb733'], [0.32, '#ffc94d']];
  layers.forEach(([k, c], li) => {
    const n = 16 - li * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + li * 0.3;
      g += `<ellipse cx="${Math.cos(a) * r * k * 0.55}" cy="${Math.sin(a) * r * k * 0.55}" rx="${r * k * 0.5}" ry="${r * k * 0.32}" transform="rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r * k * 0.55} ${Math.sin(a) * r * k * 0.55})" fill="${c}" stroke="#b8470a" stroke-width="${r * 0.02}" stroke-opacity=".35"/>`;
    }
  });
  return g + `<circle r="${r * 0.12}" fill="#d9700f"/></g>`;
}

function leaf(x, y, s, rot, c = '#2f6b2a') {
  return `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s})" d="M0,0 C20,-18 60,-18 80,0 C60,18 20,18 0,0 Z" fill="${c}"/><path transform="translate(${x},${y}) rotate(${rot}) scale(${s})" d="M0,0 L78,0" stroke="#1d4419" stroke-width="2"/>`;
}

function garland(x, y, len, r) {
  // hanging vertical string of marigolds
  let g = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" stroke="#8a5a12" stroke-width="2"/>`;
  for (let t = 0; t < len; t += r * 1.5) {
    g += marigold(x, y + t, r * (0.9 + 0.2 * Math.sin(t)), t % 3 ? '#ff9f1a' : '#ffc21a', t % 3 ? '#e8620c' : '#f08c00');
  }
  return g;
}

function lantern(x, y, s, cord = 200, style = 'gold') {
  const id = 'l' + uid++;
  const body = style === 'gold'
    ? `<path d="M-40,-60 L40,-60 L52,-10 L52,60 L40,100 L-40,100 L-52,60 L-52,-10 Z" fill="url(#${id}m)" stroke="#8a5a12" stroke-width="4"/>
       ${[-26, 0, 26].map(dx => `<path d="M${dx},-50 L${dx},92" stroke="#8a5a12" stroke-width="3"/>`).join('')}
       ${[-30, 0, 30, 60].map(dy => `<path d="M-48,${dy} L48,${dy}" stroke="#8a5a12" stroke-width="2.5" stroke-dasharray="6 5"/>`).join('')}
       <path d="M-48,-60 L-30,-90 L30,-90 L48,-60 Z" fill="#d79a2b" stroke="#8a5a12" stroke-width="3"/>
       <path d="M-40,100 L-22,126 L22,126 L40,100 Z" fill="#d79a2b" stroke="#8a5a12" stroke-width="3"/>
       <circle cy="140" r="9" fill="#d79a2b"/><path d="M0,148 L0,190" stroke="#d79a2b" stroke-width="4"/>`
    : `<path d="M0,-80 L60,10 L0,100 L-60,10 Z" fill="url(#${id}k)" stroke="#a8250c" stroke-width="4"/>
       <path d="M-60,10 L60,10 M0,-80 L0,100" stroke="#ffdd7a" stroke-width="3" opacity=".7"/>
       ${Array.from({ length: 9 }, (_, i) => `<path d="M${-40 + i * 10},${100 - Math.abs(i - 4) * 12} L${-40 + i * 10},${190 - Math.abs(i - 4) * 10}" stroke="${i % 2 ? '#ff4d2e' : '#ffb21f'}" stroke-width="5" stroke-linecap="round"/>`).join('')}`;
  return `<g transform="translate(${x},${y}) scale(${s})">
   <defs>
    <radialGradient id="${id}m" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fff7d0"/><stop offset=".5" stop-color="#ffcf5a"/><stop offset="1" stop-color="#c07a14"/></radialGradient>
    <radialGradient id="${id}k" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffb02e"/><stop offset="1" stop-color="#e2411a"/></radialGradient>
    <radialGradient id="${id}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd36b" stop-opacity=".6"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient>
   </defs>
   <line x1="0" y1="${-cord}" x2="0" y2="-90" stroke="${style === 'gold' ? '#b68428' : '#3b2a1a'}" stroke-width="3"/>
   <circle cy="20" r="190" fill="url(#${id}h)"/>
   ${body}</g>`;
}

function firework(x, y, r, color, n = 36, op = 1) {
  let g = `<g transform="translate(${x},${y})" opacity="${op}">`;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r1 = r * 0.18, r2 = r * (0.8 + 0.2 * ((i * 7) % 3) / 2);
    g += `<line x1="${Math.cos(a) * r1}" y1="${Math.sin(a) * r1}" x2="${Math.cos(a) * r2}" y2="${Math.sin(a) * r2}" stroke="${color}" stroke-width="${r * 0.012 + 1}" stroke-linecap="round" opacity=".85"/>`;
    g += `<circle cx="${Math.cos(a) * (r2 + r * 0.06)}" cy="${Math.sin(a) * (r2 + r * 0.06)}" r="${r * 0.018 + 1.5}" fill="#fff6d8"/>`;
  }
  return g + `<circle r="${r * 0.06}" fill="#fff"/></g>`;
}

function bokeh(w, h, n, colors, rmin, rmax, opmax = 0.5, region) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const [x0, y0, x1, y1] = region || [0, 0, w, h];
    g += `<circle cx="${R(x0, x1)}" cy="${R(y0, y1)}" r="${R(rmin, rmax)}" fill="${colors[i % colors.length]}" opacity="${R(0.12, opmax)}"/>`;
  }
  return g;
}

function stars(w, h, n, ymax) {
  let g = '';
  for (let i = 0; i < n; i++) g += `<circle cx="${R(0, w)}" cy="${R(0, ymax)}" r="${R(0.6, 2.2)}" fill="#fff" opacity="${R(0.3, 0.9)}"/>`;
  return g;
}

function rangoli(x, y, r, pal) {
  let g = `<g transform="translate(${x},${y})">`;
  const rings = [[1, 24, pal[0]], [0.8, 16, pal[1]], [0.6, 12, pal[2]], [0.4, 8, pal[3]]];
  rings.forEach(([k, n, c], ri) => {
    g += `<circle r="${r * k}" fill="none" stroke="${c}" stroke-width="${r * 0.012}" opacity=".9"/>`;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360;
      g += `<path transform="rotate(${a})" d="M0,${-r * (k - 0.18)} C${r * 0.07},${-r * (k - 0.1)} ${r * 0.05},${-r * k} 0,${-r * (k + 0.02)} C${-r * 0.05},${-r * k} ${-r * 0.07},${-r * (k - 0.1)} 0,${-r * (k - 0.18)} Z" fill="${c}" opacity=".95"/>`;
      if (ri === 0) g += `<circle transform="rotate(${a + 7.5})" cy="${-r * 1.07}" r="${r * 0.02}" fill="${pal[2]}"/>`;
    }
  });
  return g + `<circle r="${r * 0.22}" fill="${pal[4]}"/><circle r="${r * 0.14}" fill="${pal[0]}"/></g>`;
}

function mandala(x, y, r, color, op = 0.35) {
  let g = `<g transform="translate(${x},${y})" fill="none" stroke="${color}" opacity="${op}">`;
  [1, 0.85, 0.66, 0.48, 0.3].forEach((k, i) => {
    g += `<circle r="${r * k}" stroke-width="2"/>`;
    const n = [48, 32, 24, 16, 12][i];
    for (let j = 0; j < n; j++) {
      g += `<path transform="rotate(${(j / n) * 360})" d="M0,${-r * k} Q${r * 0.06},${-r * (k + 0.07)} 0,${-r * (k + 0.12)} Q${-r * 0.06},${-r * (k + 0.07)} 0,${-r * k}" stroke-width="1.6"/>`;
    }
  });
  return g + `</g>`;
}

function stringLights(x1, y1, x2, y2, sag, n, color = '#ffd36b') {
  let g = `<path d="M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}" stroke="#3a2a1a" stroke-width="2" fill="none"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const cx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
    const cy = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag * 2) + t * t * y2;
    g += `<circle cx="${cx}" cy="${cy + 4}" r="14" fill="${color}" opacity=".25"/><circle cx="${cx}" cy="${cy + 4}" r="5" fill="#fff4c4"/>`;
  }
  return g;
}

function lotusDivider(cx, y, w, color) {
  return `<g stroke="${color}" fill="${color}">
   <line x1="${cx - w / 2}" y1="${y}" x2="${cx - 44}" y2="${y}" stroke-width="2"/>
   <line x1="${cx + 44}" y1="${y}" x2="${cx + w / 2}" y2="${y}" stroke-width="2"/>
   <circle cx="${cx - 34}" cy="${y}" r="4"/><circle cx="${cx + 34}" cy="${y}" r="4"/>
   <path d="M${cx},${y + 8} C${cx - 10},${y - 4} ${cx - 6},${y - 18} ${cx},${y - 24} C${cx + 6},${y - 18} ${cx + 10},${y - 4} ${cx},${y + 8}Z M${cx},${y + 8} C${cx - 22},${y + 4} ${cx - 24},${y - 12} ${cx - 18},${y - 16} C${cx - 10},${y - 8} ${cx - 4},${y} ${cx},${y + 8}Z M${cx},${y + 8} C${cx + 22},${y + 4} ${cx + 24},${y - 12} ${cx + 18},${y - 16} C${cx + 10},${y - 8} ${cx + 4},${y} ${cx},${y + 8}Z" stroke="none"/>
  </g>`;
}

function petals(w, y0, y1, n, colors) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const x = R(0, w), y = R(y0, y1), s = R(0.6, 1.3);
    g += `<ellipse cx="${x}" cy="${y}" rx="${14 * s}" ry="${7 * s}" transform="rotate(${R(0, 180)} ${x} ${y})" fill="${colors[i % colors.length]}" opacity=".9"/>`;
  }
  return g;
}

/* ---------- Page wrapper ---------- */
function page(w, h, svg, html, bg) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${w}px;height:${h}px;overflow:hidden;background:${bg}}
  .wrap{position:relative;width:${w}px;height:${h}px}
  svg.art{position:absolute;inset:0}
  .txt{position:absolute;left:0;right:0;text-align:center}
  .script{font-family:'Great Vibes',cursive;line-height:1}
  .serif{font-family:'Playfair Display',serif}
  .cinzel{font-family:'Cinzel',serif;letter-spacing:.35em}
  .sans{font-family:'Poppins',sans-serif}
  .hindi{font-family:'Tiro Devanagari Hindi',serif}
  .yatra{font-family:'Yatra One',cursive}
  </style></head><body><div class="wrap"><svg class="art" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>${html}</div></body></html>`;
}

const blur = (id, sd) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

/* ---------- Design 1: Golden Glow (4:5) ---------- */
function d1() {
  const W = 1080, H = 1350;
  let s = `<defs>${blur('b1', 14)}${blur('b2', 4)}
   <radialGradient id="bg1" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".45" stop-color="#fbe7c2"/><stop offset="1" stop-color="#d9a45a"/></radialGradient>
   <linearGradient id="fl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c48a"/><stop offset="1" stop-color="#8a5422"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg1)"/>
  <g filter="url(#b1)">${bokeh(W, H, 60, ['#ffd27a', '#ffb648', '#fff1c4'], 14, 46, 0.6)}</g>
  <g filter="url(#b2)">${bokeh(W, H, 50, ['#ffe9a8', '#fff'], 3, 9, 0.8)}</g>
  <rect y="1060" width="${W}" height="290" fill="url(#fl1)" opacity=".85"/>
  ${rangoli(540, 1200, 230, ['#f4d38a', '#ffffff', '#f7b844', '#ffe6a8', '#c9461b']).replace('<g ', '<g opacity=".55" transform-origin="540 1200" ').replace('translate(540,1200)', 'translate(540,1200) scale(1,.32)')}`;
  // corner garlands
  [[60, 0], [140, 0], [220, 0], [W - 60, 0], [W - 140, 0], [W - 220, 0]].forEach(([x], i) => { s += garland(x, -20, [300, 200, 130][i % 3], 22); });
  for (let i = 0; i < 14; i++) { s += marigold(R(-20, 300), R(-20, 90), R(26, 40)); s += marigold(R(W - 300, W + 20), R(-20, 90), R(26, 40)); }
  for (let i = 0; i < 10; i++) { s += leaf(R(0, 320), R(40, 140), R(0.6, 1), R(30, 150)); s += leaf(R(W - 320, W), R(40, 140), R(0.6, 1), R(30, 150)); }
  s += lantern(150, 380, 0.75, 320) + lantern(W - 150, 380, 0.75, 320) + lantern(90, 640, 0.6, 520) + lantern(W - 90, 640, 0.6, 520);
  // bottom flowers
  for (let i = 0; i < 9; i++) { s += marigold(R(-20, 230), R(1040, 1330), R(34, 52)); s += marigold(R(W - 230, W + 20), R(1040, 1330), R(34, 52)); }
  s += petals(W, 1150, 1340, 28, ['#e0315f', '#ff6f91', '#ff9f1a']);
  s += diya(330, 1150, 0.95) + diya(750, 1150, 0.95) + diya(540, 1200, 1.35);
  const html = `
  <div class="txt serif" style="top:150px;font-size:40px;color:#5a3412">May the divine light of</div>
  <div class="txt script" style="top:245px;font-size:230px;color:#1c2f5e">Diwali</div>
  <div class="txt serif" style="top:500px;font-size:38px;font-style:italic;color:#4a2a10;line-height:1.5">fill your home with joy,<br>your heart with peace<br>and every step with prosperity.</div>
  <svg style="position:absolute;left:0;top:700px" width="${W}" height="40">${lotusDivider(540, 24, 480, '#b07a22')}</svg>
  <div class="txt cinzel" style="top:760px;font-size:36px;color:#8e1d1d">HAPPY</div>
  <div class="txt script" style="top:800px;font-size:190px;color:#8e1d1d">Deepavali</div>`;
  return page(W, H, s, html, '#fbe7c2');
}

/* ---------- Design 2: Rooftop Dusk (9:16) ---------- */
function d2() {
  const W = 1080, H = 1920;
  let s = `<defs>${blur('b1', 10)}
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241a4d"/><stop offset=".35" stop-color="#6b3a78"/><stop offset=".62" stop-color="#e0805a"/><stop offset=".78" stop-color="#f7b56a"/><stop offset="1" stop-color="#f2c38a"/></linearGradient>
   <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a52"/><stop offset="1" stop-color="#2d1726"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(W, H, 120, 700)}
  <circle cx="860" cy="330" r="34" fill="#fff1c9"/><circle cx="876" cy="320" r="32" fill="#4f3270"/>
  ${firework(200, 230, 150, '#ffd36b')}${firework(640, 160, 90, '#ff8fb1', 30)}${firework(900, 560, 110, '#ffe7a3', 32, .8)}${firework(120, 640, 70, '#ffb35c', 24, .7)}`;
  // birds
  [[120, 520], [160, 500], [200, 530]].forEach(([x, y]) => s += `<path d="M${x},${y} q10,-10 20,0 q10,-10 20,0" stroke="#3a2340" stroke-width="3" fill="none"/>`);
  // skyline
  let sky = 'M0,1360 ';
  let x = 0; while (x < W) { const bw = R(50, 110), bh = R(1180, 1320); sky += `L${x},${bh} L${x + bw},${bh} `; x += bw; }
  s += `<path d="${sky} L${W},1360 L${W},1500 L0,1500 Z" fill="#5a3456" opacity=".75"/>`;
  s += `<path d="M560,1300 L560,1210 L580,1150 L600,1210 L600,1300 Z M575,1150 L580,1100 L585,1150 Z" fill="#5a3456" opacity=".75"/>`;
  for (let i = 0; i < 40; i++) s += `<rect x="${R(0, W)}" y="${R(1200, 1340)}" width="8" height="10" fill="#ffd27a" opacity="${R(.4, .9)}"/>`;
  s += stringLights(0, 1250, W, 1240, 40, 22);
  // terrace parapet & floor
  s += `<rect x="0" y="1400" width="${W}" height="70" fill="#8f5a5a"/><rect x="0" y="1400" width="${W}" height="10" fill="#b77d6e"/>
  <rect x="0" y="1470" width="${W}" height="450" fill="url(#roof)"/>`;
  for (let i = 0; i < 9; i++) s += diya(60 + i * 120, 1400, 0.28);
  s += rangoli(540, 1690, 190, ['#e8312a', '#ffb21f', '#ffffff', '#ff6f1f', '#2a8f5a']).replace('translate(540,1690)', 'translate(540,1690) scale(1,.38)');
  [[300, 1720], [780, 1720], [420, 1820], [660, 1820], [140, 1860], [940, 1860]].forEach(([a, b]) => s += diya(a, b, 0.5));
  // hanging kandils from top-right branch
  s += `<path d="M${W},40 C900,60 760,40 640,90" stroke="#2a1a14" stroke-width="10" fill="none"/>`;
  for (let i = 0; i < 12; i++) s += leaf(R(640, W), R(30, 110), R(.5, .9), R(0, 360), '#2c3b24');
  s += lantern(720, 260, 0.6, 260, 'kandil') + lantern(880, 330, 0.85, 300, 'kandil') + lantern(1010, 240, 0.55, 200, 'kandil');
  // sparkler bursts on terrace
  s += firework(260, 1560, 40, '#fff3b0', 20) + firework(820, 1580, 36, '#fff3b0', 20);
  const html = `
  <div class="txt sans" style="top:560px;font-size:64px;font-weight:300;letter-spacing:.08em;color:#2b1630">Happy</div>
  <div class="txt script" style="top:670px;font-size:280px;color:#2b1630">Diwali</div>
  <svg style="position:absolute;left:0;top:940px" width="${W}" height="40">${lotusDivider(540, 24, 520, '#7a2e2e')}</svg>
  <div class="txt sans" style="top:1000px;font-size:40px;color:#3b1d30;line-height:1.55">May this festival of lights bring<br>laughter, good health and prosperity<br>to you and your loved ones.</div>`;
  return page(W, H, s, html, '#6b3a78');
}

/* ---------- Design 3: Royal Maroon (4:5) ---------- */
function d3() {
  const W = 1080, H = 1350;
  let s = `<defs>${blur('b1', 18)}
   <radialGradient id="bg3" cx="50%" cy="58%" r="80%"><stop offset="0" stop-color="#8e1c2b"/><stop offset=".6" stop-color="#5a0e1a"/><stop offset="1" stop-color="#2a050c"/></radialGradient>
   <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9e39b"/><stop offset=".5" stop-color="#d4a441"/><stop offset="1" stop-color="#fff0b8"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg3)"/>
  ${mandala(540, 870, 460, '#e7bd5c', .28)}${mandala(540, 870, 300, '#e7bd5c', .35)}
  <g filter="url(#b1)">${bokeh(W, H, 40, ['#ffcf6b', '#ff9b3d'], 10, 34, .45)}</g>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <rect x="50" y="50" width="${W - 100}" height="${H - 100}" fill="none" stroke="url(#gold)" stroke-width="1.5"/>`;
  // corner ornaments
  [[50, 50, 0], [W - 50, 50, 90], [W - 50, H - 50, 180], [50, H - 50, 270]].forEach(([x, y, r]) => {
    s += `<g transform="translate(${x},${y}) rotate(${r})" fill="url(#gold)"><path d="M0,0 L120,0 C80,10 30,30 0,120 Z" opacity=".9"/><circle cx="40" cy="40" r="10" fill="#5a0e1a"/><circle cx="40" cy="40" r="5"/></g>`;
  });
  // toran (garland swags) at top
  for (let i = 0; i < 6; i++) s += `<path d="M${60 + i * 160},70 Q${140 + i * 160},150 ${220 + i * 160},70" stroke="#ffa51f" stroke-width="16" fill="none" stroke-dasharray="1 18" stroke-linecap="round"/>`;
  for (let i = 0; i <= 6; i++) s += marigold(60 + i * 160, 72, 24) + `<path d="M${60 + i * 160},90 L${60 + i * 160},150" stroke="#e7bd5c" stroke-width="2"/><path d="M${60 + i * 160},150 l-10,16 l10,16 l10,-16 z" fill="#e7bd5c"/>`;
  s += diya(540, 1010, 1.9, '#c0581f', '#f5c75a');
  s += diya(250, 1120, 0.8, '#c0581f', '#f5c75a') + diya(830, 1120, 0.8, '#c0581f', '#f5c75a');
  s += petals(W, 1150, 1210, 18, ['#ff9f1a', '#ffc94d', '#f24b6a']);
  const html = `
  <div class="txt hindi" style="top:220px;font-size:110px;color:#f5d27a;text-shadow:0 0 30px rgba(255,190,80,.45)">शुभ दीपावली</div>
  <div class="txt cinzel" style="top:400px;font-size:30px;color:#f1d48d">THE FESTIVAL OF LIGHTS</div>
  <svg style="position:absolute;left:0;top:450px" width="${W}" height="40">${lotusDivider(540, 24, 420, '#e7bd5c')}</svg>
  <div class="txt serif" style="top:510px;font-size:36px;font-style:italic;color:#fbe6b5;line-height:1.55">May the glow of a thousand diyas<br>light up your path with wisdom,<br>wealth and endless blessings.</div>
  <div class="txt cinzel" style="top:1230px;font-size:24px;color:#e7bd5c">HAPPY DIWALI</div>`;
  return page(W, H, s, html, '#5a0e1a');
}

/* ---------- Design 4: Midnight Fireworks (9:16) ---------- */
function d4() {
  const W = 1080, H = 1920;
  let s = `<defs>${blur('b1', 16)}${blur('b3', 40)}
   <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a24"/><stop offset=".55" stop-color="#0d1a4a"/><stop offset=".85" stop-color="#2a1f55"/><stop offset="1" stop-color="#3d2142"/></linearGradient>
   <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1440"/><stop offset="1" stop-color="#07081c"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky4)"/>
  ${stars(W, H, 220, 1300)}
  <g filter="url(#b3)"><circle cx="540" cy="760" r="300" fill="#ffb84d" opacity=".18"/></g>
  ${firework(250, 300, 210, '#ffcf5a', 44)}${firework(800, 260, 170, '#ff6fa8', 40)}${firework(540, 120, 90, '#8fd3ff', 28, .85)}
  ${firework(120, 900, 110, '#b993ff', 30, .7)}${firework(950, 860, 130, '#ffd36b', 34, .75)}${firework(860, 560, 70, '#7fffd4', 24, .7)}
  `;
  // rising trails
  // ghat steps with diyas
  s += `<rect y="1460" width="${W}" height="460" fill="url(#water)"/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="0" y="${1380 + i * 40}" width="${W}" height="40" fill="${['#3b2a48', '#33243f', '#2b1e36', '#22182c'][i]}"/><rect x="0" y="${1380 + i * 40}" width="${W}" height="4" fill="#5e4466"/>`;
  for (let i = 0; i < 11; i++) s += diya(50 + i * 98, 1380, 0.3);
  for (let i = 0; i < 9; i++) s += diya(100 + i * 110, 1460, 0.36);
  // reflections & floating diyas
  s += `<g filter="url(#b1)">${bokeh(W, H, 40, ['#ffb84d', '#ff6fa8', '#ffd36b'], 8, 26, .45, [0, 1560, W, 1900])}</g>`;
  [[200, 1660], [480, 1740], [760, 1650], [920, 1800], [330, 1850]].forEach(([a, b]) => s += diya(a, b, 0.45));
  for (let i = 0; i < 30; i++) { const y = R(1580, 1900); s += `<rect x="${R(0, W)}" y="${y}" width="${R(30, 120)}" height="2" fill="#ffd36b" opacity="${R(.1, .4)}"/>`; }
  const html = `
  <div class="txt cinzel" style="top:610px;font-size:40px;color:#ffe4a3">WISHING YOU A</div>
  <div class="txt script" style="top:705px;font-size:300px;color:#ffd36b;text-shadow:0 0 40px rgba(255,190,80,.55)">Diwali</div>
  <div class="txt cinzel" style="top:1025px;font-size:34px;color:#ffe4a3">FULL OF SPARKLE</div>
  <div class="txt sans" style="top:1100px;font-size:36px;font-weight:300;color:#e9e2ff;line-height:1.6">Light up the sky, light up your life.<br>Happy Diwali to you and your family!</div>`;
  return page(W, H, s, html, '#050a24');
}

/* ---------- Design 5: Rangoli Bloom (1:1 -> use 4:5) ---------- */
function d5() {
  const W = 1080, H = 1350;
  let s = `<defs>${blur('b1', 14)}
   <radialGradient id="bg5" cx="50%" cy="62%" r="80%"><stop offset="0" stop-color="#fff3df"/><stop offset=".55" stop-color="#ffd9c2"/><stop offset="1" stop-color="#f29a9a"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg5)"/>
  <g filter="url(#b1)">${bokeh(W, H, 40, ['#ffffff', '#ffc46b', '#ff8fb1'], 12, 40, .55)}</g>
  ${rangoli(540, 910, 345, ['#d6246e', '#ff9f1a', '#1f9e8f', '#7b2ff7', '#ffd23d'])}
  ${rangoli(540, 910, 225, ['#ffd23d', '#d6246e', '#ffffff', '#1f9e8f', '#ff6f1f'])}`;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s += marigold(540 + Math.cos(a) * 405, 910 + Math.sin(a) * 405, 28, i % 2 ? '#ffc21a' : '#ff9f1a'); }
  s += diya(540, 930, 1.2, '#a8301a', '#ffd23d');
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; s += diya(540 + Math.cos(a) * 160, 930 + Math.sin(a) * 160, 0.3, '#a8301a', '#ffd23d'); }
  // bunting at top
  s += `<path d="M0,40 Q540,150 ${W},40" stroke="#8a3a2a" stroke-width="3" fill="none"/>`;
  for (let i = 1; i < 18; i++) { const t = i / 18, x = t * W, y = (1 - t) ** 2 * 40 + 2 * (1 - t) * t * 150 + t * t * 40; s += `<path d="M${x - 22},${y} L${x + 22},${y} L${x},${y + 50} Z" fill="${['#d6246e', '#ff9f1a', '#1f9e8f', '#7b2ff7', '#ffd23d'][i % 5]}"/>`; }
  s += petals(W, 1250, 1340, 26, ['#d6246e', '#ff9f1a', '#ffd23d']);
  const html = `
  <div class="txt yatra" style="top:138px;font-size:150px;color:#a3154f;letter-spacing:.02em">Happy Diwali</div>
  <div class="txt sans" style="top:318px;font-size:36px;font-weight:400;color:#5a1e2e;line-height:1.5">Colours of rangoli, glow of diyas,<br>sweetness of mithai — may your home<br>be filled with all of it!</div>`;
  return page(W, H, s, html, '#ffd9c2');
}

(async () => {
  const designs = [
    ['diwali-1-golden-glow-post', d1, 1080, 1350, 3.2],
    ['diwali-2-rooftop-dusk-story', d2, 1080, 1920, 2],
    ['diwali-3-royal-maroon-post', d3, 1080, 1350, 3.2],
    ['diwali-4-midnight-fireworks-story', d4, 1080, 1920, 2],
    ['diwali-5-rangoli-bloom-post', d5, 1080, 1350, 3.2],
  ];
  const only = process.argv[3];
  const browser = await chromium.launch();
  for (const [name, fn, w, h, scale] of designs) {
    if (only && !name.includes(only)) continue;
    const html = fn();
    fs.writeFileSync(path.join(OUT, name + '.html'), html);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    const p = await ctx.newPage();
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    await ctx.close();
    console.log('done', name);
  }
  await browser.close();
})();
