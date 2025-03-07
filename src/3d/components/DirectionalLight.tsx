import React from "react";
import * as THREE from "three";

type Props = {
  drawHelpers?: boolean;
  lightPosition: [x: number, y: number, z: number];
  targetPosition?: [x: number, y: number, z: number];
};

export const DirectionalLight: React.FC<Props> = ({
  drawHelpers,
  lightPosition,
  targetPosition = [0, 0, 0],
}) => {
  const targetRef = React.useRef<THREE.Object3D>(null);

  return (
    <>
      <object3D ref={targetRef} position={targetPosition} />
      <directionalLight
        color="white"
        intensity={0.7}
        position={lightPosition}
        target={targetRef.current ?? undefined}
      />
      <mesh visible={drawHelpers} position={lightPosition}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      <mesh visible={drawHelpers} position={targetPosition}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
};
