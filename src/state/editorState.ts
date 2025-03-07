import { ObjParser } from "@/3d/rawModel/ObjParser";
import { RawModel } from "@/3d/rawModel/RawModel";
import { FileLoader } from "three/src/loaders/FileLoader";
import { create } from "zustand";
import {
    createMeshConfig,
    getModelMeshConfigPath,
    loadMeshConfig,
    loadMeshConfigFromLocalStore,
    MeshConfig,
    saveMeshConfigToLocalStore,
} from "@/3d/modelConfig/MeshConfig";
import { MeshStats } from "@/3d/modelConfig/MeshStats";
import { Element, ElementInstance } from "@/3d/element/Element";
import { v4 as uuidv4 } from "uuid";
import { Area } from "@/3d/area/Area";
import { LayoutFunctions } from "@/3d/area/LayoutFunctions";
import {
    loadModelConfigFromLocalStore,
    saveModelConfigToLocalStore,
} from "@/3d/modelConfig/ModelConfig";
import {
    addElementInstance,
    createModelInstance,
    ModelInstance,
    resizeModelInstance,
} from "@/3d/modelInstance/ModelInstance";
import { getBoundingRectFromMinAndSize, scaleBoundingRect } from "@/3d/BoundingRect";
export type VertexSelectionData = {
    meshName: string;
    index: number;
};

type EditorState = {
    modelPath: string | undefined;
    model: RawModel | undefined;
    renderVertices: boolean;
    selectedMesh: string | undefined;
    selectedVertices: VertexSelectionData[];
    meshConfig: Record<string, MeshConfig>;
    meshStats: Record<string, MeshStats>;
    hiddenMeshes: string[];
    resizeTest: boolean;
    resizeTargetDimensions: { x: number; y: number; z: number };

    elements: Record<string, Element>;
    elementInstanceTest: boolean;

    currentElement: Element | undefined;

    meshAreas: Record<string, Area>;

    modelInstance: ModelInstance | undefined;

    createElement: () => void;
    updateCurrentElement: (element: Partial<Element> & Pick<Element, "id">) => void;
    setCurrentElement: (elementId: string) => void;

    loadModel: (path: string) => void;
    setRenderVertices: (renderVertices: boolean) => void;
    setSelectedMesh: (selectedMesh: string | undefined) => void;
    setSelectedVertices: (selectedVertices: VertexSelectionData[]) => void;
    setMeshConfig: (meshName: string, meshConfig: MeshConfig) => void;
    setHiddenMeshes: (hiddenMeshes: string[]) => void;
    setResizeTest: (resizeTest: boolean) => void;
    setResizeTargetDimensions: (resizeTargetDimensions: {
        x: number;
        y: number;
        z: number;
    }) => void;
    initMeshAreas: () => void;
    updateArea: (areaName: string, area: Partial<Area>) => void;

    setElementInstanceTest: (elementInstanceTest: boolean) => void;
    clearElementInstances: () => void;
    createElementInstance: (elementId: string) => void;

    saveModelConfig: () => void;
};

export const useEditorState = create<EditorState>((set, get) => ({
    modelPath: undefined,
    model: undefined,
    renderVertices: true,
    selectedMesh: undefined,
    selectedVertices: [],
    meshConfig: {},
    meshStats: {},
    hiddenMeshes: [],
    resizeTest: false,
    resizeTargetDimensions: { x: 1, y: 1, z: 1 },

    elements: {},
    elementInstances: [],
    currentElement: undefined,
    meshAreas: {},
    modelInstance: undefined,
    elementInstanceTest: false,

    loadModel: async (path: string) => {
        const loader = new FileLoader();
        const content = await loader.loadAsync(path);
        if (typeof content !== "string") {
            console.error("content is not string");
            return;
        }

        const parser = new ObjParser();
        const raw = parser.parse(content);
        raw.computeBoundingRect();

        // const meshConfig =
        //     loadMeshConfigFromLocalStore(path) ??
        //     raw.meshes.reduce((acc, mesh) => {
        //         acc[mesh.name] = createMeshConfig(mesh);
        //         return acc;
        //     }, {} as Record<string, MeshConfig>);

        const modelConfig = loadModelConfigFromLocalStore(path) ?? {
            v: "1.0.0",
            elements: {},
            hiddenMeshes: [],
            meshAreas: {},
            meshConfig: raw.meshes.reduce((acc, mesh) => {
                acc[mesh.name] = createMeshConfig(mesh);
                return acc;
            }, {} as Record<string, MeshConfig>),
        };

        const meshConfig = modelConfig.meshConfig;

        console.log({ modelConfig });

        const meshStats: Record<string, MeshStats> = {};

        raw.meshes.forEach((mesh) => {
            const config = meshConfig[mesh.name] ?? createMeshConfig(mesh);
            if (!meshConfig[mesh.name]) {
                meshConfig[mesh.name] = config;
            }

            meshStats[mesh.name] = new MeshStats(mesh, config);
        });

        const modelInstance = createModelInstance(raw, modelConfig, meshStats);

        set({
            model: raw,
            meshConfig,
            meshStats,
            modelPath: path,
            resizeTargetDimensions: {
                x: raw.boundingRect.sizeX,
                y: raw.boundingRect.sizeY,
                z: raw.boundingRect.sizeZ,
            },
            elements: modelConfig.elements,
            hiddenMeshes: modelConfig.hiddenMeshes,
            meshAreas: Object.fromEntries(
                Object.entries(modelConfig.meshAreas).map(([key, value]) => [
                    key,
                    Area.fromLike(value),
                ])
            ),
            modelInstance,
        });

        get().initMeshAreas();
    },

    setRenderVertices: (renderVertices: boolean) => {
        set({ renderVertices });
    },

    setSelectedMesh: (selectedMesh: string | undefined) => {
        set({ selectedMesh });
    },

    setSelectedVertices: (selectedVertices: VertexSelectionData[]) => {
        set({ selectedVertices });
    },

    setMeshConfig: (meshName: string, meshConfig: MeshConfig) => {
        const currentMeshConfig = get().meshConfig;
        const newMeshConfig = { ...currentMeshConfig, [meshName]: meshConfig };

        const mesh = get().model?.meshes.find((m) => m.name === meshName);
        if (!mesh) {
            console.error(`Mesh ${meshName} not found`);
            return;
        }

        const currentMeshStats = get().meshStats;
        const newMeshStats = {
            ...currentMeshStats,
            [meshName]: new MeshStats(mesh, meshConfig),
        };

        set({ meshConfig: newMeshConfig, meshStats: newMeshStats });
        saveMeshConfigToLocalStore(get().modelPath ?? "default", newMeshConfig);
    },

    setHiddenMeshes: (hiddenMeshes: string[]) => {
        set({ hiddenMeshes });
    },

    setResizeTest: (resizeTest: boolean) => {
        const modelInstance = get().modelInstance;
        if (!modelInstance) {
            return;
        }
        const resizedModelInstance = resizeModelInstance(
            modelInstance,
            get().resizeTest
                ? get().resizeTargetDimensions
                : {
                      x: modelInstance.raw.boundingRect.sizeX,
                      y: modelInstance.raw.boundingRect.sizeY,
                      z: modelInstance.raw.boundingRect.sizeZ,
                  }
        );

        set({ resizeTest, modelInstance: resizedModelInstance });
    },

    setResizeTargetDimensions: (resizeTargetDimensions: { x: number; y: number; z: number }) => {
        const modelInstance = get().modelInstance;
        if (!modelInstance) {
            return;
        }

        const resizedModelInstance = resizeModelInstance(
            modelInstance,
            get().resizeTest
                ? resizeTargetDimensions
                : {
                      x: modelInstance.raw.boundingRect.sizeX,
                      y: modelInstance.raw.boundingRect.sizeY,
                      z: modelInstance.raw.boundingRect.sizeZ,
                  }
        );

        set({ resizeTargetDimensions, modelInstance: resizedModelInstance });
    },

    createElement: () => {
        const id = uuidv4();
        const newElement: Element = {
            id,
            name: `Element-${id}`,
            meshName: "",
            parentAreaName: "",
            areaConfig: {
                minSize: 0.1,
                maxSize: 0.2,
                type: "1axis",
                minStartOffset: 0.1,
            },
        };

        set({ elements: { ...get().elements, [id]: newElement }, currentElement: newElement });
    },

    updateCurrentElement: (element: Partial<Element> & Pick<Element, "id">) => {
        const currentElement = get().currentElement;
        if (!currentElement) {
            return;
        }

        const updatedElement = { ...currentElement, ...element };
        set({
            currentElement: updatedElement,
            elements: { ...get().elements, [updatedElement.id]: updatedElement },
        });
    },

    setCurrentElement: (elementId: string) => {
        set({ currentElement: get().elements[elementId] });
    },

    initMeshAreas: () => {
        const config = get().meshConfig;
        const model = get().model;
        if (!config || !model) {
            return;
        }

        const areas = get().meshAreas;
        const newAreas = Object.values(config).filter((m) => m.isArea && !areas[m.meshName]);

        newAreas.forEach((area) => {
            const newArea = new Area(
                { axis: "y", type: "1axis" },
                model.meshes.find((m) => m.name === area.meshName)!.boundingRect
            );

            areas[area.meshName] = newArea;
        });

        set({ meshAreas: areas });
    },

    updateArea: (areaName: string, data: Partial<Area>) => {
        const currentAreas = get().meshAreas;
        const area = currentAreas[areaName];
        if (data.layout) {
            area.layout = data.layout;
        }

        if (data.config) {
            area.config = data.config;
        }

        const updatedAreas = {
            ...currentAreas,
            [areaName]: area,
        };

        set({ meshAreas: updatedAreas });
    },

    setElementInstanceTest: (elementInstanceTest: boolean) => {
        set({ elementInstanceTest });
    },

    clearElementInstances: () => {
        const modelInstance = get().modelInstance;
        if (!modelInstance) {
            return;
        }

        const updatedModelInstance = { ...modelInstance, elementInstances: [] };
        set({ modelInstance: updatedModelInstance });
    },

    createElementInstance: (elementId: string) => {
        const modelInstance = get().modelInstance;
        const element = get().elements[elementId];

        if (!modelInstance || !element) {
            return;
        }

        const updatedModelInstance = addElementInstance(modelInstance, element);
        set({ modelInstance: updatedModelInstance });
    },

    saveModelConfig: () => {
        const modelPath = get().modelPath;
        if (!modelPath) {
            console.error("Model path not found");
            return;
        }

        saveModelConfigToLocalStore(modelPath, {
            v: "1.0.0",
            elements: get().elements,
            hiddenMeshes: get().hiddenMeshes,
            meshAreas: get().meshAreas,
            meshConfig: get().meshConfig,
        });
    },
}));
