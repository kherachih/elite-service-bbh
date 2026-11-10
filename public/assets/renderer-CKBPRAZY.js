import{aa as j,ab as V,ac as G,ad as Y,ae as X,af as $,ag as Z,ah as Q,ai as O}from"./index-DY-U_CNj.js";import"./react-vendor-CoM_mz1y.js";import"./gsap-Bgc6N1m_.js";import"./motion-BnOxZQ5M.js";const U=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
`,J=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,H=`
uniform vec2 uView;
uniform float uTime;
uniform vec2 uParallax;
uniform sampler2DArray uPhotos;
uniform float uCols, uColW, uTileH, uPer;
uniform float uMarquee;
uniform float uLod;      // the photos' mip level: the stage draws them at full size, the satin from small

const vec3 INK = vec3(5.0 / 255.0);
// The lamp: the brand's neutral white (Tally keeps its light white).
const vec3 LAMP = vec3(242.0, 241.0, 239.0) / 255.0;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// HeroMarquee: columns of 3:4 photos 16px apart inside 16px of padding, the
// whole grid 24px larger than the hero on every side and shifted by the
// pointer's parallax; a column moves one photo every 12s (10s on phones'
// two columns), the 2nd 12% slower as a deeper plane; the 1st and 3rd up,
// the 2nd down; rounded-md corners. A photo still on its way is black (layers
// start zeroed), as near the tile's own bg-white/[0.04] as makes no odds
// under the veil.
vec3 marquee(vec2 p) {
  if (uMarquee < 0.5) return INK;
  vec2 g = p + 24.0 - uParallax - 16.0;
  float pitch = uColW + 16.0;
  float col = floor(g.x / pitch);
  float xIn = g.x - col * pitch;
  if (g.x < 0.0 || col >= uCols || xIn > uColW) return INK;
  float copyH = uPer * (uTileH + 16.0);
  float photoS = uCols < 2.5 ? 10.0 : 12.0;
  float depth = abs(col - 1.0) < 0.5 ? 1.12 : 1.0;
  float t = fract(uTime / (uPer * photoS * depth));
  float shift = mod(col, 2.0) < 0.5 ? -t * copyH : (t - 1.0) * copyH;
  float y = mod(g.y - shift, copyH);
  float ti = floor(y / (uTileH + 16.0));
  float yIn = y - ti * (uTileH + 16.0);
  if (yIn > uTileH) return INK;
  vec2 hs = vec2(uColW, uTileH) * 0.5;
  vec2 tp = vec2(xIn, yIn);
  float cover = clamp(0.5 - sdRound(tp - hs, hs, 6.0), 0.0, 1.0);
  vec3 img = textureLod(uPhotos, vec3(tp / (2.0 * hs), col * uPer + ti), uLod).rgb;
  return mix(INK, img, cover);
}

// The grid at opacity-45, under its top and bottom fade.
vec3 photos(vec2 p) {
  float y = (p.y + 24.0 - uParallax.y) / (uView.y + 48.0);
  float m = clamp(y / 0.15, 0.0, 1.0) * clamp((1.0 - y) / 0.15, 0.0, 1.0);
  return mix(INK, marquee(p), 0.45 * m);
}

// The hero's veil: bg-[#050505]/55, then its radial vignette.
vec3 veil(vec3 c, vec2 p) {
  c = mix(c, INK, 0.55);
  vec2 r = (p - uView * 0.5) / (uView * 0.70710678);
  return mix(c, INK, 0.85 * clamp((length(r) - 0.35) / 0.65, 0.0, 1.0));
}
`,tt=`${U}${H}
uniform float uScale;
out vec4 outColor;
void main() {
  vec2 p = vec2(gl_FragCoord.x, uView.y * uScale - gl_FragCoord.y) / uScale;
  outColor = vec4(photos(p), 1.0);
}`,et=`${U}
uniform sampler2D uCov;
out vec4 outColor;
float cov(ivec2 q) { return texelFetch(uCov, clamp(q, ivec2(0), textureSize(uCov, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float c = cov(p);
  float l = cov(p + ivec2(-1, 0)), r = cov(p + ivec2(1, 0)), d = cov(p + ivec2(0, -1)), u = cov(p + ivec2(0, 1));
  bool inside = c >= 0.5;
  bool edge = (c > 0.0 && c < 1.0) || (inside && min(min(l, r), min(d, u)) < 0.5) || (!inside && max(max(l, r), max(d, u)) >= 0.5);
  vec2 g = vec2(r - l, u - d) * 0.5;
  float glen = length(g);
  if (!edge || glen < 1e-4) { outColor = vec4(-1e5, -1e5, 0.0, 1.0); return; }
  vec2 seed = vec2(p) + 0.5 + g / glen * clamp((0.5 - c) / glen, -1.0, 1.0);
  outColor = vec4(seed, 0.0, 1.0);
}`,st=`${U}
uniform sampler2D uSeed;
uniform int uStep;
out vec4 outColor;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uSeed, 0);
  vec2 pc = vec2(p) + 0.5;
  vec2 best = vec2(-1e5);
  float bd = 1e20;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      ivec2 q = p + ivec2(i, j) * uStep;
      if (q.x < 0 || q.y < 0 || q.x >= size.x || q.y >= size.y) continue;
      vec2 s = texelFetch(uSeed, q, 0).rg;
      if (s.x < -1e4) continue;
      vec2 v = s - pc;
      float dd = dot(v, v);
      if (dd < bd) { bd = dd; best = s; }
    }
  }
  outColor = vec4(best, 0.0, 1.0);
}`,it=`${U}
uniform sampler2D uSeed;
uniform sampler2D uCov;
uniform float uScale;
out vec4 outColor;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec2 s = texelFetch(uSeed, p, 0).rg;
  float d = s.x < -1e4 ? 1e4 : length(s - (vec2(p) + 0.5));
  float c = texelFetch(uCov, p, 0).r;
  outColor = vec4((c >= 0.5 ? -d : d) / uScale, 0.0, 0.0, 1.0);
}`,ot=`${U}
uniform sampler2D uSrc;
uniform ivec2 uAxis;
out vec4 outColor;
float at(ivec2 q) { return texelFetch(uSrc, clamp(q, ivec2(0), textureSize(uSrc, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float v = at(p) * 0.375 + (at(p + uAxis) + at(p - uAxis)) * 0.25 + (at(p + 2 * uAxis) + at(p - 2 * uAxis)) * 0.0625;
  outColor = vec4(v, 0.0, 0.0, 1.0);
}`,rt=`${U}
uniform sampler2D uSrc;
uniform ivec2 uAxis;
uniform float uSigma;
uniform int uRadius;
out vec4 outColor;
float at(ivec2 q) { return texelFetch(uSrc, clamp(q, ivec2(0), textureSize(uSrc, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float k = -0.5 / (uSigma * uSigma);
  float acc = 0.0;
  float sum = 0.0;
  for (int i = -uRadius; i <= uRadius; i++) {
    float w = exp(float(i * i) * k);
    acc += at(p + uAxis * i) * w;
    sum += w;
  }
  outColor = vec4(acc / sum, 0.0, 0.0, 1.0);
}`,at=`${U}
uniform sampler2D uSrc;
uniform sampler2D uRim;
uniform float uScale;
out vec4 outColor;
float at(ivec2 q) { return texelFetch(uSrc, clamp(q, ivec2(0), textureSize(uSrc, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec2 g = vec2(at(p + ivec2(1, 0)) - at(p - ivec2(1, 0)), at(p + ivec2(0, 1)) - at(p - ivec2(0, 1))) * 0.5 * uScale;
  outColor = vec4(at(p), g, texelFetch(uRim, p, 0).r);
}`,lt=`${U}
uniform sampler2D uSrc;
uniform vec2 uStep;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(uSrc, 0));
  vec3 c = texture(uSrc, uv).rgb * 0.2270270;
  c += (texture(uSrc, uv + uStep * 1.3846154).rgb + texture(uSrc, uv - uStep * 1.3846154).rgb) * 0.3162162;
  c += (texture(uSrc, uv + uStep * 3.2307692).rgb + texture(uSrc, uv - uStep * 3.2307692).rgb) * 0.0702703;
  outColor = vec4(c, 1.0);
}`,K=`${U}${H}
uniform float uDpr;
uniform float uPx;     // one design px (sdf.ts designPx), CSS px: the scale of the fine detail
uniform sampler2D uSdf;
uniform sampler2D uRound;  // the rounded field, its slope (x, y), then the rim's field, CSS px
uniform vec4 uSdfRect;
uniform sampler2D uFrost;
uniform vec2 uFrostUV; // the satin's texture coordinates per CSS px
uniform float uFont;
uniform vec3 uLight;
uniform vec4 uIntro;   // pour, heat, reveal, lamp
uniform vec2 uInk;     // the ink's top and bottom
uniform vec4 uBlob;    // the stir: its centre, then its stretch along the motion (CSS px)
uniform vec2 uBlobA;   // its amplitude (0 to 1) and radius (CSS px)
uniform vec3 uTail;    // the tail it drags: centre and amplitude
uniform vec3 uDot;     // the tally dot: centre and radius, CSS px (radius 0: none)
out vec4 outColor;

// The tally dot is cut in the same glass, and that glass is red: the photos
// come through it filtered red, the lamp inside it glows (brightest on the
// face, falling off toward the shoulder, a warm-white core), and what it
// reflects (the room, the lamp's lobe, the polished edge) stays white, as
// glass reflects uncoloured.
const vec3 TALLY = vec3(254.0, 62.0, 54.0) / 255.0;

// The stir's swell: a compact dome, flat-ish on top with a defined edge,
// (1 - r²)² inside its radius, stretched along the motion.
float dome(vec2 p, vec2 c, float A, float R) {
  vec2 d = p - c;
  float L = length(uBlob.zw);
  vec2 u = L > 1e-3 ? uBlob.zw / L : vec2(1.0, 0.0);
  float al = dot(d, u) / (1.0 + L / R);
  float ac = dot(d, vec2(-u.y, u.x));
  float x = clamp(1.0 - (al * al + ac * ac) / (R * R), 0.0, 1.0);
  return A * x * x;
}
// The swell and its tail, as one (their union).
float swell(vec2 p) {
  if (uBlobA.x < 1e-3) return 0.0;
  float a = dome(p, uBlob.xy, uBlobA.x, uBlobA.y);
  float b = uTail.z > 1e-3 ? dome(p, uTail.xy, uTail.z, uBlobA.y * 0.8) : 0.0;
  return 1.0 - (1.0 - a) * (1.0 - b);
}

// The fields cover the ink and a margin round it; beyond, it is far.
float sd(vec2 p) {
  vec2 uv = (p - uSdfRect.xy) / uSdfRect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 1e4;
  return texture(uSdf, uv).r;
}
vec4 rounded(vec2 p) {
  vec2 uv = (p - uSdfRect.xy) / uSdfRect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(1e4, 0.0, 0.0, 1e4);
  return texture(uRound, uv);
}
// At level 0 explicitly (it has no others): sampled under a branch, an
// implicit level would make the compiler take every branch everywhere.
// Where PHOTOS drew it: from the stage's foot, up.
vec3 frost(vec2 p) { return textureLod(uFrost, vec2(p.x, uView.y - p.y) * uFrostUV, 0.0).rgb; }

// Glass by its heat: deep red, amber, then white-hot.
vec3 hot(float T) {
  vec3 c = mix(vec3(0.35, 0.04, 0.0), vec3(0.851, 0.467, 0.024), smoothstep(0.0, 0.45, T));
  c = mix(c, vec3(1.0, 0.86, 0.6), smoothstep(0.45, 0.85, T));
  c = mix(c, vec3(1.0, 0.97, 0.9), smoothstep(0.85, 1.0, T));
  return c * smoothstep(0.0, 0.12, T) * (0.6 + 1.6 * T);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
  // A little dither keeps the veil's dark gradients from banding.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  float reveal = smoothstep(0.35, 1.0, uIntro.z);
  vec3 bg = veil(photos(p), p);
  bg = mix(INK, bg, reveal);
  float s = sd(p);
  if (s > 0.42 * uFont) { outColor = vec4(bg + dither, 1.0); return; }

  vec3 Lp = uLight;
  float lightD = length(Lp.xy - p);
  float atten = uIntro.w / (1.0 + pow(lightD / (0.55 * uFont + 0.25 * uView.x), 2.0));
  float margin = 1.0 - smoothstep(0.3 * uFont, 0.42 * uFont, s);

  // The pour: the glass exists below a front rising from its foot, and while
  // hot it lights the dark stage round it.
  float front = mix(uInk.y + 6.0, uInk.x - 6.0, uIntro.x) + sin(p.x * 0.045 + uTime * 2.3) * 2.5;
  float formed = smoothstep(front - 1.5, front + 1.5, p.y);
  float heat = uIntro.y;
  float hotOut = heat * exp(-max(s, 0.0) / (0.11 * uFont)) * smoothstep(front - 40.0, front + 20.0, p.y) * margin;
  // The stir swells the glass, and its outline leans out toward it.
  float sw = swell(p);
  float push = sw * 0.008 * uFont;
  float se = s - push;
  // The glass sits just off the photos: a soft contact shade round it.
  float shade = se > 0.0 ? 0.18 * exp(-se / (0.035 * uFont)) * formed : 0.0;
  vec3 lit = bg * (1.0 - shade) + hot(clamp(heat * 0.85, 0.0, 1.0)) * hotOut * 0.32;
  if (se > 1.5) { outColor = vec4(lit + dither, 1.0); return; }

  // The shoulder: a squircle W wide, from the outline (t = 1) to the flat
  // face (t = 0), tilting the surface along the rounded field's slope.
  vec4 r = rounded(p);
  r.x -= push;
  r.w -= push;
  float W = 0.055 * uFont;
  float t = clamp(1.0 + r.x / W, 0.0, 1.0);
  float t3 = t * t * t;
  float q = max(1.0 - t3 * t, 1e-3);
  vec2 shoulder = r.yz * min(t3 / pow(q, 0.75), 3.5);
  vec3 Ns = normalize(vec3(shoulder, 1.0));
  float tilt = length(Ns.xy);
  // The swell's slope (it stands 0.04 em at its crown), measured across a
  // pixel; the surface is the shoulder and the swell together.
  float Hs = 0.04 * uFont;
  vec2 gs = sw > 0.0
    ? vec2(swell(p + vec2(1.0, 0.0)) - swell(p - vec2(1.0, 0.0)), swell(p + vec2(0.0, 1.0)) - swell(p - vec2(0.0, 1.0))) * 0.5 * Hs
    : vec2(0.0);
  vec3 N = normalize(vec3(shoulder - gs, 1.0));
  float h = W * pow(q, 0.25) + sw * Hs;

  // Through the glass: the photos out of the veil, clear on the face, bent
  // and softened on the shoulder; the glass itself a touch milky, catching
  // an overhead light toward the top of the letters. The photos come
  // through the glass before the rest of the hero (uIntro.z).
  // Under the swell the glass is a lens: clearer, and magnifying about 1.35x
  // at its crown (1 / (1 - 4m), m = 0.065).
  vec2 lensOff = gs * (uBlobA.y * uBlobA.y * 0.065 / Hs);
  vec2 pb = p - Ns.xy / Ns.z * 0.22 * W + lensOff;
  vec3 through = mix(photos(pb), frost(pb) * 1.05, smoothstep(0.05, 0.7, tilt) * 0.75 * (1.0 - 0.5 * sw));
  float ty = clamp((p.y - uInk.x) / max(uInk.y - uInk.x, 1.0), 0.0, 1.0);
  through = mix(veil(through, pb), through, 0.55) + LAMP * (0.03 + 0.03 * (1.0 - ty) * (1.0 - ty));
  // The swell's upper flank catches the overhead light, its lower flank dims.
  vec2 nl = -gs / sqrt(1.0 + dot(gs, gs));
  through = (through * (1.0 - 0.021 * smoothstep(0.0, 0.3, nl.y)) + LAMP * 0.035 * smoothstep(0.0, 0.3, -nl.y))
    * smoothstep(0.0, 0.55, uIntro.z);

  // The room the shoulder mirrors (a soft overhead, dim walls), the lamp's
  // one soft lobe, and the edge carrying the room's light all the way round,
  // brightest on the side facing the lamp.
  float seen = max(reveal, uIntro.w);
  vec3 R = reflect(vec3(0.0, 0.0, -1.0), N);
  float over = smoothstep(0.05, 0.9, -R.y);
  float side = smoothstep(0.2, 0.95, abs(R.x)) * (1.0 - over);
  vec3 room = INK + LAMP * (over * 0.3 + side * 0.06) * seen;
  float F = 0.04 + 0.96 * pow(1.0 - N.z, 5.0);
  vec3 H = normalize(normalize(Lp - vec3(p, h)) + vec3(0.0, 0.0, 1.0));
  float ndh = max(dot(N, H), 0.0);
  float facing = 0.5 + 0.5 * dot(Ns.xy / max(tilt, 1e-4), normalize(Lp.xy - p + 1e-4));
  vec3 glass = mix(through, room, F)
    + LAMP * (pow(ndh, 30.0) * 0.18 + pow(ndh, 8.0) * 0.03) * atten
    + LAMP * tilt * tilt * tilt * (0.04 * seen + 0.28 * facing * facing * atten);

  // The polished outline: one hairline just inside it, traced on the rim's
  // field, lit from above, brightest toward the lamp, faint on the far side.
  float line = exp(-pow((r.w + 0.9 * uPx) / (0.65 * uPx), 2.0));
  vec2 n = r.yz / max(length(r.yz), 1e-4);
  float toward = 0.5 + 0.5 * dot(n, normalize(Lp.xy - p + 1e-4));
  float up = smoothstep(-0.2, 0.9, -n.y);
  float away = (1.0 - toward) * (1.0 - toward);
  glass += LAMP * line * 0.7 * ((0.1 + 0.3 * up + 0.25 * away) * seen + 1.1 * toward * toward * atten);

  if (uDot.z > 0.0) {
    float dd = length(p - uDot.xy);
    float dotW = 1.0 - smoothstep(uDot.z + uPx, uDot.z + 2.5 * uPx, dd);
    if (dotW > 0.0) {
      float k = clamp(dd / uDot.z, 0.0, 1.0);
      vec3 red = through * vec3(1.5, 0.33, 0.29)
        + TALLY * 0.36 * (1.0 - 0.4 * k * k) * seen
        + vec3(1.0, 0.66, 0.6) * 0.05 * exp(-k * k * 12.0) * seen;
      glass += (1.0 - F) * (red - through) * dotW;
    }
  }

  // Cooling: the edges and thin strokes first, the cores last, the newest
  // pour hottest. The heat is light inside the glass, strongest in the
  // shoulder, diffused through the face.
  float d = -s;
  float core = smoothstep(0.0, 0.11 * uFont, d);
  float T = clamp(heat * (1.15 + 0.5 * core) - (1.0 - core) * 0.35
    + exp(-(p.y - front) / (0.12 * uFont)) * 0.35 * step(0.05, heat), 0.0, 1.0);
  glass = glass * (1.0 - smoothstep(0.25, 0.9, T)) + hot(T * 0.82) * (0.6 + 0.5 * tilt * tilt + 0.3 * line);

  float cover = clamp(0.5 - se * uDpr, 0.0, 1.0) * formed;
  outColor = vec4(mix(lit, glass, cover) + dither, 1.0);
}`;function q(h,t,e){if(!h.includes(t))throw new Error(`STAGE_FRAG_WIDE: "${t}" is gone from STAGE_FRAG`);return h.replace(t,e)}const nt=q(q(K,`uniform float uPx;     // one design px (sdf.ts designPx), CSS px: the scale of the fine detail
`,`uniform float uPx;     // one design px (sdf.ts designPx), CSS px: the scale of the fine detail
uniform float uWiden;  // >= 1: the screen's density over the buffer's (1: drawn at the screen's own)
`),`  float line = exp(-pow((r.w + 0.9 * uPx) / (0.65 * uPx), 2.0));
`,`  float lp = uPx * uWiden;
  float line = exp(-pow((r.w + 0.9 * lp) / (0.65 * lp), 2.0)) / uWiden;
`),N=h=>h<=0?0:h>=1?1:h*h*(3-2*h),ht=h=>1-Math.pow(1-Math.min(1,Math.max(0,h)),3),ut=1,ct=1.05,B=.7,ft=1.2,dt=.55,pt=1.1,mt=2,xt=1.05,vt=5,P={x:.62,y:.38},g={K:120,Z:.6,KT:36,ZT:.75,KA:60,ZA:.35,RADIUS:.18,MIN_R:34,STRETCH:.06,TAIL:.7},Tt=2500,Et=2;function M(h,t){const e=h.createProgram(),r=[[h.VERTEX_SHADER,J],[h.FRAGMENT_SHADER,t]].map(([l,o])=>{const i=h.createShader(l);return h.shaderSource(i,o),h.compileShader(i),h.attachShader(e,i),i});return h.linkProgram(e),{prog:e,shaders:r,done:!1}}function D(h,{prog:t,shaders:e}){if(!h.getProgramParameter(t,h.LINK_STATUS)){const o=e.map(i=>h.getShaderInfoLog(i)).filter(Boolean).join(`
`);throw new Error(o||h.getProgramInfoLog(t)||"glass: link")}e.forEach(o=>h.deleteShader(o));const r={},l=h.getProgramParameter(t,h.ACTIVE_UNIFORMS);for(let o=0;o<l;o++){const i=h.getActiveUniform(t,o).name;r[i]=h.getUniformLocation(t,i)}return{prog:t,loc:r,sent:{}}}function f(h,t,e,r,l,o=0,i=0,n=0){let s=t.sent[e];if(s&&Object.is(s[0],l)&&Object.is(s[1],o)&&Object.is(s[2],i)&&Object.is(s[3],n))return;s||(s=t.sent[e]=[0,0,0,0]),s[0]=l,s[1]=o,s[2]=i,s[3]=n;const a=t.loc[e]??null;r==="1f"?h.uniform1f(a,l):r==="2f"?h.uniform2f(a,l,o):r==="3f"?h.uniform3f(a,l,o,i):r==="4f"?h.uniform4f(a,l,o,i,n):h.uniform1i(a,l)}class St{constructor(t,e,r,l,o){this.canvas=t,this.post=r,this.schedule=l,this.cancel=o,this.progs=null,this.started=null,this.pcs=null,this.photosTex=null,this.photosFor=null,this.sdfTex=null,this.roundTex=null,this.frost=[],this.frostSize={w:1,h:1},this.frostScale=.25,this.px=1,this.bufDpr=0,this.widen=!1,this.pendingDpr=null,this.mark=null,this.sdfStarted=null,this.pendingMask=null,this.field=null,this.fence=null,this.pumpTimer=0,this.photoSet=0,this.photosWanted=0,this.photosIn=0,this.mipsStale=!1,this.pageLoaded=!1,this.visible=!0,this.lost=!1,this.lostTimer=0,this.disposed=!1,this.raf=0,this.last=0,this.clock=0,this.frames=0,this.drawn=!1,this.slow=0,this.worst=0,this.interval=1/60,this.cpu=0,this.born=performance.now(),this.lamp={x:-400,y:0},this.stir={on:!1,px:0,py:0,placed:!1,x:0,y:0,vx:0,vy:0,tx:0,ty:0,tvx:0,tvy:0,a:0,va:0},this.parallax={x:0,y:0,vx:0,vy:0,tx:0,ty:0},this.pump=()=>{if(this.pumpTimer=0,this.disposed||this.lost)return;const n=this.gl;let s=!1;if(!this.progs&&this.started)if(this.built(Object.values(this.started))){try{this.linkFrame()}catch(a){this.post({type:"fail",reason:String(a)}),this.dispose();return}this.kick()}else s=!0;if(this.pendingMask)if(this.sdfProgs!==void 0||!this.sdfStarted||this.built(Object.values(this.sdfStarted))){const a=this.pendingMask;this.pendingMask=null,this.applyMask(a)}else s=!0;this.field&&(this.fence&&n.getSyncParameter(this.fence,n.SYNC_STATUS)===n.SIGNALED&&(n.deleteSync(this.fence),this.fence=null),this.fence||(this.runField(!1),this.field&&(this.fence=n.fenceSync(n.SYNC_GPU_COMMANDS_COMPLETE,0),n.flush())),this.field&&(s=!0)),s&&!this.pumpTimer&&(this.pumpTimer=setTimeout(this.pump,16))},this.onLost=n=>{this.disposed||(n.preventDefault(),this.contextLost())},this.onRestored=()=>{if(!(this.disposed||!this.lost)){clearTimeout(this.lostTimer),this.lost=!1,this.note("context restored"),this.frost=[],this.photosTex=null,this.photosFor=null,this.sdfTex=null,this.roundTex=null,this.mark=null;try{this.setup()}catch(n){this.post({type:"fail",reason:String(n)}),this.dispose();return}this.size(),this.marquee&&this.loadPhotos(this.marquee),this.post({type:"remask"}),this.kick(),this.pumpSoon()}};let i=null;try{i=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:"default"})}catch{i=null}if(!i)throw new Error(j);this.gl=i;try{const n=i.getExtension("WEBGL_debug_renderer_info"),s=i.getParameter(n?n.UNMASKED_RENDERER_WEBGL:i.RENDERER);typeof s=="string"&&s&&r({type:"gpu",renderer:s})}catch{}this.view=e.view,this.marquee=e.mode==="hero"?e.marquee:null,this.reduced=e.reduced,this.visible=e.visible??!0,this.bufDpr=e.bufDpr??0,this.widen=!!e.widen,this.intro=e.intro?{t:0,seen:null,pour:0,full:null,leave:null,speed:1,done:!1,quick:!!e.quick}:null,this.note("context"),this.setup(),this.lamp=this.intro?{x:-400,y:this.view.h*P.y}:{x:this.view.w*P.x,y:this.view.h*P.y},this.size(),this.marquee&&this.loadPhotos(this.marquee),this.loop=this.loop.bind(this),t.addEventListener("webglcontextlost",this.onLost),t.addEventListener("webglcontextrestored",this.onRestored),this.kick(),this.pumpSoon()}note(t){this.post({type:"mark",step:t,at:Math.round(performance.now()-this.born)})}setup(){const t=this.gl;this.pcs=t.getExtension("KHR_parallel_shader_compile"),this.started={stage:M(t,this.widen?nt:K),photos:M(t,tt),blur:M(t,lt)},this.progs=null,this.sdfProgs=void 0,this.sdfStarted=t.getExtension("EXT_color_buffer_float")?{seed:M(t,et),jump:M(t,st),dist:M(t,it),blur:M(t,ot),round:M(t,rt),grad:M(t,at)}:null,this.vao=t.createVertexArray(),t.bindVertexArray(this.vao),this.pcs||this.linkFrame()}built(t){const e=this.pcs;if(!e)return!0;for(const r of t)if(!r.done){if(!this.gl.getProgramParameter(r.prog,e.COMPLETION_STATUS_KHR))return!1;r.done=!0}return!0}linkFrame(){const t=this.started;this.started=null,this.progs={stage:D(this.gl,t.stage),photos:D(this.gl,t.photos),blur:D(this.gl,t.blur)},this.note("compiled")}pumpSoon(){!this.pumpTimer&&!this.disposed&&(this.pumpTimer=setTimeout(this.pump,0))}contextLost(){this.lost||(this.lost=!0,this.note("context lost"),this.raf&&this.cancel(this.raf),this.raf=0,this.last=0,clearTimeout(this.pumpTimer),this.pumpTimer=0,this.field=null,this.fence=null,this.pendingMask=null,this.lostTimer=setTimeout(()=>{!this.lost||this.disposed||(this.post({type:"fail",reason:"context lost"}),this.dispose())},Tt))}handle(t){switch(t.type){case"mask":{if(this.lost||!t.cov)break;if(this.note("mask in"),this.field&&(this.field.drop(),this.field=null,this.fence&&this.gl.deleteSync(this.fence),this.fence=null),this.sdfProgs===void 0&&this.sdfStarted&&!this.built(Object.values(this.sdfStarted))){this.pendingMask=t,this.pumpSoon();break}this.pendingMask=null,this.applyMask(t);break}case"mark":this.lost||this.setMark(t.mark);break;case"view":{const e=this.marquee,r=t.marquee;if(this.view=t.view,this.pendingDpr!==null&&(this.bufDpr=this.pendingDpr,this.pendingDpr=null),e&&r&&(this.marquee=r,(r.layerW!==e.layerW||r.layerH!==e.layerH||r.cols!==e.cols||r.perColumn!==e.perColumn||r.photos.join()!==e.photos.join())&&!this.lost&&this.loadPhotos(r)),this.lost)break;this.size(),this.kick();break}case"pointer":this.stir.on=!Number.isNaN(t.x),this.stir.on&&(this.stir.px=t.x,this.stir.py=t.y),this.kick();break;case"parallax":this.parallax.tx=t.x,this.parallax.ty=t.y,this.kick();break;case"visible":this.visible=t.visible,this.visible&&this.field&&!this.lost&&this.finishField(),this.kick();break;case"quality":{const e=t.dpr>0?t.dpr:0;this.pendingDpr=e===this.bufDpr?null:e,t.now&&this.applyQuality();break}case"loaded":this.note("page loaded"),this.pageLoaded=!0;break;case"hurry":this.intro&&(this.intro.speed=3);break;case"dispose":this.dispose();break}}size(){const{w:t,h:e,dpr:r}=this.view,l=this.bufDpr>0?Math.min(this.bufDpr,r):r;this.canvas.width=Math.max(1,Math.round(t*l)),this.canvas.height=Math.max(1,Math.round(e*l)),this.fitFrost()}applyQuality(){if(this.pendingDpr===null||(this.bufDpr=this.pendingDpr,this.pendingDpr=null,this.lost||this.disposed))return;const t=[this.canvas.width,this.canvas.height];this.size(),!(this.canvas.width===t[0]&&this.canvas.height===t[1])&&this.progs&&this.drawn&&!this.lost&&this.render()}fitFrost(){const t=this.gl,{w:e,h:r}=this.view;this.frostScale=.25*(this.mark?V/this.mark.size:1);const l=Math.max(1,Math.ceil(e*this.frostScale)),o=Math.max(1,Math.ceil(r*this.frostScale));l===this.frostSize.w&&o===this.frostSize.h&&this.frost.length||(this.frost.forEach(({tex:i,fbo:n})=>{t.deleteTexture(i),t.deleteFramebuffer(n)}),this.frost=[0,1].map(()=>{const i=t.createTexture();t.bindTexture(t.TEXTURE_2D,i),t.texStorage2D(t.TEXTURE_2D,1,t.RGBA8,l,o),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const n=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,n),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,i,0),{tex:i,fbo:n}}),t.bindFramebuffer(t.FRAMEBUFFER,null),this.frostSize={w:l,h:o})}setMark(t){const e=this.gl;this.sdfTex||(this.sdfTex=e.createTexture()),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.sdfTex),e.texImage2D(e.TEXTURE_2D,0,e.R16F,t.w,t.h,0,e.RED,e.FLOAT,t.sd),this.sampled(e.TEXTURE_2D,e.LINEAR);const r=t.w/t.rect.w,l=G(t.size,this.view.dpr);this.roundTex||(this.roundTex=e.createTexture()),e.bindTexture(e.TEXTURE_2D,this.roundTex),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t.w,t.h,0,e.RGBA,e.FLOAT,Y(t.sd,t.w,t.h,r,X*t.size,O*l)),this.sampled(e.TEXTURE_2D,e.LINEAR);const{sd:o,...i}=t;this.markReady(i,l)}applyMask(t){const e=t.cov,r={w:t.w,h:t.h,rect:t.rect,size:t.size,ink:t.ink,dot:t.dot??null},l=G(t.size,this.view.dpr),o=this.gpuField(e,t.w,t.h,t.scale,t.size,l,r);if(o){this.field=o,!this.mark&&!this.visible?this.pumpSoon():this.finishField();return}const i=Math.max(1,Math.round(t.scale/$)),n=i>1?Z(e,t.w,t.h,i):{cov:e,w:t.w,h:t.h},s=t.scale/i,a={...t.rect,w:n.w/s,h:n.h/s};this.setMark({...r,w:n.w,h:n.h,rect:a,sd:Q(n.cov,n.w,n.h,s)})}runField(t){const e=this.field,r=this.gl;r.bindVertexArray(this.vao),r.viewport(0,0,e.w,e.h);const l=t?e.steps.length:Math.min(e.steps.length,e.next+Et);for(l>=e.steps.length&&(this.field=null);e.next<l;)e.steps[e.next++]()}finishField(){this.fence&&this.gl.deleteSync(this.fence),this.fence=null,this.runField(!0)}markReady(t,e){this.mark=t,this.px=e,this.fitFrost(),this.note("mark set"),this.kick()}sampled(t,e){const r=this.gl;r.texParameteri(t,r.TEXTURE_MIN_FILTER,e),r.texParameteri(t,r.TEXTURE_MAG_FILTER,e),r.texParameteri(t,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(t,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}gpuField(t,e,r,l,o,i,n){const s=this.gl;if(this.sdfProgs===void 0){const x=this.sdfStarted;this.sdfStarted=null;try{this.sdfProgs=x?{seed:D(s,x.seed),jump:D(s,x.jump),dist:D(s,x.dist),blur:D(s,x.blur),round:D(s,x.round),grad:D(s,x.grad)}:null}catch{this.sdfProgs=null}}const a=this.sdfProgs;if(!a)return null;let d=!0;const c=[],u=(x,S)=>{const w=s.createTexture();s.bindTexture(s.TEXTURE_2D,w),s.texStorage2D(s.TEXTURE_2D,1,x,e,r),this.sampled(s.TEXTURE_2D,S);const I=s.createFramebuffer();return s.bindFramebuffer(s.FRAMEBUFFER,I),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,w,0),d&&(d=s.checkFramebufferStatus(s.FRAMEBUFFER)===s.FRAMEBUFFER_COMPLETE),c.push({tex:w,fbo:I}),{tex:w,fbo:I}};s.activeTexture(s.TEXTURE4);const R=s.createTexture();s.bindTexture(s.TEXTURE_2D,R),s.pixelStorei(s.UNPACK_ALIGNMENT,1),s.texImage2D(s.TEXTURE_2D,0,s.R8,e,r,0,s.RED,s.UNSIGNED_BYTE,t),s.pixelStorei(s.UNPACK_ALIGNMENT,4),this.sampled(s.TEXTURE_2D,s.NEAREST);let m=u(s.RG32F,s.NEAREST),T=u(s.RG32F,s.NEAREST);const v=u(s.R16F,s.NEAREST),E=u(s.R16F,s.NEAREST),F=u(s.R16F,s.LINEAR),L=u(s.R16F,s.NEAREST),k=u(s.RGBA16F,s.LINEAR),z=()=>{c.forEach(x=>(s.deleteTexture(x.tex),s.deleteFramebuffer(x.fbo))),s.deleteTexture(R)};if(s.bindFramebuffer(s.FRAMEBUFFER,null),!d)return z(),this.sdfProgs=null,null;const b=(x,S,w)=>{s.useProgram(x.prog),s.bindFramebuffer(s.FRAMEBUFFER,S.fbo),w(),s.drawArrays(s.TRIANGLES,0,3)},p=(x,S)=>{s.activeTexture(s.TEXTURE0+x),s.bindTexture(s.TEXTURE_2D,S)},y=[];y.push(()=>{p(4,R),b(a.seed,m,()=>s.uniform1i(a.seed.loc.uCov,4))});let A=1;for(;A*2<Math.max(e,r);)A*=2;for(const x of[...Array.from({length:Math.log2(A)+1},(S,w)=>A>>w),1])y.push(()=>{p(5,m.tex),b(a.jump,T,()=>{s.uniform1i(a.jump.loc.uSeed,5),s.uniform1i(a.jump.loc.uStep,x)}),[m,T]=[T,m]});y.push(()=>{p(5,m.tex),p(4,R),b(a.dist,v,()=>{s.uniform1i(a.dist.loc.uSeed,5),s.uniform1i(a.dist.loc.uCov,4),s.uniform1f(a.dist.loc.uScale,l)})});const _=(x,S,w,I)=>y.push(()=>{p(6,x),b(a.blur,S,()=>{s.uniform1i(a.blur.loc.uSrc,6),s.uniform2i(a.blur.loc.uAxis,w,I)})});_(v.tex,E,1,0),_(E.tex,v,0,1),_(v.tex,E,1,0),_(E.tex,F,0,1);const C=(x,S,w,I,W)=>y.push(()=>{p(6,x),b(a.round,S,()=>{s.uniform1i(a.round.loc.uSrc,6),s.uniform2i(a.round.loc.uAxis,w,I),s.uniform1f(a.round.loc.uSigma,W),s.uniform1i(a.round.loc.uRadius,Math.ceil(3*W))})});return C(F.tex,E,1,0,O*i*l),C(E.tex,L,0,1,O*i*l),C(F.tex,E,1,0,X*o*l),C(E.tex,v,0,1,X*o*l),y.push(()=>{p(6,v.tex),p(7,L.tex),b(a.grad,k,()=>{s.uniform1i(a.grad.loc.uSrc,6),s.uniform1i(a.grad.loc.uRim,7),s.uniform1f(a.grad.loc.uScale,l)})}),y.push(()=>{s.bindFramebuffer(s.FRAMEBUFFER,null),[m,T,v,E,L].forEach(x=>(s.deleteTexture(x.tex),s.deleteFramebuffer(x.fbo))),s.deleteFramebuffer(F.fbo),s.deleteFramebuffer(k.fbo),s.deleteTexture(R),this.sdfTex&&s.deleteTexture(this.sdfTex),this.roundTex&&s.deleteTexture(this.roundTex),this.sdfTex=F.tex,this.roundTex=k.tex,this.markReady(n,i)}),{steps:y,next:0,w:e,h:r,drop:z}}async loadPhotos(t){const e=this.gl,r=t.cols*t.perColumn,l=this.photosTex,o=this.photosFor;this.photosFor=t,this.photosTex=e.createTexture(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,this.photosTex);const i=1+Math.floor(Math.log2(Math.max(t.layerW,t.layerH)));e.texStorage3D(e.TEXTURE_2D_ARRAY,i,e.RGBA8,t.layerW,t.layerH,Math.max(1,r)),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const n=this.photosTex;if(l){if(o&&o.perColumn===t.perColumn){const c=e.createFramebuffer(),u=e.createFramebuffer();e.bindFramebuffer(e.READ_FRAMEBUFFER,c),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,u);for(let R=0;R<Math.min(o.cols*o.perColumn,r);R++)e.framebufferTextureLayer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,l,0,R),e.framebufferTextureLayer(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,n,0,R),e.blitFramebuffer(0,0,o.layerW,o.layerH,0,0,t.layerW,t.layerH,e.COLOR_BUFFER_BIT,e.LINEAR);e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.deleteFramebuffer(c),e.deleteFramebuffer(u),this.mipsStale=!0}e.deleteTexture(l)}const s=++this.photoSet;this.photosWanted=r,this.photosIn=0;const a=typeof OffscreenCanvas<"u"?new OffscreenCanvas(t.layerW,t.layerH):document.createElement("canvas");a.width=t.layerW,a.height=t.layerH;const d=a.getContext("2d");d.imageSmoothingQuality="high",await Promise.all(t.photos.slice(0,r).map(async(c,u)=>{try{const R=await(await fetch(c)).blob(),m=await createImageBitmap(R);if(this.disposed||s!==this.photoSet)return m.close();const T=m.width/m.height;let v=m.width,E=m.height;T>.75?v=m.height*.75:E=m.width/.75,d.drawImage(m,(m.width-v)/2,(m.height-E)/2,v,E,0,0,t.layerW,t.layerH),m.close(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,n),e.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,u,t.layerW,t.layerH,1,e.RGBA,e.UNSIGNED_BYTE,a),this.mipsStale=!0}catch{}finally{s===this.photoSet&&(this.photosIn++,this.photosIn===this.photosWanted&&this.note("photos in"),this.kick())}}))}kick(){this.raf||this.disposed||(this.raf=this.schedule(this.loop))}loop(t){if(this.raf=0,this.disposed||this.lost||!this.progs){this.last=0;return}const e=this.last?(t-this.last)/1e3:0,r=e?Math.min(.05,e):1/60;if(e&&(e<this.interval*1.25&&(this.interval+=(e-this.interval)*.05),e>this.interval*1.6&&this.slow++,this.worst=Math.max(this.worst,e*1e3)),this.last=t,!this.visible){this.last=0;return}const l=performance.now(),o=this.step(r);(this.drawn||this.mark||this.intro)&&this.render(),this.cpu=Math.max(this.cpu,performance.now()-l),o?this.raf=this.schedule(this.loop):this.last=0}step(t){let e=!1;const r=this.view.w,l=this.view.h;this.marquee&&!this.reduced&&(this.clock+=t,e=!0);const o=this.intro;if(o&&!o.done){e=!0,o.t+=t*o.speed*(o.quick?2:1);const a=this.marquee?.15*(this.mark?1:0)+.7*(this.photosWanted?this.photosIn/this.photosWanted:1)+.15*(this.pageLoaded?1:0):.5*(this.mark?1:0)+.5*(this.pageLoaded?1:0),d=o.t>vt||a>=1?1:Math.min(.97,.3+a);this.mark&&o.seen===null&&(o.seen=o.t);const c=o.seen===null?0:Math.min(N((o.t-o.seen-.15)/ut),d);o.pour+=(c-o.pour)*Math.min(1,t*7),o.full===null&&o.pour>.995&&c>=1&&(o.full=o.t,this.note("poured")),o.leave===null&&d>=1&&o.pour>.8&&(o.leave=o.t,this.post({type:"intro",beat:"leaving"})),o.leave!==null&&o.t-o.leave>=(this.marquee?mt:xt)&&(o.done=!0,this.post({type:"intro",beat:"done"}))}if(o&&!o.done){const a=o.leave===null?-1:o.t-o.leave,d=ht((a-B)/ft);this.lamp.x=a<B?-400:-400+(r*P.x+400)*d,this.lamp.y=l*P.y}else{const a=this.reduced?0:this.clock,d=r*(P.x+.1*Math.sin(a*.23))-this.lamp.x,c=l*(P.y+.07*Math.sin(a*.17+1.3))-this.lamp.y;this.lamp.x+=d*.12,this.lamp.y+=c*.12,(Math.abs(d)>.3||Math.abs(c)>.3)&&(e=!0)}const i=this.stir,n=this.mark;if(n&&(!o||o.done)){const a=Math.max(1,Math.ceil(t*120)),d=t/a,c=2*g.Z*Math.sqrt(g.K),u=2*g.ZT*Math.sqrt(g.KT),R=2*g.ZA*Math.sqrt(g.KA);for(let m=0;m<a;m++){let T=0;if(i.on){i.placed||Object.assign(i,{x:i.px,y:i.py,tx:i.px,ty:i.py,vx:0,vy:0,tvx:0,tvy:0,placed:!0}),i.vx+=(g.K*(i.px-i.x)-c*i.vx)*d,i.vy+=(g.K*(i.py-i.y)-c*i.vy)*d;const v=n.ink,E=Math.hypot(Math.max(v.left-i.px,0,i.px-v.right),Math.max(v.top-i.py,0,i.py-v.bottom));T=(1-N(E/(.35*n.size)))*(.45+.55*Math.min(1,Math.hypot(i.vx,i.vy)/(2.5*n.size)))}else{const v=Math.exp(-8*d);i.vx*=v,i.vy*=v}i.x+=i.vx*d,i.y+=i.vy*d,i.tvx+=(g.KT*(i.x-i.tx)-u*i.tvx)*d,i.tvy+=(g.KT*(i.y-i.ty)-u*i.tvy)*d,i.tx+=i.tvx*d,i.ty+=i.tvy*d,i.va+=(g.KA*(T-i.a)-R*i.va)*d,i.a+=i.va*d}!i.on&&i.a<.002&&Math.abs(i.va)<.002&&(i.placed=!1),(i.a>.002||Math.abs(i.va)>.002||Math.hypot(i.vx,i.vy)>.5||Math.hypot(i.tvx,i.tvy)>.5)&&(e=!0)}const s=this.parallax;if(Math.abs(s.tx-s.x)>.01||Math.abs(s.vx)>.01||Math.abs(s.ty-s.y)>.01||Math.abs(s.vy)>.01){const a=60*(s.tx-s.x)-20*s.vx,d=60*(s.ty-s.y)-20*s.vy;s.vx+=a*t,s.vy+=d*t,s.x+=s.vx*t,s.y+=s.vy*t,e=!0}return e||!this.drawn}frostRead(t){const e=this.frostScale,r=this.view.h,l=Math.max(g.RADIUS*t.size,g.MIN_R),o=.2*t.size+.4*l,{x:i,y:n,w:s,h:a}=t.rect;return[Math.floor((i-o)*e-.5)-1,Math.floor((r-(n+a+o))*e-.5)-1,Math.floor((i+s+o)*e-.5)+3,Math.floor((r-(n-o))*e-.5)+3]}render(){const t=this.gl;if(t.isContextLost()){this.contextLost();return}const e=this.progs,{w:r,h:l,dpr:o}=this.view,i=this.marquee,n=(p,y)=>{f(t,p,"uLod","1f",y),f(t,p,"uView","2f",r,l),f(t,p,"uTime","1f",this.clock),f(t,p,"uParallax","2f",this.parallax.x,this.parallax.y),f(t,p,"uPhotos","1i",0),f(t,p,"uCols","1f",i?i.cols:0),f(t,p,"uColW","1f",i?i.colW:1),f(t,p,"uTileH","1f",i?i.tileH:1),f(t,p,"uPer","1f",i?i.perColumn:1),f(t,p,"uMarquee","1f",i?1:0)};t.bindVertexArray(this.vao),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D_ARRAY,this.photosTex),this.mipsStale&&(t.generateMipmap(t.TEXTURE_2D_ARRAY),this.mipsStale=!1);const[s,a]=this.frost,d=this.frostScale,c=this.mark;if(i){const p=c?this.frostRead(c):null,y=A=>{if(!p)return;const _=Math.max(0,p[0]-A),C=Math.max(0,p[1]-A),x=Math.min(this.frostSize.w,p[2]+A),S=Math.min(this.frostSize.h,p[3]+A);t.scissor(_,C,Math.max(0,x-_),Math.max(0,S-C))};p&&t.enable(t.SCISSOR_TEST),t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),t.viewport(0,0,this.frostSize.w,this.frostSize.h),t.useProgram(e.photos.prog),n(e.photos,Math.log2(i.layerW/(i.colW*d))),f(t,e.photos,"uScale","1f",d),y(10),t.drawArrays(t.TRIANGLES,0,3),t.useProgram(e.blur.prog),f(t,e.blur,"uSrc","1i",3),t.activeTexture(t.TEXTURE3),t.bindTexture(t.TEXTURE_2D,s.tex),t.bindFramebuffer(t.FRAMEBUFFER,a.fbo),f(t,e.blur,"uStep","2f",1/this.frostSize.w,0),y(5),t.drawArrays(t.TRIANGLES,0,3),t.bindTexture(t.TEXTURE_2D,a.tex),t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),f(t,e.blur,"uStep","2f",0,1/this.frostSize.h),y(0),t.drawArrays(t.TRIANGLES,0,3),p&&t.disable(t.SCISSOR_TEST)}else t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),t.viewport(0,0,this.frostSize.w,this.frostSize.h),t.clearColor(5/255,5/255,5/255,1),t.clear(t.COLOR_BUFFER_BIT);t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.canvas.width,this.canvas.height),t.useProgram(e.stage.prog),n(e.stage,0);const u=e.stage,R=this.canvas.width/r;f(t,u,"uDpr","1f",R),f(t,u,"uPx","1f",this.px),f(t,u,"uWiden","1f",this.bufDpr>0&&this.bufDpr<o?o/R:1),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,s.tex),f(t,u,"uFrost","1i",2),f(t,u,"uFrostUV","2f",d/this.frostSize.w,d/this.frostSize.h),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.sdfTex),f(t,u,"uSdf","1i",1),t.activeTexture(t.TEXTURE5),t.bindTexture(t.TEXTURE_2D,this.roundTex),f(t,u,"uRound","1i",5),c?(f(t,u,"uSdfRect","4f",c.rect.x,c.rect.y,c.rect.w,c.rect.h),f(t,u,"uFont","1f",c.size),f(t,u,"uInk","2f",c.ink.top,c.ink.bottom)):(f(t,u,"uSdfRect","4f",-1e4,-1e4,1,1),f(t,u,"uFont","1f",1),f(t,u,"uInk","2f",0,1)),f(t,u,"uLight","3f",this.lamp.x,this.lamp.y,.35*(c?c.size:300));const m=c==null?void 0:c.dot;f(t,u,"uDot","3f",m?m.x:0,m?m.y:0,m?m.r:0);const T=this.stir,v=Math.max(g.RADIUS*(c?c.size:300),g.MIN_R);let E=T.vx*g.STRETCH,F=T.vy*g.STRETCH;const L=Math.hypot(E,F);L>.6*v&&(E*=.6*v/L,F*=.6*v/L);const k=Math.max(0,T.a),z=Math.min(1,Math.hypot(T.x-T.tx,T.y-T.ty)/v);f(t,u,"uBlob","4f",T.x,T.y,E,F),f(t,u,"uBlobA","2f",k,v),f(t,u,"uTail","3f",T.tx,T.ty,k*g.TAIL*N(z));const b=this.intro;if(b&&!b.done){const p=b.full===null?1:1-N((b.t-b.full)/ct),y=b.leave===null?-1:b.t-b.leave,A=N((y-(B-.1))/.5),_=N((y-dt)/pt);f(t,u,"uIntro","4f",b.pour,p,_,A)}else f(t,u,"uIntro","4f",1,0,1,1);t.drawArrays(t.TRIANGLES,0,3),this.frames++,!this.drawn&&c&&(this.drawn=!0,this.note("first frame"),this.post({type:"drawn"})),(this.frames&63)===0&&(this.post({type:"stats",frame:this.frames,photos:this.photosIn,slow:this.slow,worst:Math.round(this.worst),cpu:Math.round(this.cpu*10)/10,lamp:[Math.round(this.lamp.x),Math.round(this.lamp.y)],buf:[this.canvas.width,this.canvas.height]}),this.cpu=0)}dispose(){var t;this.disposed||(this.disposed=!0,this.raf&&this.cancel(this.raf),clearTimeout(this.pumpTimer),clearTimeout(this.lostTimer),this.canvas.removeEventListener("webglcontextlost",this.onLost),this.canvas.removeEventListener("webglcontextrestored",this.onRestored),(t=this.gl.getExtension("WEBGL_lose_context"))==null||t.loseContext())}}export{St as GlassStage};
