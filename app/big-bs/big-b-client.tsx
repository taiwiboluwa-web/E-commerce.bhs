"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Instagram, Linkedin, Menu, Moon, Sparkles, Sun, X } from "lucide-react";

type Theme = "dark" | "light";

const vertex = `#version 300 es
precision highp float;
out vec2 vUv;
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p * 0.5;
  gl_Position = vec4(p - 1.0, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uOld;
uniform sampler2D uNew;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0,a=.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+3.7;a*=.5;}
  return v;
}
void main(){
  vec2 uv=vUv;
  vec2 p=(uv-uOrigin)*vec2(uResolution.x/uResolution.y,1.0);
  float n=fbm(uv*7.0+vec2(uTime*.055,-uTime*.035));
  float fibres=fbm(uv*vec2(23.0,17.0)+n*3.2);
  float marbling=sin((fibres*2.0+n*1.8)*19.0+uTime*.35)*.5+.5;
  float radius=uProgress*1.85;
  float edge=length(p)-radius+(n-.5)*.24+(marbling-.5)*.065;
  float front=1.0-smoothstep(-.055,.055,edge);
  float band=exp(-pow(edge/.105,2.0));
  vec3 oldColor=texture(uOld,uv).rgb;
  vec3 newColor=texture(uNew,uv).rgb;
  vec3 ink=mix(vec3(.025,.025,.028),vec3(.93,.93,.91),marbling);
  vec3 color=mix(oldColor,newColor,front);
  color=mix(color,ink,band*.72*(1.0-front*.18));
  float droplets=step(.985,noise(uv*vec2(190.0,130.0)+uTime))*(1.0-smoothstep(0.0,.22,abs(edge)))*.42;
  color=mix(color,ink,droplets);
  outColor=vec4(color,1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create ink shader.");
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Ink shader compilation failed.";
    gl.deleteShader(shader); throw new Error(message);
  }
  return shader;
}

function makeProgram(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create ink renderer.");
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Ink renderer link failed.");
  return program;
}

export default function BigBStorefront() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [inkReady, setInkReady] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bigbs-theme");
    const initial: Theme = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
  }, []);

  const toggleTheme = useCallback(async (event?: { clientX: number; clientY: number }) => {
    if (busy.current) return;
    busy.current = true;
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.dataset.theme = next; document.documentElement.style.colorScheme = next;
      setTheme(next); window.localStorage.setItem("bigbs-theme", next); busy.current = false; return;
    }
    const canvas = canvasRef.current;
    const button = document.getElementById("bigb-theme-toggle");
    const x = event?.clientX ?? (button?.getBoundingClientRect().left ?? window.innerWidth - 54) + 22;
    const y = event?.clientY ?? (button?.getBoundingClientRect().top ?? 20) + 22;
    try {
      const [{ default: html2canvas }, { gsap }] = await Promise.all([import("html2canvas"), import("gsap")]);
      const oldSnapshot = await html2canvas(document.body, { backgroundColor: theme === "dark" ? "#071d13" : "#f7f8f3", scale: Math.min(window.devicePixelRatio || 1, 1.5), useCORS: true, logging: false, width: window.innerWidth, height: window.innerHeight, x: window.scrollX, y: window.scrollY, windowWidth: window.innerWidth, windowHeight: window.innerHeight });
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      setTheme(next);
      window.localStorage.setItem("bigbs-theme", next);
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const newSnapshot = await html2canvas(document.body, { backgroundColor: next === "dark" ? "#071d13" : "#f7f8f3", scale: Math.min(window.devicePixelRatio || 1, 1.5), useCORS: true, logging: false, width: window.innerWidth, height: window.innerHeight, x: window.scrollX, y: window.scrollY, windowWidth: window.innerWidth, windowHeight: window.innerHeight });
      if (!canvas) throw new Error("Ink canvas is unavailable.");
      const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false });
      if (!gl) throw new Error("WebGL2 is unavailable.");
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.style.display = "block";
      const program = makeProgram(gl);
      gl.useProgram(program);
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const textures = [oldSnapshot, newSnapshot].map((source, index) => {
        const texture = gl.createTexture(); gl.activeTexture(index === 0 ? gl.TEXTURE0 : gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.uniform1i(gl.getUniformLocation(program, index === 0 ? "uOld" : "uNew"), index); return texture;
      });
      const origin = gl.getUniformLocation(program, "uOrigin");
      gl.uniform2f(origin, x / window.innerWidth, 1 - y / window.innerHeight);
      gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.width, canvas.height);
      const progress = { value: 0 };
      const started = performance.now();
      const draw = () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, "uProgress"), progress.value);
        gl.uniform1f(gl.getUniformLocation(program, "uTime"), (performance.now() - started) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      draw();
      await new Promise<void>(resolve => gsap.to(progress, { value: 1.45, duration: 2.2, ease: "power3.out", onUpdate: draw, onComplete: resolve }));
      await new Promise<void>(resolve => gsap.to(canvas, { opacity: 0, duration: .15, onComplete: resolve }));
      canvas.style.display = "none"; canvas.style.opacity = "1";
      textures.forEach(texture => gl.deleteTexture(texture)); gl.deleteProgram(program); if (vao) gl.deleteVertexArray(vao);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch (error) {
      document.documentElement.dataset.theme = next; setTheme(next); window.localStorage.setItem("bigbs-theme", next);
      if (canvas) canvas.style.display = "none";
      setInkReady(false);
      window.setTimeout(() => setInkReady(true), 1200);
      console.error("BIG B'S ink transition fallback:", error);
    } finally { busy.current = false; }
  }, [theme]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key.toLowerCase() !== "t" || event.repeat || event.metaKey || event.ctrlKey || event.altKey || target?.isContentEditable || ["INPUT","TEXTAREA","SELECT"].includes(target?.tagName || "")) return;
      void toggleTheme();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTheme]);

  const closeMenu = () => setMenuOpen(false);
  return <main className="bigb-shell">
    <canvas ref={canvasRef} className="bigb-ink-canvas" aria-hidden="true" />
    <header className="bigb-header" data-ink-live>
      <a className="bigb-wordmark" href="#home" aria-label="BIG B'S home"><span className="bigb-mark">B<span>.</span></span><span className="bigb-wordmark-text">BIG B'S<small>IDEAS · PEOPLE · EVOLUTION</small></span></a>
      <nav className={menuOpen ? "bigb-nav is-open" : "bigb-nav"} aria-label="Main navigation">
        <a href="#about" onClick={closeMenu}>Our story</a><a href="#work" onClick={closeMenu}>What we do</a><a href="#initiatives" onClick={closeMenu}>Initiatives</a><a href="#founder" onClick={closeMenu}>The founder</a>
        <a className="bigb-nav-cta" href="#connect" onClick={closeMenu}>Let's connect <ArrowUpRight size={14}/></a>
      </nav>
      <div className="bigb-header-actions">
        <button id="bigb-theme-toggle" className="bigb-theme-toggle" type="button" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={theme === "dark"} onClick={e => void toggleTheme({ clientX: e.clientX || e.currentTarget.getBoundingClientRect().left + 22, clientY: e.clientY || e.currentTarget.getBoundingClientRect().top + 22 })}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="bigb-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
      </div>
    </header>

    <section className="bigb-hero" id="home">
      <div className="bigb-hero-copy">
        <div className="bigb-eyebrow"><span className="bigb-eyebrow-dot"/> A STUDENT-LED BRAND FOR WHAT'S NEXT <span className="bigb-eyebrow-line"/></div>
        <h1>Big ideas.<br/><em>Real people.</em><br/>A better kind<br className="bigb-mobile-break"/> of <span>evolution.</span></h1>
        <p className="bigb-hero-intro">We bring students, ideas and opportunities closer together — creating room for people to learn, build, collaborate and make things happen.</p>
        <div className="bigb-hero-actions"><a className="bigb-button bigb-button-primary" href="#initiatives">Discover the movement <ArrowUpRight size={16}/></a><a className="bigb-text-link" href="#about">Get to know us <ArrowDownRight size={16}/></a></div>
        <div className="bigb-hero-meta"><span><i/> STUDENT-DRIVEN</span><span>BUILT AROUND COMMUNITY</span><span>ROOTED IN OOU</span></div>
      </div>
      <div className="bigb-hero-art" aria-label="BIG B'S visual identity">
        <div className="bigb-art-orbit orbit-one"/><div className="bigb-art-orbit orbit-two"/>
        <div className="bigb-art-glow"/>
        <div className="bigb-art-panel"><span className="bigb-panel-kicker">THE NEXT CHAPTER</span><div className="bigb-panel-title">BIG<br/><i>B'S</i></div><span className="bigb-panel-rule"/><p>Ideas become action<br/>when people move together.</p><div className="bigb-panel-stamp">EVOLVE<br/><b>TOGETHER</b></div></div>
        <div className="bigb-floating-note note-top"><Sparkles size={14}/> BUILT WITH PURPOSE</div><div className="bigb-floating-note note-bottom">FROM VOICES TO ACTION <ArrowUpRight size={13}/></div>
        <div className="bigb-art-index">01 <span>/ 04</span></div>
      </div>
      <a className="bigb-scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><i/></a>
    </section>

    <section className="bigb-statement" id="about"><div className="bigb-section-label"><span>01</span> / WHY BIG B'S EXISTS</div><div className="bigb-statement-content"><h2>There is more in us<br/>when we <em>move together.</em></h2><p>BIG B'S is a growing student-led platform shaped around connection, creativity and practical support. It is a place for students to find people, develop ideas, discover opportunities and turn good intentions into meaningful work.</p><a className="bigb-inline-link" href="#connect">Be part of the next chapter <ArrowUpRight size={15}/></a></div></section>

    <section className="bigb-work" id="work"><div className="bigb-section-top"><div><div className="bigb-section-label"><span>02</span> / WHAT WE'RE BUILDING</div><h2>Make room for<br/><em>what's possible.</em></h2></div><p>One brand. Many ways to create value. We're building a home for ideas, people and projects that help students move forward.</p></div>
      <div className="bigb-service-grid">
        <article className="bigb-service service-featured"><span className="bigb-service-no">01 / COMMUNITY</span><div className="bigb-service-icon">B<span>+</span></div><h3>Student connection</h3><p>Bringing people together around shared interests, useful conversations and opportunities to collaborate.</p><a href="#initiatives">Explore the community <ArrowUpRight size={14}/></a><b className="bigb-service-watermark">01</b></article>
        <article className="bigb-service"><span className="bigb-service-no">02 / CREATIVE</span><div className="bigb-service-icon">✳</div><h3>Creative projects</h3><p>A space to develop ideas, tell stories, shape identities and make thoughtful work with other young creatives.</p><a href="#connect">Start a conversation <ArrowUpRight size={14}/></a><b className="bigb-service-watermark">02</b></article>
        <article className="bigb-service"><span className="bigb-service-no">03 / OPPORTUNITY</span><div className="bigb-service-icon">↗</div><h3>Skills & opportunity</h3><p>Sharing pathways to learn, grow, find collaborators and take the next practical step.</p><a href="#initiatives">See what's growing <ArrowUpRight size={14}/></a><b className="bigb-service-watermark">03</b></article>
        <article className="bigb-service"><span className="bigb-service-no">04 / INITIATIVE</span><div className="bigb-service-icon">◎</div><h3>Ideas into action</h3><p>Supporting student-led initiatives that respond to real needs and make participation count.</p><a href="#connect">Bring an idea <ArrowUpRight size={14}/></a><b className="bigb-service-watermark">04</b></article>
      </div>
    </section>

    <section className="bigb-initiatives" id="initiatives"><div className="bigb-section-label"><span>03</span> / THE BIG B'S WAY</div><div className="bigb-initiative-layout"><div><h2>From voices<br/>to <em>action.</em></h2><p>We believe progress starts when people are heard, included and equipped to do something with their ideas.</p><a className="bigb-button bigb-button-outline" href="#connect">Join the conversation <ArrowRight size={15}/></a></div><div className="bigb-principles"><article><span>01</span><div><h3>Listen first</h3><p>Make space for students to speak, contribute and be taken seriously.</p></div><b>↗</b></article><article><span>02</span><div><h3>Build together</h3><p>Turn individual strengths into shared projects and useful partnerships.</p></div><b>↗</b></article><article><span>03</span><div><h3>Show the work</h3><p>Keep communication open and make progress visible and accountable.</p></div><b>↗</b></article></div></div></section>

    <section className="bigb-founder" id="founder"><div className="bigb-founder-visual"><div className="bigb-founder-frame"><div className="bigb-founder-monogram">LB<span>.</span></div><div className="bigb-founder-photo-note">A FACE BEHIND THE IDEAS</div></div><div className="bigb-founder-caption">THE PERSON<br/><b>BEHIND BIG B'S</b></div></div><div className="bigb-founder-copy"><div className="bigb-section-label"><span>04</span> / THE FOUNDER</div><span className="bigb-founder-kicker">MEET THE PERSON BEHIND THE BRAND</span><h2>Lukan Boluwatife<br/><em>Rita.</em></h2><p className="bigb-founder-role">Founder & student advocate · P.K.A. BIG B</p><p>BIG B'S is led by Lukan Boluwatife Rita, a student building a platform around student connection, representation, creativity and opportunity. Her ambition is simple: help more students find their voice, their people and a practical way to move their ideas forward.</p><div className="bigb-founder-facts"><span><b>01</b> STUDENT-LED</span><span><b>02</b> COMMUNITY-MINDED</span><span><b>03</b> BUILT TO GROW</span></div><a className="bigb-inline-link" href="#connect">Connect with BIG B'S <ArrowUpRight size={15}/></a></div></section>

    <section className="bigb-cta" id="connect"><div className="bigb-cta-orb"/><div className="bigb-section-label"><span>05</span> / YOUR NEXT STEP</div><h2>Have an idea?<br/><em>Let's make it move.</em></h2><p>Whether you have a project, a question, a skill to share or simply want to connect with other students, there's room to start here.</p><a className="bigb-button bigb-button-primary" href="https://wa.me/?text=Hello%20BIG%20B%27S%2C%20I%27d%20like%20to%20connect." target="_blank" rel="noreferrer">Start a conversation <ArrowUpRight size={16}/></a></section>

    <footer className="bigb-footer"><a className="bigb-wordmark" href="#home"><span className="bigb-mark">B<span>.</span></span><span className="bigb-wordmark-text">BIG B'S<small>IDEAS · PEOPLE · EVOLUTION</small></span></a><span className="bigb-footer-line">A STUDENT-LED BRAND BUILT FOR WHAT'S NEXT.</span><div className="bigb-footer-social"><a href="#connect" aria-label="Instagram"><Instagram size={17}/></a><a href="#connect" aria-label="LinkedIn"><Linkedin size={17}/></a></div><div className="bigb-footer-bottom"><span>© {new Date().getFullYear()} BIG B'S. ALL RIGHTS RESERVED.</span><span>FROM VOICES TO ACTION.</span><a href="https://wa.me/?text=Hello%20BlueHaven%20Studios" target="_blank" rel="noreferrer">POWERED BY BLUEHAVEN STUDIOS <ArrowUpRight size={12}/></a></div></footer>
    <div className={inkReady ? "bigb-ink-hint" : "bigb-ink-hint is-visible"}>PRESS T OR USE THE SUN / MOON TO SWITCH THEME</div>
  </main>;
}
