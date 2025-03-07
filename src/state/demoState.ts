import { RawModel } from "@/3d/rawModel/RawModel";
import { loadModelConfig, ModelConfig } from "@/3d/modelConfig/ModelConfig";
import { create } from "zustand";
import { FileLoader } from "three";
import { ObjParser } from "@/3d/rawModel/ObjParser";
import {
    addElementInstance,
    createModelInstance,
    ModelInstance,
    resizeModelInstance,
} from "@/3d/modelInstance/ModelInstance";
import { MeshStats } from "@/3d/modelConfig/MeshStats";
import { Element } from "@/3d/element/Element";

type RoomConfig = {
    width: number;
    depth: number;
    height: number;
};

type DemoState = {
    model:
        | {
              raw: RawModel;
              config: ModelConfig;
              meshStats: Record<string, MeshStats>;
          }
        | undefined;

    instance: ModelInstance | undefined;

    roomConfig: RoomConfig;

    isDragging: boolean;

    loadModel: (path: string) => void;
    setIsDragging: (isDragging: boolean) => void;
    resizeInstance: (dimensions: { x: number; y: number; z: number }) => void;
    addElementInstance: (element: Element) => void;
};

export const useDemoState = create<DemoState>((set, get) => ({
    model: undefined,
    instance: undefined,

    roomConfig: {
        width: 6,
        depth: 4,
        height: 2.5,
    },

    isDragging: false,

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

        const modelConfig = await loadModelConfig(`${path}.config.json`);
        if (!modelConfig) {
            console.error("model config not found");
            return;
        }

        const meshStats: Record<string, MeshStats> = {};

        raw.meshes.forEach((mesh) => {
            meshStats[mesh.name] = new MeshStats(mesh, modelConfig.meshConfig[mesh.name]);
        });

        const instance = createModelInstance(raw, modelConfig, meshStats);

        console.log({ instance });

        set({ model: { raw, config: modelConfig, meshStats }, instance });
    },

    setIsDragging: (isDragging: boolean) => {
        set({ isDragging });
    },

    resizeInstance: (dimensions: { x: number; y: number; z: number }) => {
        const instance = get().instance;
        if (!instance) {
            console.error("instance not found");
            return;
        }

        const resizedInstance = resizeModelInstance(instance, dimensions);

        set({ instance: resizedInstance });
    },

    addElementInstance: (element: Element) => {
        const instance = get().instance;
        if (!instance) {
            console.error("instance not found");
            return;
        }

        const newInstance = addElementInstance(instance, element);

        set({ instance: newInstance });
    },
}));
