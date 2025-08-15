"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Bounds, Center, Sky } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";

type ArchitectModelProps = {
  modelPath?: string;
  onComputedBounds?: (info: { radius: number; height: number }) => void;
};

function withBasePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!basePath || basePath === "/") return path;
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function ArchitectModel({ modelPath = withBasePath("/models/scene.glb"), onComputedBounds }: ArchitectModelProps) {
  const gltf = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    gltf.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) {
          material.forEach((m) => {
            if ((m as THREE.MeshStandardMaterial).envMapIntensity !== undefined) {
              (m as THREE.MeshStandardMaterial).envMapIntensity = 0.9;
            }
          });
        } else if (material && (material as THREE.MeshStandardMaterial).envMapIntensity !== undefined) {
          (material as THREE.MeshStandardMaterial).envMapIntensity = 0.9;
        }
      }
    });
  }, [gltf.scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    // Ensure world matrices are up to date before measuring bounds
    gltf.scene.updateWorldMatrix(true, true);
    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    // Center X/Z and place bottom (min.y) on y=0 floor
    groupRef.current.position.set(-center.x, -bbox.min.y, -center.z);

    // Compute a radius for framing/controls
    const sphere = new THREE.Sphere();
    bbox.getBoundingSphere(sphere);
    const height = bbox.max.y - bbox.min.y;
    onComputedBounds?.({ radius: sphere.radius, height });
  }, [gltf.scene]);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

useGLTF.preload(withBasePath("/models/scene.glb"));

export default function ArchitectScene() {
  const controlsRef = useRef<any>(null);
  const [fitDistance, setFitDistance] = useState<number | null>(null);
  const [modelHeight, setModelHeight] = useState<number>(0);

  const handleBounds = ({ radius, height }: { radius: number; height: number }) => {
    // Approx fit distance for fov=40deg: r / tan(20deg) ~= 2.75r
    const dist = Math.max(1, radius * 2.8);
    setFitDistance(dist);
    setModelHeight(height);
    // Center orbit target vertically to model mid-height
    if (controlsRef.current) {
      controlsRef.current.target.set(0, height * 0.5, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [6, 5, 6], fov: 40, near: 0.1, far: 200 }}
      >
        <color attach="background" args={["#e9ecef"]} />
        {/* Fog to make background feel infinite */}
        <fog attach="fog" args={["#e9ecef", 20, 150]} />

        {/* Noon-like sun with shadows */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0003}
        />
        <Sky sunPosition={[10, 20, 10]} turbidity={4} rayleigh={2} mieCoefficient={0.005} mieDirectionalG={0.8} />

        {/* Ground plane to catch shadows */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#e9ecef" roughness={1} metalness={0} />
        </mesh>

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <ArchitectModel onComputedBounds={handleBounds} />
          </Bounds>
        </Suspense>

        {/* Postprocessing depth of field */}
        <EffectComposer>
          <DepthOfField focusDistance={0.02} focalLength={0.02} bokehScale={1.8} />
        </EffectComposer>

        {/* Orbit controls: restrict underside view and zoom out distance */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={fitDistance ? fitDistance * 0.2 : 1}
          maxDistance={fitDistance ? fitDistance * 0.25 : 1.25}
        />
      </Canvas>
    </div>
  );
}


