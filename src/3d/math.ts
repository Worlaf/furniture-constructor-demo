import { Vector2, Vector2Like, Vector3 } from "three";

const defaultPrecision = 3;
const defaultEpsilon = Math.pow(10, -defaultPrecision);

export const round = (value: number, precision: number = defaultPrecision) => {
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
};

export const v2Equal = (
  v1: Vector2Like,
  v2: Vector2Like,
  epsilon: number = defaultEpsilon
) => {
  return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
};
