(function(){"use strict";const M=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
`,tt=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,G=`
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
`,et=`${M}${G}
uniform float uScale;
out vec4 outColor;
void main() {
  vec2 p = vec2(gl_FragCoord.x, uView.y * uScale - gl_FragCoord.y) / uScale;
  outColor = vec4(photos(p), 1.0);
}`,st=`${M}
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
}`,ot=`${M}
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
}`,it=`${M}
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
}`,rt=`${M}
uniform sampler2D uSrc;
uniform ivec2 uAxis;
out vec4 outColor;
float at(ivec2 q) { return texelFetch(uSrc, clamp(q, ivec2(0), textureSize(uSrc, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float v = at(p) * 0.375 + (at(p + uAxis) + at(p - uAxis)) * 0.25 + (at(p + 2 * uAxis) + at(p - 2 * uAxis)) * 0.0625;
  outColor = vec4(v, 0.0, 0.0, 1.0);
}`,at=`${M}
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
}`,nt=`${M}
uniform sampler2D uSrc;
uniform sampler2D uRim;
uniform float uScale;
out vec4 outColor;
float at(ivec2 q) { return texelFetch(uSrc, clamp(q, ivec2(0), textureSize(uSrc, 0) - 1), 0).r; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec2 g = vec2(at(p + ivec2(1, 0)) - at(p - ivec2(1, 0)), at(p + ivec2(0, 1)) - at(p - ivec2(0, 1))) * 0.5 * uScale;
  outColor = vec4(at(p), g, texelFetch(uRim, p, 0).r);
}`,lt=`${M}
uniform sampler2D uSrc;
uniform vec2 uStep;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(uSrc, 0));
  vec3 c = texture(uSrc, uv).rgb * 0.2270270;
  c += (texture(uSrc, uv + uStep * 1.3846154).rgb + texture(uSrc, uv - uStep * 1.3846154).rgb) * 0.3162162;
  c += (texture(uSrc, uv + uStep * 3.2307692).rgb + texture(uSrc, uv - uStep * 3.2307692).rgb) * 0.0702703;
  outColor = vec4(c, 1.0);
}`,H=`${M}${G}
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
}`;function j(l,t,e){if(!l.includes(t))throw new Error(`STAGE_FRAG_WIDE: "${t}" is gone from STAGE_FRAG`);return l.replace(t,e)}const ht=j(j(H,`uniform float uPx;     // one design px (sdf.ts designPx), CSS px: the scale of the fine detail
`,`uniform float uPx;     // one design px (sdf.ts designPx), CSS px: the scale of the fine detail
uniform float uWiden;  // >= 1: the screen's density over the buffer's (1: drawn at the screen's own)
`),`  float line = exp(-pow((r.w + 0.9 * uPx) / (0.65 * uPx), 2.0));
`,`  float lp = uPx * uWiden;
  float line = exp(-pow((r.w + 0.9 * lp) / (0.65 * lp), 2.0)) / uWiden;
`);function ut(l,t,e){const r=l.getImageData(0,0,t,e).data,n=new Uint8Array(t*e);for(let i=0;i<n.length;i++)n[i]=r[i*4+3];return n}function ct(l){const{width:t,height:e}=l,r=new OffscreenCanvas(t,e).getContext("2d",{willReadFrequently:!0});return r.globalCompositeOperation="copy",r.imageSmoothingEnabled=!1,r.drawImage(l,0,0),l.close(),ut(r,t,e)}function ft(l,t,e,r){const n=Math.ceil(t/r),i=Math.ceil(e/r),o=new Uint8Array(n*i);for(let h=0;h<i;h++)for(let s=0;s<n;s++){let a=0;for(let u=h*r;u<Math.min(e,h*r+r);u++)for(let c=s*r;c<Math.min(t,s*r+r);c++)a+=l[u*t+c];o[h*n+s]=Math.round(a/(r*r))}return{cov:o,w:n,h:i}}function K(l,t,e,r,n){let i=0;r[0]=0,n[0]=-1/0,n[1]=1/0;for(let o=1;o<t;o++){let h=(l[o]+o*o-(l[r[i]]+r[i]*r[i]))/(2*o-2*r[i]);for(;h<=n[i];)i--,h=(l[o]+o*o-(l[r[i]]+r[i]*r[i]))/(2*o-2*r[i]);i++,r[i]=o,n[i]=h,n[i+1]=1/0}i=0;for(let o=0;o<t;o++){for(;n[i+1]<o;)i++;e[o]=(o-r[i])*(o-r[i])+l[r[i]]}}function V(l,t,e){const r=Math.max(t,e),n=new Float64Array(r),i=new Float64Array(r),o=new Float64Array(r+1),h=new Int32Array(r);for(let s=0;s<t;s++){for(let a=0;a<e;a++)n[a]=l[a*t+s];K(n,e,i,h,o);for(let a=0;a<e;a++)l[a*t+s]=i[a]}for(let s=0;s<e;s++){for(let a=0;a<t;a++)n[a]=l[s*t+a];K(n,t,i,h,o);for(let a=0;a<t;a++)l[s*t+a]=Math.sqrt(i[a])}}function dt(l,t,e,r){const i=new Float64Array(t*e),o=new Float64Array(t*e);for(let u=0;u<l.length;u++){const c=l[u]>=128;i[u]=c?0:1e20,o[u]=c?1e20:0}V(i,t,e),V(o,t,e);const h=new Float32Array(t*e);for(let u=0;u<h.length;u++){const c=l[u]/255,f=c>0&&c<1?.5-c:0;h[u]=(i[u]-o[u]+f)/r}const s=new Float32Array(h.length),a=[.0625,.25,.375,.25,.0625];for(let u=0;u<2;u++){for(let c=0;c<e;c++){const f=c*t;for(let v=0;v<t;v++){let d=0;for(let m=-2;m<=2;m++)d+=a[m+2]*h[f+Math.min(t-1,Math.max(0,v+m))];s[f+v]=d}}for(let c=0;c<e;c++)for(let f=0;f<t;f++){let v=0;for(let d=-2;d<=2;d++)v+=a[d+2]*s[Math.min(e-1,Math.max(0,c+d))*t+f];h[c*t+f]=v}}return h}const B=.016,q=2.5,pt=1.4,Y=352,$=(l,t)=>Math.max(l/Y,1/t);function Z(l,t,e,r){const n=Math.max(1,Math.round((Math.sqrt(1+4*r*r)-1)/2)),i=new Float32Array(l.length),o=1/(2*n+1);for(let h=0;h<3;h++){for(let s=0;s<e;s++){const a=s*t;let u=0;for(let c=-n;c<=n;c++)u+=l[a+Math.min(t-1,Math.max(0,c))];for(let c=0;c<t;c++)i[a+c]=u*o,u+=l[a+Math.min(t-1,c+n+1)]-l[a+Math.max(0,c-n)]}for(let s=0;s<t;s++){let a=0;for(let u=-n;u<=n;u++)a+=i[Math.min(e-1,Math.max(0,u))*t+s];for(let u=0;u<e;u++)l[u*t+s]=a*o,a+=i[Math.min(e-1,u+n+1)*t+s]-i[Math.max(0,u-n)*t+s]}}}function mt(l,t,e,r,n,i){const o=Float32Array.from(l);Z(o,t,e,n*r);const h=Float32Array.from(l);Z(h,t,e,i*r);const s=new Float32Array(t*e*4);for(let a=0;a<e;a++){const u=Math.max(0,a-1),c=Math.min(e-1,a+1);for(let f=0;f<t;f++){const v=Math.max(0,f-1),d=Math.min(t-1,f+1),m=a*t+f;s[m*4]=o[m],s[m*4+1]=(o[a*t+d]-o[a*t+v])*r/Math.max(1,d-v),s[m*4+2]=(o[c*t+f]-o[u*t+f])*r/Math.max(1,c-u),s[m*4+3]=h[m]}}return s}const Q="no webgl2",O=l=>l<=0?0:l>=1?1:l*l*(3-2*l),xt=l=>1-Math.pow(1-Math.min(1,Math.max(0,l)),3),vt=1,Tt=1.05,W=.7,Et=1.2,gt=.55,yt=1.1,Rt=2,bt=1.05,At=5,U={x:.62,y:.38},y={K:120,Z:.6,KT:36,ZT:.75,KA:60,ZA:.35,RADIUS:.18,MIN_R:34,STRETCH:.06,TAIL:.7},St=2500,Ft=2;function _(l,t){const e=l.createProgram(),r=[[l.VERTEX_SHADER,tt],[l.FRAGMENT_SHADER,t]].map(([n,i])=>{const o=l.createShader(n);return l.shaderSource(o,i),l.compileShader(o),l.attachShader(e,o),o});return l.linkProgram(e),{prog:e,shaders:r,done:!1}}function D(l,{prog:t,shaders:e}){if(!l.getProgramParameter(t,l.LINK_STATUS)){const i=e.map(o=>l.getShaderInfoLog(o)).filter(Boolean).join(`
`);throw new Error(i||l.getProgramInfoLog(t)||"glass: link")}e.forEach(i=>l.deleteShader(i));const r={},n=l.getProgramParameter(t,l.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const o=l.getActiveUniform(t,i).name;r[o]=l.getUniformLocation(t,o)}return{prog:t,loc:r,sent:{}}}function p(l,t,e,r,n,i=0,o=0,h=0){let s=t.sent[e];if(s&&Object.is(s[0],n)&&Object.is(s[1],i)&&Object.is(s[2],o)&&Object.is(s[3],h))return;s||(s=t.sent[e]=[0,0,0,0]),s[0]=n,s[1]=i,s[2]=o,s[3]=h;const a=t.loc[e]??null;r==="1f"?l.uniform1f(a,n):r==="2f"?l.uniform2f(a,n,i):r==="3f"?l.uniform3f(a,n,i,o):r==="4f"?l.uniform4f(a,n,i,o,h):l.uniform1i(a,n)}class wt{constructor(t,e,r,n,i){this.canvas=t,this.post=r,this.schedule=n,this.cancel=i,this.progs=null,this.started=null,this.pcs=null,this.photosTex=null,this.photosFor=null,this.sdfTex=null,this.roundTex=null,this.frost=[],this.frostSize={w:1,h:1},this.frostScale=.25,this.px=1,this.bufDpr=0,this.widen=!1,this.pendingDpr=null,this.mark=null,this.sdfStarted=null,this.pendingMask=null,this.field=null,this.fence=null,this.pumpTimer=0,this.photoSet=0,this.photosWanted=0,this.photosIn=0,this.mipsStale=!1,this.pageLoaded=!1,this.visible=!0,this.lost=!1,this.lostTimer=0,this.disposed=!1,this.raf=0,this.last=0,this.clock=0,this.frames=0,this.drawn=!1,this.slow=0,this.worst=0,this.interval=1/60,this.cpu=0,this.born=performance.now(),this.lamp={x:-400,y:0},this.stir={on:!1,px:0,py:0,placed:!1,x:0,y:0,vx:0,vy:0,tx:0,ty:0,tvx:0,tvy:0,a:0,va:0},this.parallax={x:0,y:0,vx:0,vy:0,tx:0,ty:0},this.pump=()=>{if(this.pumpTimer=0,this.disposed||this.lost)return;const h=this.gl;let s=!1;if(!this.progs&&this.started)if(this.built(Object.values(this.started))){try{this.linkFrame()}catch(a){this.post({type:"fail",reason:String(a)}),this.dispose();return}this.kick()}else s=!0;if(this.pendingMask)if(this.sdfProgs!==void 0||!this.sdfStarted||this.built(Object.values(this.sdfStarted))){const a=this.pendingMask;this.pendingMask=null,this.applyMask(a)}else s=!0;this.field&&(this.fence&&h.getSyncParameter(this.fence,h.SYNC_STATUS)===h.SIGNALED&&(h.deleteSync(this.fence),this.fence=null),this.fence||(this.runField(!1),this.field&&(this.fence=h.fenceSync(h.SYNC_GPU_COMMANDS_COMPLETE,0),h.flush())),this.field&&(s=!0)),s&&!this.pumpTimer&&(this.pumpTimer=setTimeout(this.pump,16))},this.onLost=h=>{this.disposed||(h.preventDefault(),this.contextLost())},this.onRestored=()=>{if(!(this.disposed||!this.lost)){clearTimeout(this.lostTimer),this.lost=!1,this.note("context restored"),this.frost=[],this.photosTex=null,this.photosFor=null,this.sdfTex=null,this.roundTex=null,this.mark=null;try{this.setup()}catch(h){this.post({type:"fail",reason:String(h)}),this.dispose();return}this.size(),this.marquee&&this.loadPhotos(this.marquee),this.post({type:"remask"}),this.kick(),this.pumpSoon()}};let o=null;try{o=t.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:"default"})}catch{o=null}if(!o)throw new Error(Q);this.gl=o;try{const h=o.getExtension("WEBGL_debug_renderer_info"),s=o.getParameter(h?h.UNMASKED_RENDERER_WEBGL:o.RENDERER);typeof s=="string"&&s&&r({type:"gpu",renderer:s})}catch{}this.view=e.view,this.marquee=e.mode==="hero"?e.marquee:null,this.reduced=e.reduced,this.visible=e.visible??!0,this.bufDpr=e.bufDpr??0,this.widen=!!e.widen,this.intro=e.intro?{t:0,seen:null,pour:0,full:null,leave:null,speed:1,done:!1,quick:!!e.quick}:null,this.note("context"),this.setup(),this.lamp=this.intro?{x:-400,y:this.view.h*U.y}:{x:this.view.w*U.x,y:this.view.h*U.y},this.size(),this.marquee&&this.loadPhotos(this.marquee),this.loop=this.loop.bind(this),t.addEventListener("webglcontextlost",this.onLost),t.addEventListener("webglcontextrestored",this.onRestored),this.kick(),this.pumpSoon()}note(t){this.post({type:"mark",step:t,at:Math.round(performance.now()-this.born)})}setup(){const t=this.gl;this.pcs=t.getExtension("KHR_parallel_shader_compile"),this.started={stage:_(t,this.widen?ht:H),photos:_(t,et),blur:_(t,lt)},this.progs=null,this.sdfProgs=void 0,this.sdfStarted=t.getExtension("EXT_color_buffer_float")?{seed:_(t,st),jump:_(t,ot),dist:_(t,it),blur:_(t,rt),round:_(t,at),grad:_(t,nt)}:null,this.vao=t.createVertexArray(),t.bindVertexArray(this.vao),this.pcs||this.linkFrame()}built(t){const e=this.pcs;if(!e)return!0;for(const r of t)if(!r.done){if(!this.gl.getProgramParameter(r.prog,e.COMPLETION_STATUS_KHR))return!1;r.done=!0}return!0}linkFrame(){const t=this.started;this.started=null,this.progs={stage:D(this.gl,t.stage),photos:D(this.gl,t.photos),blur:D(this.gl,t.blur)},this.note("compiled")}pumpSoon(){!this.pumpTimer&&!this.disposed&&(this.pumpTimer=setTimeout(this.pump,0))}contextLost(){this.lost||(this.lost=!0,this.note("context lost"),this.raf&&this.cancel(this.raf),this.raf=0,this.last=0,clearTimeout(this.pumpTimer),this.pumpTimer=0,this.field=null,this.fence=null,this.pendingMask=null,this.lostTimer=setTimeout(()=>{!this.lost||this.disposed||(this.post({type:"fail",reason:"context lost"}),this.dispose())},St))}handle(t){switch(t.type){case"mask":{if(this.lost||!t.cov)break;if(this.note("mask in"),this.field&&(this.field.drop(),this.field=null,this.fence&&this.gl.deleteSync(this.fence),this.fence=null),this.sdfProgs===void 0&&this.sdfStarted&&!this.built(Object.values(this.sdfStarted))){this.pendingMask=t,this.pumpSoon();break}this.pendingMask=null,this.applyMask(t);break}case"mark":this.lost||this.setMark(t.mark);break;case"view":{const e=this.marquee,r=t.marquee;if(this.view=t.view,this.pendingDpr!==null&&(this.bufDpr=this.pendingDpr,this.pendingDpr=null),e&&r&&(this.marquee=r,(r.layerW!==e.layerW||r.layerH!==e.layerH||r.cols!==e.cols||r.perColumn!==e.perColumn||r.photos.join()!==e.photos.join())&&!this.lost&&this.loadPhotos(r)),this.lost)break;this.size(),this.kick();break}case"pointer":this.stir.on=!Number.isNaN(t.x),this.stir.on&&(this.stir.px=t.x,this.stir.py=t.y),this.kick();break;case"parallax":this.parallax.tx=t.x,this.parallax.ty=t.y,this.kick();break;case"visible":this.visible=t.visible,this.visible&&this.field&&!this.lost&&this.finishField(),this.kick();break;case"quality":{const e=t.dpr>0?t.dpr:0;this.pendingDpr=e===this.bufDpr?null:e,t.now&&this.applyQuality();break}case"loaded":this.note("page loaded"),this.pageLoaded=!0;break;case"hurry":this.intro&&(this.intro.speed=3);break;case"dispose":this.dispose();break}}size(){const{w:t,h:e,dpr:r}=this.view,n=this.bufDpr>0?Math.min(this.bufDpr,r):r;this.canvas.width=Math.max(1,Math.round(t*n)),this.canvas.height=Math.max(1,Math.round(e*n)),this.fitFrost()}applyQuality(){if(this.pendingDpr===null||(this.bufDpr=this.pendingDpr,this.pendingDpr=null,this.lost||this.disposed))return;const t=[this.canvas.width,this.canvas.height];this.size(),!(this.canvas.width===t[0]&&this.canvas.height===t[1])&&this.progs&&this.drawn&&!this.lost&&this.render()}fitFrost(){const t=this.gl,{w:e,h:r}=this.view;this.frostScale=.25*(this.mark?Y/this.mark.size:1);const n=Math.max(1,Math.ceil(e*this.frostScale)),i=Math.max(1,Math.ceil(r*this.frostScale));n===this.frostSize.w&&i===this.frostSize.h&&this.frost.length||(this.frost.forEach(({tex:o,fbo:h})=>{t.deleteTexture(o),t.deleteFramebuffer(h)}),this.frost=[0,1].map(()=>{const o=t.createTexture();t.bindTexture(t.TEXTURE_2D,o),t.texStorage2D(t.TEXTURE_2D,1,t.RGBA8,n,i),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const h=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,h),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,o,0),{tex:o,fbo:h}}),t.bindFramebuffer(t.FRAMEBUFFER,null),this.frostSize={w:n,h:i})}setMark(t){const e=this.gl;this.sdfTex||(this.sdfTex=e.createTexture()),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.sdfTex),e.texImage2D(e.TEXTURE_2D,0,e.R16F,t.w,t.h,0,e.RED,e.FLOAT,t.sd),this.sampled(e.TEXTURE_2D,e.LINEAR);const r=t.w/t.rect.w,n=$(t.size,this.view.dpr);this.roundTex||(this.roundTex=e.createTexture()),e.bindTexture(e.TEXTURE_2D,this.roundTex),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t.w,t.h,0,e.RGBA,e.FLOAT,mt(t.sd,t.w,t.h,r,B*t.size,q*n)),this.sampled(e.TEXTURE_2D,e.LINEAR);const{sd:i,...o}=t;this.markReady(o,n)}applyMask(t){const e=t.cov,r={w:t.w,h:t.h,rect:t.rect,size:t.size,ink:t.ink,dot:t.dot??null},n=$(t.size,this.view.dpr),i=this.gpuField(e,t.w,t.h,t.scale,t.size,n,r);if(i){this.field=i,!this.mark&&!this.visible?this.pumpSoon():this.finishField();return}const o=Math.max(1,Math.round(t.scale/pt)),h=o>1?ft(e,t.w,t.h,o):{cov:e,w:t.w,h:t.h},s=t.scale/o,a={...t.rect,w:h.w/s,h:h.h/s};this.setMark({...r,w:h.w,h:h.h,rect:a,sd:dt(h.cov,h.w,h.h,s)})}runField(t){const e=this.field,r=this.gl;r.bindVertexArray(this.vao),r.viewport(0,0,e.w,e.h);const n=t?e.steps.length:Math.min(e.steps.length,e.next+Ft);for(n>=e.steps.length&&(this.field=null);e.next<n;)e.steps[e.next++]()}finishField(){this.fence&&this.gl.deleteSync(this.fence),this.fence=null,this.runField(!0)}markReady(t,e){this.mark=t,this.px=e,this.fitFrost(),this.note("mark set"),this.kick()}sampled(t,e){const r=this.gl;r.texParameteri(t,r.TEXTURE_MIN_FILTER,e),r.texParameteri(t,r.TEXTURE_MAG_FILTER,e),r.texParameteri(t,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(t,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}gpuField(t,e,r,n,i,o,h){const s=this.gl;if(this.sdfProgs===void 0){const T=this.sdfStarted;this.sdfStarted=null;try{this.sdfProgs=T?{seed:D(s,T.seed),jump:D(s,T.jump),dist:D(s,T.dist),blur:D(s,T.blur),round:D(s,T.round),grad:D(s,T.grad)}:null}catch{this.sdfProgs=null}}const a=this.sdfProgs;if(!a)return null;let u=!0;const c=[],f=(T,A)=>{const S=s.createTexture();s.bindTexture(s.TEXTURE_2D,S),s.texStorage2D(s.TEXTURE_2D,1,T,e,r),this.sampled(s.TEXTURE_2D,A);const N=s.createFramebuffer();return s.bindFramebuffer(s.FRAMEBUFFER,N),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,S,0),u&&(u=s.checkFramebufferStatus(s.FRAMEBUFFER)===s.FRAMEBUFFER_COMPLETE),c.push({tex:S,fbo:N}),{tex:S,fbo:N}};s.activeTexture(s.TEXTURE4);const v=s.createTexture();s.bindTexture(s.TEXTURE_2D,v),s.pixelStorei(s.UNPACK_ALIGNMENT,1),s.texImage2D(s.TEXTURE_2D,0,s.R8,e,r,0,s.RED,s.UNSIGNED_BYTE,t),s.pixelStorei(s.UNPACK_ALIGNMENT,4),this.sampled(s.TEXTURE_2D,s.NEAREST);let d=f(s.RG32F,s.NEAREST),m=f(s.RG32F,s.NEAREST);const E=f(s.R16F,s.NEAREST),g=f(s.R16F,s.NEAREST),w=f(s.R16F,s.LINEAR),L=f(s.R16F,s.NEAREST),X=f(s.RGBA16F,s.LINEAR),z=()=>{c.forEach(T=>(s.deleteTexture(T.tex),s.deleteFramebuffer(T.fbo))),s.deleteTexture(v)};if(s.bindFramebuffer(s.FRAMEBUFFER,null),!u)return z(),this.sdfProgs=null,null;const b=(T,A,S)=>{s.useProgram(T.prog),s.bindFramebuffer(s.FRAMEBUFFER,A.fbo),S(),s.drawArrays(s.TRIANGLES,0,3)},x=(T,A)=>{s.activeTexture(s.TEXTURE0+T),s.bindTexture(s.TEXTURE_2D,A)},R=[];R.push(()=>{x(4,v),b(a.seed,d,()=>s.uniform1i(a.seed.loc.uCov,4))});let F=1;for(;F*2<Math.max(e,r);)F*=2;for(const T of[...Array.from({length:Math.log2(F)+1},(A,S)=>F>>S),1])R.push(()=>{x(5,d.tex),b(a.jump,m,()=>{s.uniform1i(a.jump.loc.uSeed,5),s.uniform1i(a.jump.loc.uStep,T)}),[d,m]=[m,d]});R.push(()=>{x(5,d.tex),x(4,v),b(a.dist,E,()=>{s.uniform1i(a.dist.loc.uSeed,5),s.uniform1i(a.dist.loc.uCov,4),s.uniform1f(a.dist.loc.uScale,n)})});const I=(T,A,S,N)=>R.push(()=>{x(6,T),b(a.blur,A,()=>{s.uniform1i(a.blur.loc.uSrc,6),s.uniform2i(a.blur.loc.uAxis,S,N)})});I(E.tex,g,1,0),I(g.tex,E,0,1),I(E.tex,g,1,0),I(g.tex,w,0,1);const P=(T,A,S,N,J)=>R.push(()=>{x(6,T),b(a.round,A,()=>{s.uniform1i(a.round.loc.uSrc,6),s.uniform2i(a.round.loc.uAxis,S,N),s.uniform1f(a.round.loc.uSigma,J),s.uniform1i(a.round.loc.uRadius,Math.ceil(3*J))})});return P(w.tex,g,1,0,q*o*n),P(g.tex,L,0,1,q*o*n),P(w.tex,g,1,0,B*i*n),P(g.tex,E,0,1,B*i*n),R.push(()=>{x(6,E.tex),x(7,L.tex),b(a.grad,X,()=>{s.uniform1i(a.grad.loc.uSrc,6),s.uniform1i(a.grad.loc.uRim,7),s.uniform1f(a.grad.loc.uScale,n)})}),R.push(()=>{s.bindFramebuffer(s.FRAMEBUFFER,null),[d,m,E,g,L].forEach(T=>(s.deleteTexture(T.tex),s.deleteFramebuffer(T.fbo))),s.deleteFramebuffer(w.fbo),s.deleteFramebuffer(X.fbo),s.deleteTexture(v),this.sdfTex&&s.deleteTexture(this.sdfTex),this.roundTex&&s.deleteTexture(this.roundTex),this.sdfTex=w.tex,this.roundTex=X.tex,this.markReady(h,o)}),{steps:R,next:0,w:e,h:r,drop:z}}async loadPhotos(t){const e=this.gl,r=t.cols*t.perColumn,n=this.photosTex,i=this.photosFor;this.photosFor=t,this.photosTex=e.createTexture(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,this.photosTex);const o=1+Math.floor(Math.log2(Math.max(t.layerW,t.layerH)));e.texStorage3D(e.TEXTURE_2D_ARRAY,o,e.RGBA8,t.layerW,t.layerH,Math.max(1,r)),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D_ARRAY,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const h=this.photosTex;if(n){if(i&&i.perColumn===t.perColumn){const c=e.createFramebuffer(),f=e.createFramebuffer();e.bindFramebuffer(e.READ_FRAMEBUFFER,c),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,f);for(let v=0;v<Math.min(i.cols*i.perColumn,r);v++)e.framebufferTextureLayer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,n,0,v),e.framebufferTextureLayer(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,h,0,v),e.blitFramebuffer(0,0,i.layerW,i.layerH,0,0,t.layerW,t.layerH,e.COLOR_BUFFER_BIT,e.LINEAR);e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.deleteFramebuffer(c),e.deleteFramebuffer(f),this.mipsStale=!0}e.deleteTexture(n)}const s=++this.photoSet;this.photosWanted=r,this.photosIn=0;const a=typeof OffscreenCanvas<"u"?new OffscreenCanvas(t.layerW,t.layerH):document.createElement("canvas");a.width=t.layerW,a.height=t.layerH;const u=a.getContext("2d");u.imageSmoothingQuality="high",await Promise.all(t.photos.slice(0,r).map(async(c,f)=>{try{const v=await(await fetch(c)).blob(),d=await createImageBitmap(v);if(this.disposed||s!==this.photoSet)return d.close();const m=d.width/d.height;let E=d.width,g=d.height;m>.75?E=d.height*.75:g=d.width/.75,u.drawImage(d,(d.width-E)/2,(d.height-g)/2,E,g,0,0,t.layerW,t.layerH),d.close(),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D_ARRAY,h),e.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,f,t.layerW,t.layerH,1,e.RGBA,e.UNSIGNED_BYTE,a),this.mipsStale=!0}catch{}finally{s===this.photoSet&&(this.photosIn++,this.photosIn===this.photosWanted&&this.note("photos in"),this.kick())}}))}kick(){this.raf||this.disposed||(this.raf=this.schedule(this.loop))}loop(t){if(this.raf=0,this.disposed||this.lost||!this.progs){this.last=0;return}const e=this.last?(t-this.last)/1e3:0,r=e?Math.min(.05,e):1/60;if(e&&(e<this.interval*1.25&&(this.interval+=(e-this.interval)*.05),e>this.interval*1.6&&this.slow++,this.worst=Math.max(this.worst,e*1e3)),this.last=t,!this.visible){this.last=0;return}const n=performance.now(),i=this.step(r);(this.drawn||this.mark||this.intro)&&this.render(),this.cpu=Math.max(this.cpu,performance.now()-n),i?this.raf=this.schedule(this.loop):this.last=0}step(t){let e=!1;const r=this.view.w,n=this.view.h;this.marquee&&!this.reduced&&(this.clock+=t,e=!0);const i=this.intro;if(i&&!i.done){e=!0,i.t+=t*i.speed*(i.quick?2:1);const a=this.marquee?.15*(this.mark?1:0)+.7*(this.photosWanted?this.photosIn/this.photosWanted:1)+.15*(this.pageLoaded?1:0):.5*(this.mark?1:0)+.5*(this.pageLoaded?1:0),u=i.t>At||a>=1?1:Math.min(.97,.3+a);this.mark&&i.seen===null&&(i.seen=i.t);const c=i.seen===null?0:Math.min(O((i.t-i.seen-.15)/vt),u);i.pour+=(c-i.pour)*Math.min(1,t*7),i.full===null&&i.pour>.995&&c>=1&&(i.full=i.t,this.note("poured")),i.leave===null&&u>=1&&i.pour>.8&&(i.leave=i.t,this.post({type:"intro",beat:"leaving"})),i.leave!==null&&i.t-i.leave>=(this.marquee?Rt:bt)&&(i.done=!0,this.post({type:"intro",beat:"done"}))}if(i&&!i.done){const a=i.leave===null?-1:i.t-i.leave,u=xt((a-W)/Et);this.lamp.x=a<W?-400:-400+(r*U.x+400)*u,this.lamp.y=n*U.y}else{const a=this.reduced?0:this.clock,u=r*(U.x+.1*Math.sin(a*.23))-this.lamp.x,c=n*(U.y+.07*Math.sin(a*.17+1.3))-this.lamp.y;this.lamp.x+=u*.12,this.lamp.y+=c*.12,(Math.abs(u)>.3||Math.abs(c)>.3)&&(e=!0)}const o=this.stir,h=this.mark;if(h&&(!i||i.done)){const a=Math.max(1,Math.ceil(t*120)),u=t/a,c=2*y.Z*Math.sqrt(y.K),f=2*y.ZT*Math.sqrt(y.KT),v=2*y.ZA*Math.sqrt(y.KA);for(let d=0;d<a;d++){let m=0;if(o.on){o.placed||Object.assign(o,{x:o.px,y:o.py,tx:o.px,ty:o.py,vx:0,vy:0,tvx:0,tvy:0,placed:!0}),o.vx+=(y.K*(o.px-o.x)-c*o.vx)*u,o.vy+=(y.K*(o.py-o.y)-c*o.vy)*u;const E=h.ink,g=Math.hypot(Math.max(E.left-o.px,0,o.px-E.right),Math.max(E.top-o.py,0,o.py-E.bottom));m=(1-O(g/(.35*h.size)))*(.45+.55*Math.min(1,Math.hypot(o.vx,o.vy)/(2.5*h.size)))}else{const E=Math.exp(-8*u);o.vx*=E,o.vy*=E}o.x+=o.vx*u,o.y+=o.vy*u,o.tvx+=(y.KT*(o.x-o.tx)-f*o.tvx)*u,o.tvy+=(y.KT*(o.y-o.ty)-f*o.tvy)*u,o.tx+=o.tvx*u,o.ty+=o.tvy*u,o.va+=(y.KA*(m-o.a)-v*o.va)*u,o.a+=o.va*u}!o.on&&o.a<.002&&Math.abs(o.va)<.002&&(o.placed=!1),(o.a>.002||Math.abs(o.va)>.002||Math.hypot(o.vx,o.vy)>.5||Math.hypot(o.tvx,o.tvy)>.5)&&(e=!0)}const s=this.parallax;if(Math.abs(s.tx-s.x)>.01||Math.abs(s.vx)>.01||Math.abs(s.ty-s.y)>.01||Math.abs(s.vy)>.01){const a=60*(s.tx-s.x)-20*s.vx,u=60*(s.ty-s.y)-20*s.vy;s.vx+=a*t,s.vy+=u*t,s.x+=s.vx*t,s.y+=s.vy*t,e=!0}return e||!this.drawn}frostRead(t){const e=this.frostScale,r=this.view.h,n=Math.max(y.RADIUS*t.size,y.MIN_R),i=.2*t.size+.4*n,{x:o,y:h,w:s,h:a}=t.rect;return[Math.floor((o-i)*e-.5)-1,Math.floor((r-(h+a+i))*e-.5)-1,Math.floor((o+s+i)*e-.5)+3,Math.floor((r-(h-i))*e-.5)+3]}render(){const t=this.gl;if(t.isContextLost()){this.contextLost();return}const e=this.progs,{w:r,h:n,dpr:i}=this.view,o=this.marquee,h=(x,R)=>{p(t,x,"uLod","1f",R),p(t,x,"uView","2f",r,n),p(t,x,"uTime","1f",this.clock),p(t,x,"uParallax","2f",this.parallax.x,this.parallax.y),p(t,x,"uPhotos","1i",0),p(t,x,"uCols","1f",o?o.cols:0),p(t,x,"uColW","1f",o?o.colW:1),p(t,x,"uTileH","1f",o?o.tileH:1),p(t,x,"uPer","1f",o?o.perColumn:1),p(t,x,"uMarquee","1f",o?1:0)};t.bindVertexArray(this.vao),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D_ARRAY,this.photosTex),this.mipsStale&&(t.generateMipmap(t.TEXTURE_2D_ARRAY),this.mipsStale=!1);const[s,a]=this.frost,u=this.frostScale,c=this.mark;if(o){const x=c?this.frostRead(c):null,R=F=>{if(!x)return;const I=Math.max(0,x[0]-F),P=Math.max(0,x[1]-F),T=Math.min(this.frostSize.w,x[2]+F),A=Math.min(this.frostSize.h,x[3]+F);t.scissor(I,P,Math.max(0,T-I),Math.max(0,A-P))};x&&t.enable(t.SCISSOR_TEST),t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),t.viewport(0,0,this.frostSize.w,this.frostSize.h),t.useProgram(e.photos.prog),h(e.photos,Math.log2(o.layerW/(o.colW*u))),p(t,e.photos,"uScale","1f",u),R(10),t.drawArrays(t.TRIANGLES,0,3),t.useProgram(e.blur.prog),p(t,e.blur,"uSrc","1i",3),t.activeTexture(t.TEXTURE3),t.bindTexture(t.TEXTURE_2D,s.tex),t.bindFramebuffer(t.FRAMEBUFFER,a.fbo),p(t,e.blur,"uStep","2f",1/this.frostSize.w,0),R(5),t.drawArrays(t.TRIANGLES,0,3),t.bindTexture(t.TEXTURE_2D,a.tex),t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),p(t,e.blur,"uStep","2f",0,1/this.frostSize.h),R(0),t.drawArrays(t.TRIANGLES,0,3),x&&t.disable(t.SCISSOR_TEST)}else t.bindFramebuffer(t.FRAMEBUFFER,s.fbo),t.viewport(0,0,this.frostSize.w,this.frostSize.h),t.clearColor(5/255,5/255,5/255,1),t.clear(t.COLOR_BUFFER_BIT);t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.canvas.width,this.canvas.height),t.useProgram(e.stage.prog),h(e.stage,0);const f=e.stage,v=this.canvas.width/r;p(t,f,"uDpr","1f",v),p(t,f,"uPx","1f",this.px),p(t,f,"uWiden","1f",this.bufDpr>0&&this.bufDpr<i?i/v:1),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,s.tex),p(t,f,"uFrost","1i",2),p(t,f,"uFrostUV","2f",u/this.frostSize.w,u/this.frostSize.h),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.sdfTex),p(t,f,"uSdf","1i",1),t.activeTexture(t.TEXTURE5),t.bindTexture(t.TEXTURE_2D,this.roundTex),p(t,f,"uRound","1i",5),c?(p(t,f,"uSdfRect","4f",c.rect.x,c.rect.y,c.rect.w,c.rect.h),p(t,f,"uFont","1f",c.size),p(t,f,"uInk","2f",c.ink.top,c.ink.bottom)):(p(t,f,"uSdfRect","4f",-1e4,-1e4,1,1),p(t,f,"uFont","1f",1),p(t,f,"uInk","2f",0,1)),p(t,f,"uLight","3f",this.lamp.x,this.lamp.y,.35*(c?c.size:300));const d=c==null?void 0:c.dot;p(t,f,"uDot","3f",d?d.x:0,d?d.y:0,d?d.r:0);const m=this.stir,E=Math.max(y.RADIUS*(c?c.size:300),y.MIN_R);let g=m.vx*y.STRETCH,w=m.vy*y.STRETCH;const L=Math.hypot(g,w);L>.6*E&&(g*=.6*E/L,w*=.6*E/L);const X=Math.max(0,m.a),z=Math.min(1,Math.hypot(m.x-m.tx,m.y-m.ty)/E);p(t,f,"uBlob","4f",m.x,m.y,g,w),p(t,f,"uBlobA","2f",X,E),p(t,f,"uTail","3f",m.tx,m.ty,X*y.TAIL*O(z));const b=this.intro;if(b&&!b.done){const x=b.full===null?1:1-O((b.t-b.full)/Tt),R=b.leave===null?-1:b.t-b.leave,F=O((R-(W-.1))/.5),I=O((R-gt)/yt);p(t,f,"uIntro","4f",b.pour,x,I,F)}else p(t,f,"uIntro","4f",1,0,1,1);t.drawArrays(t.TRIANGLES,0,3),this.frames++,!this.drawn&&c&&(this.drawn=!0,this.note("first frame"),this.post({type:"drawn"})),(this.frames&63)===0&&(this.post({type:"stats",frame:this.frames,photos:this.photosIn,slow:this.slow,worst:Math.round(this.worst),cpu:Math.round(this.cpu*10)/10,lamp:[Math.round(this.lamp.x),Math.round(this.lamp.y)],buf:[this.canvas.width,this.canvas.height]}),this.cpu=0)}dispose(){var t;this.disposed||(this.disposed=!0,this.raf&&this.cancel(this.raf),clearTimeout(this.pumpTimer),clearTimeout(this.lostTimer),this.canvas.removeEventListener("webglcontextlost",this.onLost),this.canvas.removeEventListener("webglcontextrestored",this.onRestored),(t=this.gl.getExtension("WEBGL_lose_context"))==null||t.loseContext())}}const C=self,Mt=C.requestAnimationFrame?l=>C.requestAnimationFrame(l):l=>setTimeout(()=>l(performance.now()),16),_t=C.cancelAnimationFrame?l=>C.cancelAnimationFrame(l):l=>clearTimeout(l);let k=null;C.onmessage=l=>{const t=l.data;if(t.type==="init"){try{k=new wt(t.canvas,t,e=>C.postMessage(e),Mt,_t)}catch(e){C.postMessage({type:"fail",reason:String(e),noContext:e instanceof Error&&e.message===Q})}return}if(t.type==="mask"&&t.bitmap){const{bitmap:e,...r}=t;if(!k)return e.close();k.handle({...r,cov:ct(e)});return}k==null||k.handle(t),t.type==="dispose"&&(k=null)}})();
