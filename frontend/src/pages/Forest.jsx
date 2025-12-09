import React, { useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAuth } from "../auth/AuthContext.jsx";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Tree({ position }) {
  return (
    <group position={position}>
      {/* trunk */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {/* foliage */}
      <mesh position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <group>
      {/* grass top */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.3, 6]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[6.2, 1, 6.2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

function ForestScene({ treeCount }) {
  const treePositions = useMemo(() => {
    const positions = [];
    const radius = 2.3;

    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2;
      const r = radius * (0.4 + 0.6 * Math.random()); // a bit of jitter
      const x = Math.cos(angle) * r * 0.6;
      const z = Math.sin(angle) * r;
      positions.push([x, 0.15, z]);
    }
    return positions;
  }, [treeCount]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <hemisphereLight intensity={0.35} groundColor="#14532d" />

      <Ground />

      {treePositions.map((pos, idx) => (
        <Tree key={idx} position={pos} />
      ))}

      <OrbitControls enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.3} />
    </>
  );
}

export default function Forest() {
  const { token } = useAuth();
  const [treeCount, setTreeCount] = useState(6); // default small grove
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/home/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch summary for forest:", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const fromPoints = Math.floor((data.totalPoints || 0) / 40); // 1 tree / 40 pts
        const fromCo2 = Math.floor((data.co2SavedKg || 0) / 1.5);   // 1 tree / 1.5kg

        let trees = Math.max(fromPoints, fromCo2);
        trees = Math.min(Math.max(trees, 3), 40); // clamp between 3 and 40

        setTreeCount(trees);
      } catch (err) {
        console.error("Error loading forest data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  return (
    <div className="forest-page">
      {loading && (
        <div className="forest-loading-overlay">
          Growing your forest…
        </div>
      )}
      <Canvas
        camera={{ position: [6, 5, 6], fov: 45 }}
        shadows
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ForestScene treeCount={treeCount} />
      </Canvas>
    </div>
  );
}