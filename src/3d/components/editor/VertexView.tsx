import React from "react";
import { Vector3 } from "three";

type VertexViewProps = {
  point: Vector3;
  meshName: string;
  index: number;
  isSelected?: boolean;
};

export const VertexView = ({
  point,
  meshName,
  index,
  isSelected,
}: VertexViewProps) => {
  return (
    <mesh position={point} userData={{ type: "vertex", meshName, index }}>
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshBasicMaterial color={isSelected ? "red" : "white"} />
    </mesh>
  );
};
