import React, { useMemo } from "react";

import { RawModel } from "@/3d/rawModel/RawModel";
import { useResourcesState } from "@/state/resourcesState";
import { VertexView } from "./VertexView";
import { useEditorState } from "@/state/editorState";
import { ElementInstanceRenderer } from "./ElementInstanceRenderer";
import { MeshInstance } from "@/3d/modelInstance/MeshInstance";

export const EditorModelRenderer: React.FC<{ model: RawModel }> = ({ model }) => {
    const hiddenMeshes = useEditorState((state) => state.hiddenMeshes);
    const renderVertices = useEditorState((state) => state.renderVertices);
    const selectedMesh = useEditorState((state) => state.selectedMesh);

    const elementInstanceTest = useEditorState((state) => state.elementInstanceTest);

    const modelInstance = useEditorState((state) => state.modelInstance);

    return (
        <group>
            {modelInstance &&
                Object.values(modelInstance.meshes)
                    .filter((m) => !hiddenMeshes.includes(m.raw.name))
                    .map((m, i) => (
                        <RawMeshRenderer
                            instance={m}
                            key={m.raw.name}
                            renderVertices={renderVertices}
                            isHidden={hiddenMeshes.includes(m.raw.name)}
                            isSelected={selectedMesh === m.raw.name}
                        />
                    ))}
            {elementInstanceTest &&
                modelInstance &&
                modelInstance.elementInstances.map((instance, index) => (
                    <ElementInstanceRenderer key={index} instance={instance} />
                ))}
        </group>
    );
};

type RawMeshRendererProps = {
    instance: MeshInstance;
    renderVertices?: boolean;
    isHidden?: boolean;
    isSelected?: boolean;
};

const RawMeshRenderer: React.FC<RawMeshRendererProps> = ({
    instance,
    renderVertices = false,
    isHidden = false,
    isSelected = false,
}) => {
    const points = useMemo(() => instance.raw.getPoints(), [instance]);

    const selectedVertices = useEditorState((state) => state.selectedVertices);

    const { materialTextures } = useResourcesState();
    const textures = useMemo(() => {
        return Object.values(materialTextures)[0];
    }, []);

    return (
        <group>
            <mesh
                geometry={instance.geometry}
                key={instance.raw.name}
                visible={!isHidden}
                userData={{ type: "mesh", name: instance.raw.name }}
            >
                {textures && !instance.config.isArea ? (
                    <meshStandardMaterial
                        map={textures.color}
                        normalMap={textures.normal}
                        roughnessMap={textures.roughness}
                        bumpMap={textures.displacement}
                        color={isSelected ? [4, 4, 4] : [2, 2, 2]}
                    />
                ) : instance.config.isArea ? (
                    <meshBasicMaterial color="red" wireframe={true} />
                ) : (
                    <meshBasicMaterial color="yellow" />
                )}
            </mesh>
            {renderVertices &&
                points.map((point, index) => (
                    <VertexView
                        key={index}
                        point={point}
                        meshName={instance.raw.name}
                        index={index}
                        isSelected={selectedVertices.some(
                            (v) => v.meshName === instance.raw.name && v.index === index
                        )}
                    />
                ))}
        </group>
    );
};
