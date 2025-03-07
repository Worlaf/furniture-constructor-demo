import React, { useEffect } from "react";
import { TexturedPlaneMesh } from "./TexturedPlaneMesh";
import { PointLight } from "three";
import { Vector2 } from "three";
import { useResourcesState } from "@/state/resourcesState";
import { useDemoState } from "@/state/demoState";
import { DirectionalLight } from "../DirectionalLight";

export const Room: React.FC = () => {
    const ref = React.useRef<PointLight>(null);
    const { materialTextures, isLoaded } = useResourcesState();

    const { width, depth, height } = useDemoState((state) => state.roomConfig);

    useEffect(() => {
        if (ref.current) {
            ref.current.shadow.mapSize = new Vector2(1024 * 2, 1024 * 2);
            ref.current.shadow.camera.far = 400;
        }
    }, [ref.current]);

    if (!materialTextures || !isLoaded) {
        return null;
    }

    const floor = materialTextures["WoodFloor039"];
    const wall = materialTextures["Wallpaper002A"];

    return (
        <group>
            <TexturedPlaneMesh
                width={width}
                height={depth}
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                textures={floor}
                receiveShadow={true}
            />
            <TexturedPlaneMesh
                width={width}
                height={height}
                position={[0, height / 2, -depth / 2]}
                rotation={[0, 0, 0]}
                textures={wall}
                receiveShadow={true}
            />
            <TexturedPlaneMesh
                width={width}
                height={height}
                position={[0, height / 2, depth / 2]}
                rotation={[0, Math.PI, 0]}
                textures={wall}
                receiveShadow={true}
            />
            <TexturedPlaneMesh
                width={depth}
                height={height}
                position={[-width / 2, height / 2, 0]}
                rotation={[0, Math.PI / 2, 0]}
                textures={wall}
                receiveShadow={true}
            />
            <TexturedPlaneMesh
                width={depth}
                height={height}
                position={[width / 2, height / 2, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                textures={wall}
                receiveShadow={true}
            />
            <pointLight position={[0, height, 0]} intensity={5} castShadow={true} ref={ref} />
            <ambientLight intensity={0.6} position={[0, 0.5, 0]} />
            <DirectionalLight drawHelpers={false} lightPosition={[0, 5, 1]} />
        </group>
    );
};
