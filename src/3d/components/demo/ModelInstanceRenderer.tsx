import { ModelInstance } from "@/3d/modelInstance/ModelInstance";
import { useResourcesState } from "@/state/resourcesState";
import React from "react";

type Props = {
    instance: ModelInstance;
};

export const ModelInstanceRenderer: React.FC<Props> = ({ instance }) => {
    const { materialTextures } = useResourcesState();
    const textures = materialTextures["Wood049"];

    console.log({ instance });

    return (
        <group>
            {Object.values(instance.meshes)
                .filter((mesh) => !mesh.isHidden)
                .map((mesh, index) => (
                    <mesh key={index} geometry={mesh.geometry} castShadow receiveShadow>
                        <meshStandardMaterial
                            map={textures.color}
                            normalMap={textures.normal}
                            roughnessMap={textures.roughness}
                            bumpMap={textures.displacement}
                            color={[2, 2, 2]}
                        />
                    </mesh>
                ))}
            {instance.elementInstances.map((instance, index) => {
                return (
                    <mesh
                        key={index}
                        geometry={instance.geometry}
                        position={instance.area.box.center}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial
                            map={textures.color}
                            normalMap={textures.normal}
                            roughnessMap={textures.roughness}
                            bumpMap={textures.displacement}
                            color={[2, 2, 2]}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};
