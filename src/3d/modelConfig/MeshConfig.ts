import { FileLoader } from "three/src/loaders/FileLoader";
import { RawMesh } from "../rawModel/RawMesh";
import { VertexGroup, VertexGroups } from "./VertexGroup";

export type MeshConfig = {
    meshName: string;
    vertexGroups: Record<VertexGroup, { vertexIndices: number[] }>;
    isHidden: boolean;
    isArea: boolean;
};

export const createMeshConfig = (mesh: RawMesh): MeshConfig => {
    return {
        meshName: mesh.name,
        vertexGroups: VertexGroups.reduce((acc, group) => {
            acc[group] = { vertexIndices: [] };
            return acc;
        }, {} as Record<VertexGroup, { vertexIndices: number[] }>),
        isHidden: false,
        isArea: false,
    };
};

export const updateMeshConfigVertexGroup = (
    meshConfig: MeshConfig,
    group: VertexGroup,
    vertexIndices: number[],
    action: "add" | "remove" | "set"
): MeshConfig => {
    const existingVertexIndices = meshConfig.vertexGroups[group].vertexIndices;
    let updatedIndices = Array<number>();

    if (action === "add") {
        updatedIndices = [
            ...existingVertexIndices,
            ...vertexIndices.filter((index) => !existingVertexIndices.includes(index)),
        ];
    } else if (action === "remove") {
        updatedIndices = existingVertexIndices.filter((index) => !vertexIndices.includes(index));
    } else {
        updatedIndices = vertexIndices;
    }

    return {
        ...meshConfig,
        vertexGroups: {
            ...meshConfig.vertexGroups,
            [group]: { vertexIndices: updatedIndices },
        },
    };
};

export const getModelMeshConfigPath = (modelPath: string) => `${modelPath}.config.json`;

export const loadMeshConfig = async (
    path: string
): Promise<Record<string, MeshConfig> | undefined> => {
    const loader = new FileLoader();

    try {
        const content = await loader.loadAsync(path);
        if (typeof content !== "string") {
            console.error("content is not string");
            return undefined;
        }

        const meshConfig = JSON.parse(content) as Record<string, MeshConfig>;
        return meshConfig;
    } catch {
        return undefined;
    }
};

const getLocalStoreKey = (modelPath: string) => `meshConfig:${modelPath}`;

export const loadMeshConfigFromLocalStore = (
    modelPath: string
): Record<string, MeshConfig> | undefined => {
    const key = getLocalStoreKey(modelPath);
    const content = localStorage.getItem(key);
    if (!content) {
        return undefined;
    }

    return JSON.parse(content) as Record<string, MeshConfig>;
};

export const saveMeshConfigToLocalStore = (
    modelPath: string,
    meshConfig: Record<string, MeshConfig>
) => {
    const key = getLocalStoreKey(modelPath);
    localStorage.setItem(key, JSON.stringify(meshConfig));
};
