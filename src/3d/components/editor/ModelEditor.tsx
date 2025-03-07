import { Grid, OrbitControls, PerspectiveCamera, Select } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import { EditorModelRenderer } from "./EditorModelRenderer";
import { useResourcesState } from "@/state/resourcesState";
import { useEditorState } from "@/state/editorState";
export const ModelEditor = () => {
    const { isLoaded } = useResourcesState();

    const { model, loadModel, setSelectedVertices, setSelectedMesh } = useEditorState();

    useEffect(() => {
        loadModel("./assets/models/wardrobe.obj");
    }, []);

    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setIsSelecting(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            setIsSelecting(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <>
            <axesHelper args={[5]} />
            <Grid infiniteGrid fadeDistance={10} />
            <PerspectiveCamera makeDefault position={[-3, 1, 1]} />
            <OrbitControls
                minPolarAngle={Math.PI / 8}
                maxPolarAngle={(Math.PI / 8) * 5}
                target={[0, 1, 0]}
                enabled={!isSelecting}
            />
            <ambientLight intensity={0.6} position={[0, 0.5, 0]} />
            <Select
                box={true}
                multiple={true}
                onChangePointerUp={(e) => {
                    const meshes = e.filter((ee) => ee.userData.type === "mesh");

                    const vertices = e.filter((ee) => ee.userData.type === "vertex");

                    if (meshes.length === 1 && !vertices.length) {
                        setSelectedMesh(meshes[0].userData.name);
                    } else {
                        setSelectedMesh(undefined);
                        setSelectedVertices(
                            vertices.map((v) => ({
                                meshName: v.userData.meshName,
                                index: v.userData.index,
                            }))
                        );
                    }
                }}
            >
                {isLoaded && model && <EditorModelRenderer model={model} />}
            </Select>
        </>
    );
};
