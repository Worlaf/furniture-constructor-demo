import React, { useEffect, useRef } from "react";
import { get2dTransformData, handleMovement2d } from "@/3d/handleMovement2d";
import { useDemoState } from "@/state/demoState";
import { DragControls, PivotControls } from "@react-three/drei";
import { Matrix4, Vector2, Vector3 } from "three";

type Props = {
    subject: { min: Vector3; max: Vector3 };
    area: { min: Vector2; max: Vector2 };
};

export const BoundedPivotControls: React.FC<React.PropsWithChildren<Props>> = ({
    subject,
    area,
    children,
}) => {
    const setIsDragging = useDemoState((state) => state.setIsDragging);

    const matrix = useRef<Matrix4>(new Matrix4());
    const origin = useRef<Vector3>(new Vector3(0, 0, 0));
    const stickOffset = 0.1;

    console.log({ subject, area });

    useEffect(() => {
        matrix.current.setPosition(2, 0, 0);
    }, []);

    useEffect(() => {
        handleMovement2d(subject, origin.current, matrix.current, "xz", area, stickOffset);
    }, [subject, area]);

    return (
        <PivotControls
            activeAxes={[true, false, true]}
            depthTest={false}
            disableScaling
            matrix={matrix.current}
            autoTransform={false}
            onDrag={(localMatrix) => {
                matrix.current.copy(localMatrix);

                handleMovement2d(subject, origin.current, matrix.current, "xz", area, stickOffset);
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
        >
            {children}
        </PivotControls>
    );
};
