import { Element } from "../element/Element";
import { Area, AreaLike } from "../area/Area";
import { FileLoader } from "three";
import { MeshConfig } from "./MeshConfig";

type ModelConfig_v1 = {
    v: "1.0.0";
    elements: Record<string, Element>;
    hiddenMeshes: string[];
    meshAreas: Record<string, AreaLike>;
    meshConfig: Record<string, MeshConfig>;
};

export type ModelConfig = ModelConfig_v1;

const getLocalStoreKey = (modelPath: string) => `modelConfig:${modelPath}`;

export const saveModelConfigToLocalStore = (modelPath: string, modelConfig: ModelConfig) => {
    localStorage.setItem(getLocalStoreKey(modelPath), JSON.stringify(modelConfig));
};

export const loadModelConfigFromLocalStore = (modelPath: string): ModelConfig | undefined => {
    const modelConfig = localStorage.getItem(getLocalStoreKey(modelPath));
    if (!modelConfig) {
        return undefined;
    }

    const config = JSON.parse(modelConfig);
    if (config.v !== "1.0.0") {
        return undefined;
    }

    return config;
};

export const loadModelConfig = async (path: string): Promise<ModelConfig | undefined> => {
    const loader = new FileLoader();

    try {
        const content = await loader.loadAsync(path);
        if (typeof content !== "string") {
            console.error("content is not string");
            return undefined;
        }

        const config = JSON.parse(content) as ModelConfig;
        return config;
    } catch {
        return undefined;
    }
};
