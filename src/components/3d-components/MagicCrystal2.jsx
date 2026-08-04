import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { useInView } from "react-intersection-observer";
import { useFrame } from "@react-three/fiber";

/**
 * <EnchantedCrystal /> — a self-contained, glowing 3D crystal viewer.
 *
 * Usage:
 *   <EnchantedCrystal modelUrl="/scene.gltf" />
 *
 * Put scene.gltf, scene.bin, and the texture PNGs in your `public/` folder
 * (Vite serves anything in `public/` from the site root), then point
 * `modelUrl` at wherever you placed scene.gltf.
 */
export default function MagicCrystal({
  modelUrl = "/assets/3d-assets/enchanted_crystal/scene.gltf",
  className = "",
}) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingText, setLoadingText] = useState("Summoning the crystal…");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const inViewRef = useRef(inView);
  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let disposed = false;

    /* ---------------------------------------------------------
       Scene setup
    --------------------------------------------------------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0912, 0.045);

    const getStageSize = () => {
      const rect = stage.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };
    let { width: stageWidth, height: stageHeight } = getStageSize();

    const camera = new THREE.PerspectiveCamera(
      45,
      stageWidth / stageHeight,
      0.1,
      100,
    );
    camera.position.set(4.5, 1.5, 12);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(stageWidth, stageHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* ---------------------------------------------------------
       Glow — bloom post-processing (the halo around the crystal)
    --------------------------------------------------------- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(stageWidth, stageHeight),
      0.85, // strength — baseline glow amount
      0.75, // radius — how far the glow spreads
      0.2, // threshold — how bright a pixel must be before it blooms
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const BLOOM_BASE = 0.25;
    const BLOOM_HOVER = 0.5;
    let bloomTarget = BLOOM_BASE;

    /* ---------------------------------------------------------
       Lighting — moody, single key light + rim + fill
    --------------------------------------------------------- */
    const keyLight = new THREE.SpotLight(
      0x8b6cff,
      60,
      20,
      Math.PI / 6,
      0.4,
      1.2,
    );
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x4fe8d8, 25, 15);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    const fillLight = new THREE.AmbientLight(0x2a2440, 0.6);
    scene.add(fillLight);

    /* ---------------------------------------------------------
       Controls
    --------------------------------------------------------- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false; // scroll should scroll the page, not zoom the crystal
    controls.minDistance = 2.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.5, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;

    /* ---------------------------------------------------------
       Load the crystal
    --------------------------------------------------------- */
    let crystal = null;
    let crystalMaterials = [];

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        crystal = gltf.scene;
        crystal.scale.set(60, 60, 60);

        crystal.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            if (child.material) {
              crystalMaterials.push(child.material);
              // remember the model's original emissive strength so hover/charge
              // can boost it and always relax back to the true baseline
              child.material.userData.baseEmissiveIntensity =
                child.material.emissiveIntensity ?? 1;
            }
          }
        });

        scene.add(crystal);
        setLoaded(true);
      },
      (progress) => {
        if (disposed || !progress.total) return;
        const pct = Math.round((progress.loaded / progress.total) * 100);
        setLoadingText(`Summoning the crystal… ${pct}%`);
      },
      (error) => {
        if (disposed) return;
        console.error(`Failed to load ${modelUrl}:`, error);
        setLoadingText("The relic did not manifest — check the model path");
        setFailed(true);
      },
    );

    /* ---------------------------------------------------------
       Interaction — click the crystal to "charge" it
    --------------------------------------------------------- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let charge = 0; // 0..1
    let chargeTarget = 0;
    let chargeTimeout = null;

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const targets = crystal ? [crystal] : [];
      const hits = raycaster.intersectObjects(targets, true);
      if (hits.length > 0) {
        chargeTarget = 1;
        keyLight.intensity = 110;
        rimLight.intensity = 55;
        chargeTimeout = setTimeout(() => {
          chargeTarget = 0;
        }, 220);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    /* ---------------------------------------------------------
       Interaction — hover to glow brighter
    --------------------------------------------------------- */
    let isHovering = false;

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const targets = crystal ? [crystal] : [];
      const hits = raycaster.intersectObjects(targets, true);

      isHovering = hits.length > 0;
      bloomTarget = isHovering ? BLOOM_HOVER : BLOOM_BASE;
      renderer.domElement.style.cursor = isHovering ? "pointer" : "grab";
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    /* ---------------------------------------------------------
       Resize — observe the stage element instead of the window,
       so this behaves correctly no matter where it's dropped in
       the page.
    --------------------------------------------------------- */
    const resizeObserver = new ResizeObserver(() => {
      const size = getStageSize();
      if (size.width === 0 || size.height === 0) return;
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
      composer.setSize(size.width, size.height);
      bloomPass.setSize(size.width, size.height);
    });
    resizeObserver.observe(stage);

    /* ---------------------------------------------------------
       Animation loop
    --------------------------------------------------------- */
    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (!inViewRef.current) return;

      // charge decay (glow pulse settles back down)
      charge += (chargeTarget - charge) * 0.1;
      keyLight.intensity += (60 - keyLight.intensity) * 0.03;
      rimLight.intensity += (25 - rimLight.intensity) * 0.03;

      // glow — bloom halo eases toward hover/base target
      bloomPass.strength += (bloomTarget - bloomPass.strength) * 0.08;

      // glow — the crystal's own emissive material brightens on hover too,
      // on top of whatever charge pulse is happening from a click
      const hoverBoost = isHovering ? 1.6 : 1;
      const chargeBoost = 1 + charge * 1.2;
      for (const mat of crystalMaterials) {
        const base = mat.userData.baseEmissiveIntensity ?? 1;
        const targetIntensity = base * hoverBoost * chargeBoost;
        mat.emissiveIntensity +=
          (targetIntensity - mat.emissiveIntensity) * 0.12;
      }

      if (crystal) {
        crystal.rotation.y += dt * 0.02; // subtle idle spin beyond orbit auto-rotate
      }

      controls.update();
      composer.render();
    };

    animate();

    /* ---------------------------------------------------------
       Cleanup — vital in React since effects can re-run
       (StrictMode double-invokes in dev) and components unmount.
    --------------------------------------------------------- */
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      if (chargeTimeout) clearTimeout(chargeTimeout);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      controls.dispose();

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m?.dispose());
        }
      });

      composer.dispose();
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div
      ref={(node) => {
        stageRef.current = node;
        ref(node);
      }}
      className={`crystal-stage ${className}`}
    >
      <canvas ref={canvasRef} className="crystal-canvas" />

      {!loaded && (
        <div className={`crystal-loading ${failed ? "crystal-failed" : ""}`}>
          <div className="crystal-rune" />
          <p className="crystal-loading-text">{loadingText}</p>
        </div>
      )}

      <style>{`
        .crystal-stage {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: transparent;
          /* UnrealBloomPass forces the canvas to render fully opaque, so we
             fade the edges out with a mask instead of relying on true alpha —
             this hides the rectangle and lets the glow taper off softly
             rather than getting clipped at the box's edge. */
          -webkit-mask-image: radial-gradient(
            circle at center,
            black 42%,
            transparent 72%
          );
          mask-image: radial-gradient(
            circle at center,
            black 42%,
            transparent 72%
          );
        }

        .crystal-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          touch-action: none;
          cursor: grab;
        }
        .crystal-canvas:active {
          cursor: grabbing;
        }

        .crystal-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          background: radial-gradient(ellipse at center, #16132a 0%, #0a0912 70%);
          z-index: 50;
          transition: opacity 0.6s ease;
        }

        .crystal-rune {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #8b6cff;
          border-right-color: #4fe8d8;
          animation: crystal-spin 1.1s linear infinite;
        }
        .crystal-failed .crystal-rune {
          animation-play-state: paused;
        }

        @keyframes crystal-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .crystal-loading-text {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: #8e88a8;
          text-transform: uppercase;
          text-align: center;
          padding: 0 24px;
        }

        @media (prefers-reduced-motion: reduce) {
          .crystal-rune {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
