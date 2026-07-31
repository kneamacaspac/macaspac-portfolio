import { Suspense, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * <MagicCrystal /> - a drop-in, self-contained, interactive 3D crystal.
 *
 * Usage:
 *   import MagicCrystal from "./MagicCrystal";
 *   <MagicCrystal scale={0.5} style={{ width: 400, height: 400 }} />
 *
 * Requires:
 *   npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 * Expected file layout (matches your GLTF export):
 *   /public/assets/3d-assets/enchanted_crystal/scene.gltf
 *   /public/assets/3d-assets/enchanted_crystal/scene.bin
 *   /public/assets/3d-assets/enchanted_crystal/textures/*.png
 *
 * Behavior:
 *   - Auto-rotates slowly when idle
 *   - Glows brighter on hover (real emissiveIntensity, not a CSS trick)
 *   - Tilts subtly toward the cursor while hovering (parallax feel)
 *   - Click-and-drag to spin it manually (auto-rotate pauses while dragging,
 *     resumes automatically after you let go)
 */

const DEFAULT_MODEL_PATH = "/assets/3d-assets/enchanted_crystal/scene.gltf";

function CrystalModel({
  modelPath,
  autoRotateSpeed,
  baseIntensity,
  hoverIntensity,
  scale,
}) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smoothed glow intensity (eases in/out instead of snapping).
  const glow = useRef(baseIntensity);

  // Cursor-driven tilt target, in radians.
  const tiltTarget = useRef({ x: 0, y: 0 });

  // Drag-to-rotate state.
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const dragRotation = useRef({ x: 0, y: 0 });

  // Clone the scene once so multiple <MagicCrystal /> instances on the same
  // page don't share (and fight over) the same material instance.
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        // Make sure three.js reads KHR_materials_emissive_strength correctly.
        child.material.toneMapped = false;
      }
    });
    return clone;
  }, [scene]);

  const handlePointerMove = useCallback((e) => {
    if (dragging.current) {
      // Rotate based on how far the pointer has moved since last frame.
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      dragRotation.current.y += dx * 0.01;
      dragRotation.current.x += dy * 0.01;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    } else {
      // Convert pointer position within the mesh (-1 to 1) into a subtle tilt.
      tiltTarget.current = {
        x: THREE.MathUtils.clamp(e.pointer.y, -1, 1) * -0.3,
        y: THREE.MathUtils.clamp(e.pointer.x, -1, 1) * 0.3,
      };
    }
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      dragging.current = false;
      document.body.style.cursor = hovered ? "grab" : "auto";
    },
    [hovered],
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (dragging.current) {
        // While dragging, the user is fully in control of rotation.
        groupRef.current.rotation.y = dragRotation.current.y;
        groupRef.current.rotation.x = THREE.MathUtils.clamp(
          dragRotation.current.x,
          -0.8,
          0.8,
        );
      } else {
        // Idle: keep auto-rotating on Y, ease X/Z toward the cursor tilt.
        dragRotation.current.y += delta * autoRotateSpeed;
        groupRef.current.rotation.y = dragRotation.current.y;
        groupRef.current.rotation.x = THREE.MathUtils.damp(
          groupRef.current.rotation.x,
          tiltTarget.current.x,
          4,
          delta,
        );
        groupRef.current.rotation.z = THREE.MathUtils.damp(
          groupRef.current.rotation.z,
          tiltTarget.current.y,
          4,
          delta,
        );
      }
    }

    // Smoothly interpolate emissive intensity toward the hover target.
    const target = hovered ? hoverIntensity : baseIntensity;
    glow.current = THREE.MathUtils.damp(glow.current, target, 6, delta);

    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissiveIntensity = glow.current;
      }
    });
  });

  return (
    <group
      ref={groupRef}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "grab";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        tiltTarget.current = { x: 0, y: 0 };
        if (!dragging.current) document.body.style.cursor = "auto";
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <primitive object={cloned} />
    </group>
  );
}

export default function MagicCrystal({
  modelPath = DEFAULT_MODEL_PATH,
  autoRotateSpeed = 0.6,
  baseIntensity = 2.5,
  hoverIntensity = 6,
  bloomIntensity = 1.4,
  scale = 50,
  style,
  className,
}) {
  return (
    <div
      className={className}
      style={{
        width: "50%",
        height: "100%",
        minHeight: 300,
        cursor: "pointer",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={0.8} />

        <Suspense fallback={null}>
          <CrystalModel
            modelPath={modelPath}
            autoRotateSpeed={autoRotateSpeed}
            baseIntensity={baseIntensity}
            hoverIntensity={hoverIntensity}
            scale={scale}
          />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

// Preload so the model starts fetching as soon as the module is imported,
// instead of waiting for first render.
useGLTF.preload(DEFAULT_MODEL_PATH);
