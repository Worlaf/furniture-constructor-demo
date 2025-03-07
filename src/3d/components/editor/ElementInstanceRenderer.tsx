import React, { useMemo } from "react";
import { ElementInstance } from "@/3d/element/Element";
import { useResourcesState } from "@/state/resourcesState";

type ElementInstanceRendererProps = {
    instance: ElementInstance;
    renderArea?: boolean;
};

export const ElementInstanceRenderer: React.FC<ElementInstanceRendererProps> = ({
    instance,
    renderArea = false,
}) => {
    const { materialTextures } = useResourcesState();
    const textures = useMemo(() => {
        return Object.values(materialTextures)[0];
    }, []);

    return (
        <group position={instance.area.box.center}>
            {renderArea && (
                <mesh>
                    <boxGeometry
                        args={[
                            instance.area.box.sizeX,
                            instance.area.box.sizeY,
                            instance.area.box.sizeZ,
                        ]}
                    />
                    <meshBasicMaterial color="yellow" wireframe={true} />
                </mesh>
            )}
            <mesh geometry={instance.geometry}>
                {textures ? (
                    <meshStandardMaterial
                        map={textures.color}
                        normalMap={textures.normal}
                        roughnessMap={textures.roughness}
                        bumpMap={textures.displacement}
                        color={[2, 2, 2]}
                    />
                ) : (
                    <meshBasicMaterial color="yellow" />
                )}
            </mesh>
        </group>
    );
};
