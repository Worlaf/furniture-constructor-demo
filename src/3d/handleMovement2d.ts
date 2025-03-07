// todo:
import { Euler, Matrix4, Quaternion, Vector2, Vector3 } from "three";

const axis3dTo2dConfig = {
    xy: {
        translationAxis1: "x",
        translationAxis1H: "X",
        translationAxis2: "y",
        translationAxis2H: "Y",
        rotationAxis: "z",
    },
    xz: {
        translationAxis1: "x",
        translationAxis1H: "X",
        translationAxis2: "z",
        translationAxis2H: "Z",
        rotationAxis: "y",
    },
    yz: {
        translationAxis1: "y",
        translationAxis1H: "Y",
        translationAxis2: "z",
        translationAxis2H: "Z",
        rotationAxis: "x",
    },
} as const;

export const get2dTransformData = (
    rect: { min: Vector3; max: Vector3 },
    origin: Vector3,
    matrix: Matrix4,
    axis: "xy" | "xz" | "yz"
): {
    points: [Vector2, Vector2, Vector2, Vector2];
    rotation: number;
    translation: Vector2;
} => {
    const { translationAxis1, translationAxis2, rotationAxis } = axis3dTo2dConfig[axis];

    const v3 = new Vector3();
    v3.setFromMatrixPosition(matrix);

    const translation = new Vector2(v3[translationAxis1], v3[translationAxis2]);

    const q = new Quaternion();
    q.setFromRotationMatrix(matrix);

    const euler = new Euler();
    // todo: check if this is correct
    euler.setFromQuaternion(q, "YXZ");
    const rotation = -euler[rotationAxis];

    const origin2d = new Vector2(origin[translationAxis1], origin[translationAxis2]);

    const p1 = new Vector2(rect.min[translationAxis1], rect.min[translationAxis2]);
    const p2 = new Vector2(rect.min[translationAxis1], rect.max[translationAxis2]);
    const p3 = new Vector2(rect.max[translationAxis1], rect.max[translationAxis2]);
    const p4 = new Vector2(rect.max[translationAxis1], rect.min[translationAxis2]);

    // rotate points around origin
    p1.rotateAround(origin2d, rotation);
    p2.rotateAround(origin2d, rotation);
    p3.rotateAround(origin2d, rotation);
    p4.rotateAround(origin2d, rotation);

    // translate points to translation
    //   p1.add(translation);
    //   p2.add(translation);
    //   p3.add(translation);
    //   p4.add(translation);

    return { points: [p1, p2, p3, p4], rotation, translation };
};

const applyTranslation2dTo3d = (
    translation2d: Vector2,
    axis: "xy" | "xz" | "yz",
    matrix: Matrix4
) => {
    const { translationAxis1H, translationAxis2H, rotationAxis } = axis3dTo2dConfig[axis];

    const v3 = new Vector3();
    v3[`set${translationAxis1H}`](translation2d.x);
    v3[`set${translationAxis2H}`](translation2d.y);

    //   const q = new Quaternion();
    //   q.setFromEuler(
    //     new Euler(
    //       rotationAxis === "x" ? rotation : 0,
    //       rotationAxis === "y" ? rotation : 0,
    //       rotationAxis === "z" ? rotation : 0
    //     )
    //   );

    matrix.setPosition(v3);
};

export const handleMovement2d = (
    rect: { min: Vector3; max: Vector3 },
    origin: Vector3,
    matrix: Matrix4,
    axis: "xy" | "xz" | "yz",
    bounds2d: { min: Vector2; max: Vector2 },
    stickOffset = 0
): Matrix4 => {
    const { points, rotation, translation } = get2dTransformData(rect, origin, matrix, axis);

    for (const point of points) {
        // sticking;
        if (point.x + translation.x < bounds2d.min.x + stickOffset) {
            translation.x = bounds2d.min.x - point.x;
        } else if (point.x + translation.x > bounds2d.max.x - stickOffset) {
            translation.x = bounds2d.max.x - point.x;
        }

        if (point.y + translation.y < bounds2d.min.y + stickOffset) {
            translation.y = bounds2d.min.y - point.y;
        } else if (point.y + translation.y > bounds2d.max.y - stickOffset) {
            translation.y = bounds2d.max.y - point.y;
        }

        // out of bounds
        if (point.x + translation.x < bounds2d.min.x) {
            translation.x = bounds2d.min.x - point.x;
        } else if (point.x + translation.x > bounds2d.max.x) {
            translation.x = bounds2d.max.x - point.x;
        }

        if (point.y + translation.y < bounds2d.min.y) {
            translation.y = bounds2d.min.y - point.y;
        } else if (point.y + translation.y > bounds2d.max.y) {
            translation.y = bounds2d.max.y - point.y;
        }
    }

    applyTranslation2dTo3d(translation, axis, matrix);

    return matrix;
};
