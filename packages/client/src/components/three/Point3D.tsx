import { useMemo } from 'react';
import * as THREE from 'three';
import { getTriangleVertices } from '../../utils/boardCoordinates';

interface Point3DProps {
  index: number;
  color: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function Point3D({ index, color, isHighlighted = false, onClick }: Point3DProps) {
  const geometry = useMemo(() => {
    const vertices = getTriangleVertices(index);
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array([
      ...vertices[0],
      ...vertices[1],
      ...vertices[2],
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [index]);

  return (
    <mesh
      geometry={geometry}
      onClick={onClick}
      receiveShadow
    >
      <meshStandardMaterial
        color={isHighlighted ? '#44ff44' : color}
        roughness={0.7}
        side={THREE.DoubleSide}
        emissive={isHighlighted ? '#22aa22' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      />
    </mesh>
  );
}
