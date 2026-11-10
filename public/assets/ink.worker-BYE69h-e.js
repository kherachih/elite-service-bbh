(function(){"use strict";const N="attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }",f=`
precision highp float;
uniform vec2 uRes;
uniform float uTime;

const vec3 BASE    = vec3(5.0 / 255.0);          // the site's black, #050505
const vec3 OXBLOOD = vec3(0.30, 0.035, 0.03);
const vec3 DEEP    = vec3(0.55, 0.07, 0.055);
const vec3 TALLY   = vec3(0.996, 0.243, 0.212);   // #fe3e36

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
vec3 ramp(float x) {
  x = clamp(x, 0.0, 1.0);
  vec3 c = mix(OXBLOOD, DEEP, smoothstep(0.0, 0.6, x));
  return mix(c, TALLY, smoothstep(0.75, 1.0, x) * 0.55);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  bool tall = aspect < 1.0;
  vec2 p = uv - 0.5;
  p.x *= aspect;

  // Nested warping: the ink folds through itself.
  vec2 q = p * (tall ? 2.2 : 1.6);
  float s = uTime * 0.032;
  vec2 a = vec2(fbm(q + vec2(0.0, s)), fbm(q + vec2(5.2, 1.3) - s));
  vec2 b = vec2(fbm(q + 4.0 * a + vec2(1.7, 9.2) + s * 1.3), fbm(q + 4.0 * a + vec2(8.3, 2.8)));
  float f = fbm(q + 4.0 * b);

  // Spread across the whole frame, a little richer towards the sides: the
  // middle is mostly covered by him and his name, the sides are where the
  // ink is seen. Thinner ink reaches the sides too (a lower threshold there),
  // so they always hold some.
  float side = smoothstep(0.1, 0.45, abs(uv.x - 0.5) * (tall ? 1.15 : 1.0));
  float fil = smoothstep(0.5 - 0.07 * side, 0.8 - 0.05 * side, f) * (0.6 + 0.4 * length(b));
  float light = fil * (0.8 + 0.35 * side) * 0.82;

  // The frame's top and bottom return to the site's black, so About meets
  // the sections either side of it without an edge.
  light *= smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);

  gl_FragColor = vec4(BASE + ramp(fil) * light, 1.0);
}`,y=(()=>{const t=f.indexOf("float hash(vec2 p)"),e=f.indexOf("float fbm(vec2 p)");if(t<0||e<t)throw new Error("ink: FRAG's noise is not where FRAG_TEX expects it");return f.slice(0,t)+`uniform sampler2D uNoise;
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec4 h = texture2D(uNoise, (i + 0.5) / 256.0);
  return mix(mix(h.x, h.y, u.x), mix(h.z, h.w, u.x), u.y);
}
`+f.slice(e)})();function P(){const e=new Uint8Array(65536);let s=50048536;for(let r=0;r<e.length;r++){s=s+1831565813|0;let a=Math.imul(s^s>>>15,1|s);a=a+Math.imul(a^a>>>7,61|a)^a,e[r]=(a^a>>>14)>>>24&255}const o=new Uint8Array(256*256*4);for(let r=0;r<256;r++){const a=(r+1)%256;for(let l=0;l<256;l++){const c=(l+1)%256,p=4*(r*256+l);o[p]=e[r*256+l],o[p+1]=e[r*256+c],o[p+2]=e[a*256+l],o[p+3]=e[a*256+c]}}return o}const S=40,U=30;class F{constructor(e,s=!1,o=!1){this.canvas=e,this.opaque=s,this.table=o,this.prog=null,this.shaders=[],this.uRes=null,this.uTime=null,this.shown=NaN,this.linked=!1;const r=e.getContext("webgl",{alpha:!s,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"low-power"});if(!r)throw new Error("no webgl");this.gl=r,this.parallel=r.getExtension("KHR_parallel_shader_compile"),s&&(r.clearColor(5/255,5/255,5/255,1),this.blank())}blank(){this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.shown=NaN}get background(){return!!this.parallel}build(e=!1){const s=this.gl,o=(a,l)=>{const c=s.createShader(a);return s.shaderSource(c,l),s.compileShader(c),c},r=s.createProgram();this.shaders=[o(s.VERTEX_SHADER,N),o(s.FRAGMENT_SHADER,this.table?y:f)];for(const a of this.shaders)s.attachShader(r,a);s.linkProgram(r),this.prog=r,s.bindBuffer(s.ARRAY_BUFFER,s.createBuffer()),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),s.STATIC_DRAW),(!this.parallel||e)&&this.finish()}ready(){return this.linked?!0:!this.prog||this.parallel&&!this.gl.getProgramParameter(this.prog,this.parallel.COMPLETION_STATUS_KHR)?!1:(this.finish(),!0)}finish(){const e=this.gl,s=this.prog;for(const r of this.shaders)if(!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r)??"ink shader");if(!e.getProgramParameter(s,e.LINK_STATUS))throw new Error("ink link");e.useProgram(s);const o=e.getAttribLocation(s,"position");e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0),this.uRes=e.getUniformLocation(s,"uRes"),this.uTime=e.getUniformLocation(s,"uTime"),this.table&&(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,e.createTexture()),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,256,256,0,e.RGBA,e.UNSIGNED_BYTE,P()),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.uniform1i(e.getUniformLocation(s,"uNoise"),0)),this.linked=!0}resize(e,s){this.canvas.width===e&&this.canvas.height===s||(this.canvas.width=e,this.canvas.height=s,this.gl.viewport(0,0,e,s),this.shown=NaN,this.opaque&&this.blank())}draw(e){const s=this.gl;!this.linked||e===this.shown||s.isContextLost()||(s.uniform2f(this.uRes,this.canvas.width,this.canvas.height),s.uniform1f(this.uTime,e),s.drawArrays(s.TRIANGLES,0,3),this.shown=e)}dispose(){var e;(e=this.gl.getExtension("WEBGL_lose_context"))==null||e.loseContext()}}class D{constructor(){this.t=S,this.last=-1,this.lastDraw=-1/0,this.fps=U}tick(e){return this.last>=0&&(this.t+=Math.min(.1,(e-this.last)/1e3)),this.last=e,e-this.lastDraw<1e3/this.fps-2?!1:(this.lastDraw=e,!0)}pause(){this.last=-1}get time(){return this.t}}const h=self,d=h.requestAnimationFrame?t=>h.requestAnimationFrame(t):t=>setTimeout(()=>t(performance.now()),33),E=h.cancelAnimationFrame?t=>h.cancelAnimationFrame(t):t=>clearTimeout(t);let i=null;const n=new D;let R=!1,m=!1,g=!1,x=!1,v=0,A=!1,u=0;const w=t=>{v=d(w),i!=null&&i.linked&&n.tick(t)&&i.draw(n.time)},T=()=>{const t=m&&!g&&!R;t!==x&&(x=t,t?v=d(w):(E(v),n.pause()))},b=()=>{if(u=0,!i)return;let t;try{t=i.ready()}catch{i=null;return}t?i.draw(n.time):u=d(b)},_=()=>{if(!(!i||A)){A=!0;try{i.build()}catch{i=null;return}b()}};h.onmessage=({data:t})=>{if(t.type==="init"){try{i=new F(t.canvas,t.opaque,t.table)}catch{h.postMessage({type:"fail"});return}i.resize(t.width,t.height),R=t.still,n.fps=t.fps,i.background||_()}else t.type==="go"?_():t.type==="size"?(i==null||i.resize(t.width,t.height),i==null||i.draw(n.time)):t.type==="run"?(m=t.on,T()):t.type==="hold"?(g=t.on,T()):t.type==="fps"?n.fps=t.fps:t.type==="dispose"&&(m=!1,T(),u&&E(u),u=0,i==null||i.dispose(),i=null)}})();
