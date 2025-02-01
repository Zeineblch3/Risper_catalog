import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";

//where the 3D scene is set up.
export const Experience = () => {
  
  return (
    <>
    <Float
      rotation-x={-Math.PI / 4}
      floatIntensity={0}
      speed={5}
      rotationIntensity={1}
    >
      <Book />
    </Float>
      <OrbitControls />
      <Environment preset="studio"></Environment>

      <directionalLight
        position={[3, 6, 3]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.4} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
