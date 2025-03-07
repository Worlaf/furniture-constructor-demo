import { MaterialTextures } from "@/state/resourcesState";
import React, { useEffect, useRef } from "react";
import { PlaneGeometry } from "three";

type Props = {
    width: number;
    height: number;
    textures: MaterialTextures;
    position: [x: number, y: number, z: number];
    rotation: [x: number, y: number, z: number];
    receiveShadow?: boolean;
};

export const TexturedPlaneMesh: React.FC<Props> = ({
    width,
    height,
    textures,
    position,
    rotation,
    receiveShadow,
}) => {
    const geometry = useRef<PlaneGeometry>(new PlaneGeometry(width, height));

    useEffect(() => {
        // resize uvs
        const uvs = geometry.current.attributes.uv;
        for (let i = 0; i < uvs.count; i++) {
            uvs.array[i * 2] = uvs.array[i * 2] * width;
            uvs.array[i * 2 + 1] = uvs.array[i * 2 + 1] * height;
        }
        uvs.needsUpdate = true;
    }, [width, height]);

    return (
        <mesh
            position={position}
            rotation={rotation}
            receiveShadow={receiveShadow}
            geometry={geometry.current}
        >
            <meshStandardMaterial
                map={textures.color}
                roughnessMap={textures.roughness}
                normalMap={textures.normal}
                bumpMap={textures.displacement}
            />
        </mesh>
    );
};
