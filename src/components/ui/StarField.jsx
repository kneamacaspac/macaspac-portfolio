import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Studio Lumen — animated hero section
 * -------------------------------------------------------------
 * Converted from a static HTML/CSS/JS page into a single React
 * component. Two canvases are layered:
 *   1. #shader-bg  — raw WebGL fragment shader (liquid/noise bg)
 *   2. #stars-bg   — Three.js particle "flying through dust" field
 * Both are driven by refs + useEffect so they mount/unmount
 * cleanly with the component's lifecycle (listeners + RAF loops
 * are torn down on unmount).
 */

const PALETTE = {
  deepBlack: "#05030D",

  textLo: "rgba(243,241,250,0.62)",
};

export default function StarField() {
  const shaderCanvasRef = useRef(null);
  const starsCanvasRef = useRef(null);

  // ---------------------------------------------------------
  // Effect 1: raw WebGL liquid/noise shader background
  // ---------------------------------------------------------
  useEffect(() => {
    const canvas = shaderCanvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      canvas.style.background = PALETTE.deepBlack;
      return;
    }

    function resize() {
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
      canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    const vertSrc = `
      attribute vec2 aPos;
      void main(){ gl_Position = vec4(aPos,0.0,1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform vec2 uRes;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;

      const vec3 cDeepBlack = vec3(0.0196, 0.0118, 0.0510);
      const vec3 cDarkPurple = vec3(0.0627, 0.0392, 0.1451);
      const vec3 cPurple    = vec3(0.1412, 0.0627, 0.3020);
      const vec3 cViolet    = vec3(0.2471, 0.2000, 0.5059);
      const vec3 cBlue      = vec3(0.1569, 0.4078, 0.7765);
      const vec3 cLightBlue = vec3(0.5686, 0.8235, 0.9569);

      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0,0.5,1.0,2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      float fbm(vec3 p){
        float total = 0.0;
        float amp = 0.5;
        for(int i=0;i<5;i++){
          total += snoise(p) * amp;
          p *= 2.02;
          amp *= 0.52;
        }
        return total;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / uRes.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= uRes.x / uRes.y;

        float t = uTime * 0.045;

        vec3 pos = vec3(p * 1.3, t);
        vec2 q = vec2( fbm(pos + vec3(0.0,0.0,0.0)),
                       fbm(pos + vec3(5.2,1.3,1.0)) );

        vec2 r = vec2( fbm(pos + 3.5*vec3(q, 0.0) + vec3(1.7,9.2,t*0.6)),
                       fbm(pos + 3.5*vec3(q, 0.0) + vec3(8.3,2.8,t*0.4)) );

        float pattern = fbm(pos + 3.2*vec3(r, 0.0));
        pattern = pattern * 0.5 + 0.5;

        float ang = uTime * 0.03;
        float rotN = fbm(vec3(p.x*cos(ang)-p.y*sin(ang), p.x*sin(ang)+p.y*cos(ang), t*0.5) * 0.8);
        pattern = mix(pattern, pattern + rotN*0.18, 0.6);

        vec2 mp = uMouse; mp.x *= uRes.x/uRes.y;
        vec2 pm = p - mp;
        float dist = length(pm);
        float ripple = sin(dist * 26.0 - uTime * 3.2) * exp(-dist * 3.4);
        float rippleGlow = exp(-dist * 5.5);
        pattern += ripple * 0.16 * uMouseStrength;

        vec3 col = cDeepBlack;
        col = mix(col, cDarkPurple, smoothstep(0.05, 0.32, pattern));
        col = mix(col, cPurple,     smoothstep(0.28, 0.5, pattern));
        col = mix(col, cViolet,     smoothstep(0.48, 0.68, pattern));
        col = mix(col, cBlue,       smoothstep(0.66, 0.86, pattern) * 0.55);
        col = mix(col, cLightBlue,  smoothstep(0.86, 1.05, pattern) * 0.28);

        col += cLightBlue * rippleGlow * 0.10 * uMouseStrength;
        col += cBlue * max(ripple,0.0) * 0.10 * uMouseStrength;

        float vig = smoothstep(1.35, 0.15, length(p * vec2(0.75,1.0)));
        col *= mix(0.55, 1.05, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uMouseStrength = gl.getUniformLocation(prog, "uMouseStrength");

    let mouseX = 0.5,
      mouseY = 0.5;
    let lastMoveTime = performance.now();

    function onMouseMove(e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
      lastMoveTime = performance.now();
    }
    function onTouchMove(e) {
      if (e.touches.length) {
        mouseX = e.touches[0].clientX / window.innerWidth;
        mouseY = 1.0 - e.touches[0].clientY / window.innerHeight;
        lastMoveTime = performance.now();
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const start = performance.now();
    let rafId;

    function render() {
      const now = performance.now();
      const elapsed = (now - start) / 1000.0;
      const sinceMove = (now - lastMoveTime) / 1000.0;
      const strength = Math.max(0.0, Math.exp(-sinceMove * 0.9));

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uMouseStrength, strength);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ---------------------------------------------------------
  // Effect 2: Three.js particle / dust field
  // ---------------------------------------------------------
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      60,
    );
    camera.position.z = 8;

    const COUNT = 1400;
    const simPositions = new Float32Array(COUNT * 3);
    const renderPositions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    const colorChoice = new Float32Array(COUNT);

    const swirlRadius = new Float32Array(COUNT);
    const swirlAngleOffset = new Float32Array(COUNT);
    const swirlSpeed = new Float32Array(COUNT);
    const swirlTilt = new Float32Array(COUNT);

    const palette = [
      new THREE.Color(0xcc00ff),
      new THREE.Color(0x9900cc),
      new THREE.Color(0x3f3381),
      new THREE.Color(0xffffff),
    ];

    function respawn(i, initial) {
      simPositions[i * 3 + 0] = (Math.random() * 2 - 1) * 9;
      simPositions[i * 3 + 1] = (Math.random() * 2 - 1) * 5.5;
      simPositions[i * 3 + 2] = initial ? (Math.random() * 2 - 1) * 14 : -14;
      speeds[i] = 0.2 + Math.random() * 0.8;
      sizes[i] = Math.random() * 0.5 + 0.1;
      colorChoice[i] = Math.floor(Math.random() * palette.length);

      swirlRadius[i] = 0.5 + Math.random() * 2.2;
      swirlAngleOffset[i] = Math.random() * Math.PI * 2;
      swirlSpeed[i] = 0.3 + Math.random() * 0.7;
      swirlTilt[i] = 0.4 + Math.random() * 0.5;
    }
    for (let i = 0; i < COUNT; i++) respawn(i, true);
    renderPositions.set(simPositions);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(renderPositions, 3));

    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const c = palette[colorChoice[i]];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute(
      "aSize",
      new THREE.BufferAttribute(new Float32Array(sizes), 1),
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        void main(){
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (140.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main(){
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          float glow = smoothstep(0.5, 0.0, d);
          glow = pow(glow, 1.6);
          gl_FragColor = vec4(vColor * glow, glow);
        }
      `,
    });

    const points = new THREE.Points(geo, material);
    scene.add(points);

    let mouseNX = 0,
      mouseNY = 0;

    function onMouseMove(e) {
      mouseNX = (e.clientX / window.innerWidth) * 5 - 1;
      mouseNY = -((e.clientY / window.innerHeight) * 5 - 1);
    }
    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    let last = performance.now();
    const start = last;
    let rafId;

    const _ndc = new THREE.Vector3();
    function screenToWorld(x, y, depthZ) {
      const ndcX = (x / window.innerWidth) * 2 - 1;
      const ndcY = -(y / window.innerHeight) * 2 + 1;
      _ndc.set(ndcX, ndcY, 0.5).unproject(camera);
      const dir = _ndc.sub(camera.position).normalize();
      const distance = (depthZ - camera.position.z) / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    }

    function clamp01(v) {
      return Math.max(0, Math.min(1, v));
    }
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animate() {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      const elapsed = (now - start) / 1000;
      last = now;

      for (let i = 0; i < COUNT; i++) {
        let z = simPositions[i * 3 + 2];
        z += speeds[i] * dt * 4.0;
        if (z > 8) {
          respawn(i, false);
        } else {
          simPositions[i * 3 + 2] = z;
        }
      }

      let targetWorld = null;
      let progress = 0;
      const targetEl = document.querySelector("[data-star-target]");
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          targetWorld = screenToWorld(cx, cy, 0);
          const vh = window.innerHeight;
          const dist = Math.abs(cy - vh / 2);
          progress = clamp01(1 - dist / (vh * 0.9));
        }
      }

      for (let i = 0; i < COUNT; i++) {
        let px = simPositions[i * 3 + 0];
        let py = simPositions[i * 3 + 1];
        let pz = simPositions[i * 3 + 2];

        if (targetWorld && progress > 0.001) {
          const angle = swirlAngleOffset[i] + elapsed * swirlSpeed[i];
          const r = swirlRadius[i];
          const sx = targetWorld.x + Math.cos(angle) * r;
          const sy = targetWorld.y + Math.sin(angle) * r * swirlTilt[i];
          const sz = targetWorld.z + Math.sin(angle * 0.7) * r * 0.3;

          px = lerp(px, sx, progress);
          py = lerp(py, sy, progress);
          pz = lerp(pz, sz, progress);
        }

        renderPositions[i * 3 + 0] = px;
        renderPositions[i * 3 + 1] = py;
        renderPositions[i * 3 + 2] = pz;
      }
      geo.attributes.position.needsUpdate = true;

      camera.position.x += (mouseNX * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (mouseNY * 0.35 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: PALETTE.deepBlack,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
        .sl-h1 em{
          font-style:italic; font-weight:400;
          background: linear-gradient(90deg, ${PALETTE.lightBlue}, ${PALETTE.violet} 70%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .sl-btn{ transition: all .35s ease; }
        .sl-btn:hover{ transform: translateY(-2px); border-color: ${PALETTE.lightBlue}; }
        .sl-btn.solid:hover{ box-shadow: 0 12px 34px -6px rgba(40,104,198,0.75); }
        @keyframes slScrollPulse{ 0%,100%{opacity:0.2;} 50%{opacity:0.9;} }
        @media (max-width:760px){
          .sl-desc{ position:static !important; margin-top:28px !important; max-width:100% !important; }
          .sl-header{ padding:24px !important; }
          .sl-main{ padding:0 24px !important; justify-content:flex-start !important; padding-top:120px !important; }
        }
      `}</style>

      <canvas
        ref={shaderCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 0,
        }}
      />
      <canvas
        ref={starsCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
