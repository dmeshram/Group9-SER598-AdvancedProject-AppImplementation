import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function Forest() {
  return (
    <div className="forest-page">
      <Canvas
        camera={{ position: [10, 8, 10], fov: 45 }}
        dpr={[1, 2]}
        className="forest-canvas"
      >
        <ambientLight intensity={0.7} />
        <directionalLight intensity={1.1} position={[5, 10, 2]} castShadow />

        <Island />
        <TreesOnIsland />

        {/* ground shadow plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.61, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#1a2733" />
        </mesh>

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={14}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}

function Island() {
  const dirtColor = "#5b3b22";
  const grassColor = "#8ee077";

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[6, 1.2, 6]} />
        <meshStandardMaterial color={dirtColor} />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[5.8, 0.1, 5.8]} />
        <meshStandardMaterial color={grassColor} />
      </mesh>
    </group>
  );
}

function Tree({ position = [0, 0, 0], scale = 1 }) {
  const trunkColor = "#7b4a24";
  const leavesColor = "#3cad4b";

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>

      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color={leavesColor} />
      </mesh>

      <mesh position={[0.15, 2.1, -0.05]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color={leavesColor} />
      </mesh>
    </group>
  );
}

function TreesOnIsland() {
  const positions = useMemo(
    () => [
      [-1.8, 0, -1.8],
      [0, 0, -1.7],
      [1.8, 0, -1.8],
      [-2.1, 0, 0],
      [-0.7, 0, 0.4],
      [1.2, 0, 0.2],
      [2.0, 0, 0.6],
      [-1.2, 0, 1.6],
      [0.5, 0, 1.8],
      [2.0, 0, 1.6],
    ],
    []
  );

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {positions.map((pos, idx) => (
        <Tree key={idx} position={[pos[0], 0, pos[2]]} scale={0.9 + (idx % 3) * 0.05} />
      ))}
    </group>
  );
}