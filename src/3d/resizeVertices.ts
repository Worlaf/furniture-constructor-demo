import { BoundingRect } from "./BoundingRect";
import { Vector3 } from "three";
import { VertexGroups } from "./modelConfig/VertexGroup";

export const resizeVertices = (
  buffer: number[],
  resizeOrigin: Vector3,
  sourceBoundaries: BoundingRect,
  targetBoundaries: BoundingRect,
  hasGroupByIndex: (index: number, group: number) => boolean = () => false
) => {
  const result = Array<number>(buffer.length);

  const bounds = {
    x: getBoundValues2(sourceBoundaries, targetBoundaries, "x"),
    y: getBoundValues2(sourceBoundaries, targetBoundaries, "y"),
    z: getBoundValues2(sourceBoundaries, targetBoundaries, "z"),
  };

  const scaleX =
    (bounds.x.new.max - bounds.x.new.min) /
    (bounds.x.old.max - bounds.x.old.min);
  const scaleY =
    (bounds.y.new.max - bounds.y.new.min) /
    (bounds.y.old.max - bounds.y.old.min);
  const scaleZ =
    (bounds.z.new.max - bounds.z.new.min) /
    (bounds.z.old.max - bounds.z.old.min);

  const FrontIndex = VertexGroups.indexOf("Front");
  const BackIndex = VertexGroups.indexOf("Back");
  const TopIndex = VertexGroups.indexOf("Top");
  const BottomIndex = VertexGroups.indexOf("Bottom");
  const LeftIndex = VertexGroups.indexOf("Left");
  const RightIndex = VertexGroups.indexOf("Right");

  let x, y, z, newX, newY, newZ;

  for (let i = 0; i < buffer.length / 3; i++) {
    x = buffer[i * 3];
    y = buffer[i * 3 + 1];
    z = buffer[i * 3 + 2];

    newX = getNewPosition({
      value: x,
      multiplier: scaleX,
      bounds: bounds.x,
      origin: resizeOrigin.x,
      pinToMin: hasGroupByIndex(i, FrontIndex),
      pinToMax: hasGroupByIndex(i, BackIndex),
    });

    newY = getNewPosition({
      value: y,
      multiplier: scaleY,
      bounds: bounds.y,
      origin: resizeOrigin.y,
      pinToMin: hasGroupByIndex(i, BottomIndex),
      pinToMax: hasGroupByIndex(i, TopIndex),
    });

    newZ = getNewPosition({
      value: z,
      multiplier: scaleZ,
      bounds: bounds.z,
      origin: resizeOrigin.z,
      pinToMin: hasGroupByIndex(i, RightIndex),
      pinToMax: hasGroupByIndex(i, LeftIndex),
    });

    result[i * 3] = newX;
    result[i * 3 + 1] = newY;
    result[i * 3 + 2] = newZ;
  }

  return result;
};

type NewPositionArgs = {
  value: number;
  multiplier: number;
  bounds: MeshBoundValues;
  origin: number;
  pinToMin: boolean;
  pinToMax: boolean;
};

const getNewPosition = (args: NewPositionArgs) => {
  const { value, multiplier, bounds, origin, pinToMin, pinToMax } = args;

  if (pinToMin) {
    const delta = value - bounds.old.min;

    return bounds.new.min + delta;
  }

  if (pinToMax) {
    const delta = bounds.old.max - value;

    return bounds.new.max - delta;
  }

  const delta = value - origin;

  return origin + delta * multiplier;
};

type MeshBoundValues = {
  old: { min: number; max: number };
  new: { min: number; max: number };
};

const getBoundValues = (
  stats: { min: Vector3; max: Vector3 },
  scale: { x: number; y: number; z: number },
  origin: Vector3,
  key: "x" | "y" | "z"
) => {
  const oldMin = stats.min[key];
  const oldMax = stats.max[key];

  const newMin = origin[key] + (oldMin - origin[key]) * scale[key];
  const newMax = origin[key] + (oldMax - origin[key]) * scale[key];

  return {
    old: { min: oldMin, max: oldMax },
    new: { min: newMin, max: newMax },
  };
};

const getBoundValues2 = (
  stats: { min: Vector3; max: Vector3 },
  newStats: { min: Vector3; max: Vector3 },
  key: "x" | "y" | "z"
) => {
  const oldMin = stats.min;
  const oldMax = stats.max;
  const newMin = newStats.min;
  const newMax = newStats.max;

  return {
    old: { min: oldMin[key], max: oldMax[key] },
    new: { min: newMin[key], max: newMax[key] },
  };
};
