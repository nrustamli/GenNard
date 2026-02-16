import { OrbitControls } from '@react-three/drei';

export function CameraController() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={8}
      maxDistance={20}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
    />
  );
}
