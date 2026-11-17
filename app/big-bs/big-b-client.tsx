"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Instagram, Linkedin, Menu, Moon, Sparkles, Sun, X } from "lucide-react";

type Theme = "dark" | "light";
type IntroPhase = "pending" | "done";

/* ------------------------------------------------------------------ *
 * Cinematic cream ink opening (BIG B'S only)
 *
 * The server renders a cream overlay on top of an already-dark page, so the
 * first paint is always cream and the dark site can never flash. Once fonts and
 * the window load event are ready, a WebGL2 shader draws warm cream ink with
 * marbled veins over the page and lets it recede through domain-warped,
 * ridged-noise boundaries, uncovering the real dark DOM underneath.
 * ------------------------------------------------------------------ */

const INTRO_MS = 2900;
const READY_TIMEOUT_MS = 1400;
const WATCHDOG_MS = 9000;

const vertexSource = `#version 300 es
precision highp float;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uEase;
uniform float uVein;
out vec4 outColor;

vec2 hash22(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}
float gnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(i), f);
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * gnoise(p); p = m * p + vec2(1.7, 9.2); a *= 0.5; }
  return clamp(v * 0.9 + 0.5, 0.0, 1.0);
}
float smin(float a, float b, float k){
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = uTime;
  vec2 q = p * 1.7;

  // Inigo-style domain warping: the ink flows as it spreads.
  vec2 w1 = vec2(fbm(q + vec2(0.0, t * 0.10)), fbm(q + vec2(5.2, 1.3) - vec2(t * 0.08, 0.0)));
  vec2 w2 = vec2(fbm(q + 3.2 * w1 + vec2(1.7, 9.2) + t * 0.06), fbm(q + 3.2 * w1 + vec2(8.3, 2.8) - t * 0.05));
  float f = fbm(q + 3.6 * w2);

  // Ridged noise pulls long tendrils out of the receding boundary.
  float rid = 1.0 - abs(fbm(q * 2.2 + w2 * 2.4 + vec2(t * 0.04, -t * 0.03)) * 2.0 - 1.0);
  rid *= rid;

  // Three uneven spill points that merge into one organic body.
  float d0 = length(p - vec2(0.03 * aspect, 0.04));
  float d1 = length(p - vec2(-0.34 * aspect, 0.30)) + 0.12;
  float d2 = length(p - vec2(0.36 * aspect, -0.27)) + 0.22;
  float d = smin(smin(d0, d1, 0.35), d2, 0.35);

  float field = d + (f - 0.5) * 0.95 + (w2.x - 0.5) * 0.55 - (rid - 0.35) * 0.30;
  float corner = length(vec2(aspect * 0.5, 0.5));
  float R = mix(-0.30, corner + 0.35, uEase);
  float edge = field - R;               // > 0 : ink still covers, < 0 : dark page revealed

  float aa = clamp(fwidth(edge), 0.0006, 0.012);
  float ink = smoothstep(-aa, aa, edge);

  // Stray ink islands that shrink and vanish behind the front.
  float n2 = fbm(q * 3.1 + w1 * 2.0 + 11.0);
  float thr = mix(0.60, 1.10, uEase);
  float island = smoothstep(thr, thr + 0.03, n2) * smoothstep(-0.55, -0.10, edge);
  ink = max(ink, island);

  // Cream palette (#F2EEE5, #F5F3EF, #E9E3D8) with warm marbled veins.
  vec3 cream = vec3(0.949, 0.933, 0.898);
  vec3 ivory = vec3(0.961, 0.953, 0.937);
  vec3 stone = vec3(0.914, 0.890, 0.847);
  vec3 deep  = vec3(0.835, 0.800, 0.735);
  vec3 col = mix(cream, ivory, smoothstep(0.35, 0.78, f));
  col = mix(col, stone, smoothstep(0.42, 0.86, w2.x) * 0.60);
  float vein = 1.0 - smoothstep(0.0, 0.07, abs(sin((f * 4.2 + w2.y * 2.4) * 6.2831853 + t * 0.2)));
  col = mix(col, deep, vein * 0.30 * uVein);

  // Darker ink lip just inside the boundary, and a faint sheen spilling onto the dark side.
  float lip = smoothstep(0.0, 0.005, edge) * (1.0 - smoothstep(0.010, 0.045, edge));
  col = mix(col, vec3(0.70, 0.65, 0.56), lip * 0.38 * uVein);
  float sheen = exp(min(edge, 0.0) / 0.022) * 0.20 * step(edge, 0.0) * (1.0 - ink);

  // Guaranteed clean finish: any last wisps dissolve in the closing stretch.
  float tail = 1.0 - smoothstep(0.86, 1.0, uEase);
  float a = clamp(max(ink, sheen), 0.0, 1.0) * tail;
  outColor = vec4(col * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create ink shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Ink shader compilation failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function buildProgram(gl: WebGL2RenderingContext) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create ink renderer.");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Ink renderer link failed.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

// Near-linear travel with a gentle ease so the reveal fills the whole 2 to 3 seconds.
const easeReveal = (x: number) => x * 0.65 + x * x * (3 - 2 * x) * 0.35;

function pageReady() {
  return new Promise<void>(resolve => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    window.setTimeout(done, READY_TIMEOUT_MS);
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const loaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>(res => window.addEventListener("load", () => res(), { once: true }));
    void Promise.all([fonts, loaded]).then(done, done);
  });
}

export default function BigBStorefront() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>("pending");
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // The opening never reads a saved theme: every visit starts cream and ends dark.
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) { setPhase("done"); return; }

    // /big-bs?intro=debug forces the ink (ignoring reduced motion) and prints which path ran.
    const debug = new URLSearchParams(window.location.search).get("intro") === "debug";
    let banner: HTMLDivElement | null = null;
    const note = (message: string) => {
      document.documentElement.dataset.bigbIntro = message;
      if (!debug) return;
      if (!banner) {
        banner = document.createElement("div");
        banner.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:3000;max-width:90vw;padding:8px 12px;background:#ffde59;color:#171719;font:700 12px/1.4 monospace;border-radius:4px;pointer-events:none";
        document.body.appendChild(banner);
        timers.push(window.setTimeout(() => banner?.remove(), 12000));
      }
      banner.textContent = "intro: " + message;
    };

    let cancelled = false;
    let frame = 0;
    let disposeGl: (() => void) | null = null;
    const timers: number[] = [];

    const finish = () => {
      if (cancelled) return;
      disposeGl?.();
      disposeGl = null;
      setPhase("done");
    };
    const softFade = (ms: number) => {
      if (cancelled) return;
      canvas.style.display = "none";
      overlay.style.background = "#f2eee5";
      overlay.style.transition = `opacity ${ms}ms ease`;
      void overlay.offsetWidth;
      overlay.style.opacity = "0";
      timers.push(window.setTimeout(finish, ms + 60));
    };

    const startInk = () => {
      const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: "high-performance" });
      if (!gl) throw new Error("WebGL2 is unavailable.");
      const program = buildProgram(gl);
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.useProgram(program);
      const uRes = gl.getUniformLocation(program, "uRes");
      const uTime = gl.getUniformLocation(program, "uTime");
      const uEase = gl.getUniformLocation(program, "uEase");
      const uVein = gl.getUniformLocation(program, "uVein");

      const resize = () => {
        const w = Math.max(1, window.innerWidth);
        const h = Math.max(1, window.innerHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const budget = w < 820 ? 650_000 : 1_150_000;
        const scale = Math.min(1, Math.sqrt(budget / (w * h * dpr * dpr)));
        canvas.width = Math.max(2, Math.round(w * dpr * scale));
        canvas.height = Math.max(2, Math.round(h * dpr * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };
      const onLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); note("fallback: webgl context lost"); softFade(700); };
      resize();
      window.addEventListener("resize", resize);
      canvas.addEventListener("webglcontextlost", onLost);

      disposeGl = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("webglcontextlost", onLost);
        if (!gl.isContextLost()) {
          gl.deleteVertexArray(vao);
          gl.deleteProgram(program);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
      };

      let started = 0;
      const draw = (now: number) => {
        if (cancelled) return;
        if (!started) started = now;
        const elapsed = now - started;
        const x = Math.min(1, elapsed / INTRO_MS);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, 1.5 + elapsed / 1000);
        gl.uniform1f(uEase, easeReveal(x));
        gl.uniform1f(uVein, Math.min(1, elapsed / 350));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        // Only hand the background over to the canvas once a full cream frame exists.
        if (overlay.style.background !== "transparent") overlay.style.background = "transparent";
        if (x < 1) frame = requestAnimationFrame(draw);
        else finish();
      };
      note("ink running (webgl2 ok)");
      frame = requestAnimationFrame(draw);
    };

    void pageReady().then(() => {
      if (cancelled) return;
      timers.push(window.setTimeout(() => softFade(500), WATCHDOG_MS));
      if (!debug && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { note("soft fade: reduced motion is on"); softFade(700); return; }
      try { startInk(); }
      catch (error) {
        console.error("BIG B'S opening ink reveal fell back to a soft fade:", error);
        note("fallback: " + (error instanceof Error ? error.message.slice(0, 160) : "unknown error"));
        softFade(900);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      timers.forEach(id => window.clearTimeout(id));
      disposeGl?.();
    };
  }, []);

  // Manual switching is a separate, plain interaction that only exists once the intro is finished.
  const toggleTheme = useCallback(() => {
    if (phase !== "done") return;
    setTheme(current => (current === "dark" ? "light" : "dark"));
  }, [phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key.toLowerCase() !== "t" || event.repeat || event.metaKey || event.ctrlKey || event.altKey || target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName || "")) return;
      toggleTheme();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTheme]);

  const closeMenu = () => setMenuOpen(false);
  return <>
    {phase === "pending" && <div ref={overlayRef} className="bigb-intro" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#f2eee5", pointerEvents: "none" }}><canvas ref={canvasRef} /></div>}
    <noscript><style>{".bigb-intro{display:none!important}"}</style></noscript>
    <main className="bigb-shell" data-theme={theme}>
    <header className="bigb-header">
      <a className="bigb-wordmark" href="#home" aria-label="BIG B'S home"><span className="bigb-mark">B<span>.</span></span><span className="bigb-wordmark-text">BIG B'S EVOLUTION<small>IDEAS · PEOPLE · EVOLUTION</small></span></a>
      <nav className={menuOpen ? "bigb-nav is-open" : "bigb-nav"} aria-label="Main navigation">
        <a href="#about" onClick={closeMenu}>Our story</a><a href="#work" onClick={closeMenu}>What we do</a><a href="#initiatives" onClick={closeMenu}>Initiatives</a><a href="#founder" onClick={closeMenu}>The founder</a>
        <a className="bigb-nav-cta" href="#connect" onClick={closeMenu}>Let's connect </a>
      </nav>
      <div className="bigb-header-actions">
        <button id="bigb-theme-toggle" className="bigb-theme-toggle" type="button" disabled={phase !== "done"} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={theme === "dark"} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="bigb-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
      </div>
    </header>

    <section className="bigb-hero" id="home">
      <div className="bigb-hero-copy">
        <div className="bigb-eyebrow"><span className="bigb-eyebrow-dot"/> A STUDENT-LED BRAND FOR WHAT'S NEXT <span className="bigb-eyebrow-line"/></div>
        <h1>Big ideas.<br/><em>Real people.</em><br/>A better kind<br className="bigb-mobile-break"/> of <span>evolution.</span></h1>
        <p className="bigb-hero-intro">We bring students, ideas and opportunities closer together — creating room for people to learn, build, collaborate and make things happen.</p>
        <div className="bigb-hero-actions"><a className="bigb-button bigb-button-primary" href="#initiatives">Discover the movement </a><a className="bigb-text-link" href="#about">Get to know us </a></div>
        <div className="bigb-hero-meta"><span><i/> STUDENT-DRIVEN</span><span>BUILT AROUND COMMUNITY</span><span>ROOTED IN OOU</span></div>
      </div>
      <div className="bigb-hero-art" aria-label="BIG B'S visual identity">
        <div className="bigb-art-orbit orbit-one"/><div className="bigb-art-orbit orbit-two"/>
        <div className="bigb-art-glow"/>
        <div className="bigb-art-panel"><span className="bigb-panel-kicker">THE NEXT CHAPTER</span><div className="bigb-panel-title">BIG<br/><i>B'S</i></div><span className="bigb-panel-rule"/><p>Ideas become action<br/>when people move together.</p><div className="bigb-panel-stamp">EVOLVE<br/><b>TOGETHER</b></div></div>
        <div className="bigb-floating-note note-top"><Sparkles size={14}/> BUILT WITH PURPOSE</div><div className="bigb-floating-note note-bottom">FROM VOICES TO ACTION </div>
        <div className="bigb-art-index">01 <span>/ 04</span></div>
      </div>
      <a className="bigb-scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><i/></a>
    </section>

    <section className="bigb-statement" id="about"><div className="bigb-section-label"><span>01</span> / WHY BIG B'S EXISTS</div><div className="bigb-statement-content"><h2>There is more in us<br/>when we <em>move together.</em></h2><p>BIG B'S is a growing student-led platform shaped around connection, creativity and practical support. It is a place for students to find people, develop ideas, discover opportunities and turn good intentions into meaningful work.</p><a className="bigb-inline-link" href="#connect">Be part of the next chapter </a></div></section>

    <section className="bigb-work" id="work"><div className="bigb-section-top"><div><div className="bigb-section-label"><span>02</span> / WHAT WE'RE BUILDING</div><h2>Make room for<br/><em>what's possible.</em></h2></div><p>One brand. Many ways to create value. We're building a home for ideas, people and projects that help students move forward.</p></div>
      <div className="bigb-service-grid">
        <article className="bigb-service service-featured"><span className="bigb-service-no">01 / COMMUNITY</span><div className="bigb-service-icon">B<span>+</span></div><h3>Student connection</h3><p>Bringing people together around shared interests, useful conversations and opportunities to collaborate.</p><a href="#initiatives">Explore the community </a><b className="bigb-service-watermark">01</b></article>
        <article className="bigb-service"><span className="bigb-service-no">02 / CREATIVE</span><div className="bigb-service-icon">✳</div><h3>Creative projects</h3><p>A space to develop ideas, tell stories, shape identities and make thoughtful work with other young creatives.</p><a href="#connect">Start a conversation </a><b className="bigb-service-watermark">02</b></article>
        <article className="bigb-service"><span className="bigb-service-no">03 / OPPORTUNITY</span><div className="bigb-service-icon"></div><h3>Skills & opportunity</h3><p>Sharing pathways to learn, grow, find collaborators and take the next practical step.</p><a href="#initiatives">See what's growing </a><b className="bigb-service-watermark">03</b></article>
        <article className="bigb-service"><span className="bigb-service-no">04 / INITIATIVE</span><div className="bigb-service-icon">◎</div><h3>Ideas into action</h3><p>Supporting student-led initiatives that respond to real needs and make participation count.</p><a href="#connect">Bring an idea </a><b className="bigb-service-watermark">04</b></article>
      </div>
    </section>

    <section className="bigb-initiatives" id="initiatives"><div className="bigb-section-label"><span>03</span> / THE BIG B'S WAY</div><div className="bigb-initiative-layout"><div><h2>From voices<br/>to <em>action.</em></h2><p>We believe progress starts when people are heard, included and equipped to do something with their ideas.</p><a className="bigb-button bigb-button-outline" href="#connect">Join the conversation </a></div><div className="bigb-principles"><article><span>01</span><div><h3>Listen first</h3><p>Make space for students to speak, contribute and be taken seriously.</p></div><b></b></article><article><span>02</span><div><h3>Build together</h3><p>Turn individual strengths into shared projects and useful partnerships.</p></div><b></b></article><article><span>03</span><div><h3>Show the work</h3><p>Keep communication open and make progress visible and accountable.</p></div><b></b></article></div></div></section>

    <section className="bigb-founder" id="founder"><div className="bigb-founder-visual"><div className="bigb-founder-frame"><div className="bigb-founder-monogram">LB<span>.</span></div><div className="bigb-founder-photo-note">A FACE BEHIND THE IDEAS</div></div><div className="bigb-founder-caption">THE PERSON<br/><b>BEHIND BIG B'S</b></div></div><div className="bigb-founder-copy"><div className="bigb-section-label"><span>04</span> / THE FOUNDER</div><span className="bigb-founder-kicker">MEET THE PERSON BEHIND THE BRAND</span><h2>Lukan Boluwatife<br/><em>Rita.</em></h2><p className="bigb-founder-role">Founder & student advocate · P.K.A. BIG B</p><p>BIG B'S is led by Lukan Boluwatife Rita, a student building a platform around student connection, representation, creativity and opportunity. Her ambition is simple: help more students find their voice, their people and a practical way to move their ideas forward.</p><div className="bigb-founder-facts"><span><b>01</b> STUDENT-LED</span><span><b>02</b> COMMUNITY-MINDED</span><span><b>03</b> BUILT TO GROW</span></div><a className="bigb-inline-link" href="#connect">Connect with BIG B'S </a></div></section>

    <section className="bigb-cta" id="connect"><div className="bigb-cta-orb"/><div className="bigb-section-label"><span>05</span> / YOUR NEXT STEP</div><h2>Have an idea?<br/><em>Let's make it move.</em></h2><p>Whether you have a project, a question, a skill to share or simply want to connect with other students, there's room to start here.</p><a className="bigb-button bigb-button-primary" href="https://wa.me/?text=Hello%20BIG%20B%27S%2C%20I%27d%20like%20to%20connect." target="_blank" rel="noreferrer">Start a conversation </a></section>

    <footer className="bigb-footer"><a className="bigb-wordmark" href="#home"><span className="bigb-mark">B<span>.</span></span><span className="bigb-wordmark-text">BIG B'S EVOLUTION<small>IDEAS · PEOPLE · EVOLUTION</small></span></a><span className="bigb-footer-line">A STUDENT-LED BRAND BUILT FOR WHAT'S NEXT.</span><div className="bigb-footer-social"><a href="#connect" aria-label="Instagram"><Instagram size={17}/></a><a href="#connect" aria-label="LinkedIn"><Linkedin size={17}/></a></div><div className="bigb-footer-bottom"><span>© {new Date().getFullYear()} BIG B'S EVOLUTION. ALL RIGHTS RESERVED.</span><span>FROM VOICES TO ACTION.</span><a href="https://wa.me/?text=Hello%20BlueHaven%20Studios" target="_blank" rel="noreferrer">POWERED BY BLUEHAVEN STUDIOS </a></div></footer>
    <div className="bigb-ink-hint">PRESS T OR USE THE SUN / MOON TO SWITCH THEME</div>
  </main></>;
}
