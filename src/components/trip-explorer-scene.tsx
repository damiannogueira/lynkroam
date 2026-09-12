"use client";

import { Canvas } from "@react-three/fiber";

export type TripExplorerDestinationId = "barcelona" | "lisbon" | "tokyo";

type TripExplorerSceneProps = {
  destination: TripExplorerDestinationId;
};

function Stage() {
  return (
    <>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[3.45, 3.75, 0.35, 32]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.88} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[3.8, 3.8, 0.08, 32]} />
        <meshStandardMaterial color="#ddd8ce" roughness={1} />
      </mesh>
    </>
  );
}

function BarcelonaScene() {
  return (
    <group rotation={[0, -0.18, 0]}>
      <mesh position={[-1.45, -0.2, -0.25]}>
        <boxGeometry args={[1.15, 1.75, 1.1]} />
        <meshStandardMaterial color="#c96f52" roughness={0.78} />
      </mesh>
      <mesh position={[1.35, 0.05, -0.45]}>
        <boxGeometry args={[1.05, 2.25, 1]} />
        <meshStandardMaterial color="#0f766e" roughness={0.74} />
      </mesh>
      <mesh position={[0, -0.35, 0.55]}>
        <boxGeometry args={[1.45, 1.35, 0.8]} />
        <meshStandardMaterial color="#f6f2ea" roughness={0.9} />
      </mesh>
      <mesh position={[-0.42, 0.4, 0.98]}>
        <boxGeometry args={[0.24, 1.55, 0.24]} />
        <meshStandardMaterial color="#9a6700" roughness={0.72} />
      </mesh>
      <mesh position={[0.42, 0.4, 0.98]}>
        <boxGeometry args={[0.24, 1.55, 0.24]} />
        <meshStandardMaterial color="#9a6700" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.05, 0.98]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.43, 0.13, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#9a6700" roughness={0.72} />
      </mesh>
      <mesh position={[0, -0.72, 1.04]}>
        <boxGeometry args={[0.56, 0.62, 0.14]} />
        <meshStandardMaterial color="#17252a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function LisbonScene() {
  return (
    <group rotation={[0, 0.34, 0]}>
      <mesh position={[-1.65, -0.5, -0.45]}>
        <boxGeometry args={[1.15, 1.15, 1]} />
        <meshStandardMaterial color="#f6f2ea" roughness={0.88} />
      </mesh>
      <mesh position={[-0.45, -0.15, -0.15]}>
        <boxGeometry args={[1.1, 1.85, 1]} />
        <meshStandardMaterial color="#c96f52" roughness={0.8} />
      </mesh>
      <mesh position={[0.72, 0.2, -0.42]}>
        <boxGeometry args={[1, 2.55, 0.95]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.88} />
      </mesh>
      <mesh position={[1.68, 0.55, -0.72]}>
        <boxGeometry args={[0.8, 3.15, 0.82]} />
        <meshStandardMaterial color="#9a6700" roughness={0.76} />
      </mesh>
      <mesh position={[-0.2, -0.68, 1.05]} rotation={[0, -0.14, 0]}>
        <boxGeometry args={[2.25, 0.52, 0.72]} />
        <meshStandardMaterial color="#0f766e" roughness={0.7} />
      </mesh>
      <mesh position={[-0.82, -0.35, 1.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 20]} />
        <meshStandardMaterial color="#17252a" roughness={0.76} />
      </mesh>
      <mesh position={[0.42, -0.35, 1.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 20]} />
        <meshStandardMaterial color="#17252a" roughness={0.76} />
      </mesh>
      <mesh position={[-0.2, -0.52, 1.44]}>
        <boxGeometry args={[1.55, 0.08, 0.06]} />
        <meshStandardMaterial color="#f6f2ea" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TokyoScene() {
  return (
    <group rotation={[0, -0.42, 0]}>
      <mesh position={[-1.55, -0.1, -0.5]}>
        <boxGeometry args={[0.72, 2.1, 0.72]} />
        <meshStandardMaterial color="#17252a" roughness={0.68} />
      </mesh>
      <mesh position={[-0.55, 0.45, -0.72]}>
        <boxGeometry args={[0.68, 3.2, 0.68]} />
        <meshStandardMaterial color="#0f766e" roughness={0.66} />
      </mesh>
      <mesh position={[0.58, 0.05, -0.35]}>
        <cylinderGeometry args={[0.48, 0.62, 2.4, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      <mesh position={[0.58, 1.45, -0.35]}>
        <sphereGeometry args={[0.38, 20, 16]} />
        <meshStandardMaterial color="#c96f52" roughness={0.62} />
      </mesh>
      <mesh position={[1.55, -0.34, -0.55]}>
        <boxGeometry args={[0.82, 1.62, 0.82]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.86} />
      </mesh>
      <mesh position={[-0.72, -0.02, 1.05]}>
        <boxGeometry args={[0.22, 2.05, 0.22]} />
        <meshStandardMaterial color="#c96f52" roughness={0.74} />
      </mesh>
      <mesh position={[0.72, -0.02, 1.05]}>
        <boxGeometry args={[0.22, 2.05, 0.22]} />
        <meshStandardMaterial color="#c96f52" roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.62, 1.05]}>
        <boxGeometry args={[1.95, 0.22, 0.26]} />
        <meshStandardMaterial color="#c96f52" roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.26, 1.05]}>
        <boxGeometry args={[1.5, 0.14, 0.2]} />
        <meshStandardMaterial color="#c96f52" roughness={0.74} />
      </mesh>
    </group>
  );
}

function DestinationComposition({
  destination,
}: TripExplorerSceneProps) {
  if (destination === "lisbon") {
    return <LisbonScene />;
  }

  if (destination === "tokyo") {
    return <TokyoScene />;
  }

  return <BarcelonaScene />;
}

const sceneBackgrounds: Record<TripExplorerDestinationId, string> = {
  barcelona: "#e2f2ef",
  lisbon: "#f6f2ea",
  tokyo: "#e7eaec",
};

const destinationNames: Record<TripExplorerDestinationId, string> = {
  barcelona: "Barcelona",
  lisbon: "Lisbon",
  tokyo: "Tokyo",
};

export function TripExplorerScene({ destination }: TripExplorerSceneProps) {
  return (
    <Canvas
      className="h-full w-full"
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [5.8, 4.3, 7.4], fov: 38 }}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      role="img"
      aria-label={`Interactive 3D destination scene for ${destinationNames[destination]}`}
    >
      <color attach="background" args={[sceneBackgrounds[destination]]} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[4, 7, 5]} intensity={2.4} />
      <group position={[0, -0.15, 0]} key={destination}>
        <Stage />
        <DestinationComposition destination={destination} />
      </group>
    </Canvas>
  );
}
