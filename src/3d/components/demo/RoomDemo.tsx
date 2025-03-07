import React, { useEffect } from "react";
import { Room } from "./Room";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useDemoState } from "@/state/demoState";
import { useResourcesState } from "@/state/resourcesState";
import { ModelInstanceRenderer } from "./ModelInstanceRenderer";
import { BoundedPivotControls } from "./BoundedPivotControls";
import { Vector2 } from "three";

export const RoomDemo: React.FC = () => {
    const isDragging = useDemoState((state) => state.isDragging);
    const isLoaded = useResourcesState((state) => state.isLoaded);
    const loadModel = useDemoState((state) => state.loadModel);
    const roomConfig = useDemoState((state) => state.roomConfig);

    const instance = useDemoState((state) => state.instance);

    useEffect(() => {
        loadModel("./assets/models/wardrobe.obj");
    }, []);

    if (!isLoaded) {
        return null;
    }

    return (
        <group>
            <Room />
            <PerspectiveCamera makeDefault position={[-3, 1, 1]} />
            <OrbitControls
                enabled={!isDragging}
                minPolarAngle={Math.PI / 8}
                maxPolarAngle={(Math.PI / 8) * 5}
                target={[0, 1, 0]}
            />
            {instance && (
                <BoundedPivotControls
                    subject={instance.box}
                    area={{
                        min: new Vector2(-roomConfig.width / 2, -roomConfig.depth / 2),
                        max: new Vector2(roomConfig.width / 2, roomConfig.depth / 2),
                    }}
                >
                    <ModelInstanceRenderer instance={instance} />
                </BoundedPivotControls>
            )}
        </group>
    );
};
