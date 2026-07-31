// src/components/3d/MagicCrystal.jsx
import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * The crystal mesh itself — loads the GLTF, auto-rotates,
 * and pulses its emissive glow up on hover.
 */
function CrystalModel(props) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // useGLTF caches the load, so multiple <MagicCrystal /> instances
  // on the page won't re-fetch the file each time.
  const { scene } = useGLTF("./assets/3d-assets/enchanted_crystal/scene.gltf");

  // Give every mesh in the model an emissive glow, since most
  // exported GLTF materials default to emissiveIntensity: 0.
  // We clone the material so we don't mutate the cached/shared one.
  useState(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        if (!child.material.emissive) {
          child.material.emissive = new THREE.Color("#a855f7");
        } else {
          child.material.emissive.set("#a855f7"); // violet glow — change to taste
        }
        child.material.emissiveIntensity = 0.6;
      }
    });
  });

  // Auto-rotate every frame, and smoothly ramp the glow up/down on hover
  // rather than snapping, so it feels alive instead of a hard on/off toggle.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4; // rotation speed
    }
    scene.traverse((child) => {
      if (child.isMesh) {
        const target = hovered ? 2.2 : 0.6; // brighter glow on hover
        child.material.emissiveIntensity = THREE.MathUtils.lerp(
          child.material.emissiveIntensity,
          target,
          delta * 4, // ramp speed
        );
      }
    });
  });

  return (
    <group
      ref={groupRef}
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <primitive object={scene} />
    </group>
  );
}

/**
 * Drop this anywhere: <MagicCrystal className="w-64 h-64" />
 * It sizes itself to its parent container.
 */
export default function MagicCrystal({ className = "w-64 h-64" }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ alpha: true }} // transparent background so it drops onto any page bg
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.2} />

        <Suspense fallback={null}>
          <CrystalModel scale={1} />
          <Environment preset="night" />
        </Suspense>

        {/* Bloom is what actually makes the emissive glow "bleed" visually,
            rather than just being a bright flat color on the material. */}
        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

// Preload so the model starts fetching as soon as the JS bundle runs,
// instead of waiting until the component actually mounts.
useGLTF.preload("./assets/3d-assets/enchanted_crystal/scene.gltf");
