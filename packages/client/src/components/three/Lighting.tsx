export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-3, 8, -3]} intensity={0.3} />
      <pointLight position={[0, 6, 0]} intensity={0.2} />
    </>
  );
}
