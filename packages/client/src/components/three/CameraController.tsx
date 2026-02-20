import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PerspectiveCamera } from 'three';

export function CameraController() {
  const { camera, size } = useThree();
  const isMobile = size.width < 640;

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    if (isMobile) {
      camera.fov = 75;
      camera.position.set(0, 18, 14);
    } else {
      camera.fov = 45;
      camera.position.set(0, 14, 10);
    }
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }, [camera, isMobile]);

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={8}
      maxDistance={isMobile ? 28 : 20}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
    />
  );
}
