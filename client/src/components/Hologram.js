import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Sphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        wireframe
        color="red"
        emissive="red"
        emissiveIntensity={1}
      />
    </mesh>
  );
}

export default function Hologram() {
  return (
    <div className="h-80">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Sphere />
        <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={false} />
      </Canvas>
    </div>
  );
}