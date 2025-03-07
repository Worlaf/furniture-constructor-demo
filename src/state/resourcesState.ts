import { RepeatWrapping, Texture, TextureLoader } from "three";
import { create, createStore } from "zustand";

export type MaterialTextures = {
    color: Texture;
    normal: Texture | undefined;
    displacement: Texture | undefined;
    roughness: Texture | undefined;
};

type ResourcesState = {
    materialTextures: Record<string, MaterialTextures>;
    loadingProgress: number;
    isLoaded: boolean;

    loadMaterialsTextures: (materialNames: string[]) => void;
};

const rootPath = "./assets/";

export const useResourcesState = create<ResourcesState>((set) => ({
    materialTextures: {},
    loadingProgress: 0,
    isLoaded: false,

    loadMaterialsTextures: async (materialNames: string[]) => {
        set({ loadingProgress: 0 });

        let loadedMaterials: Record<string, MaterialTextures> = {};
        let counter = 0;
        const total = materialNames.length * 4;

        for (const materialName of materialNames) {
            const textures = await loadAmbientCgMaterialTextures(materialName, (cnt) => {
                counter += cnt;
                set({ loadingProgress: (counter / total) * 100 });
            });
            loadedMaterials[materialName] = textures;
        }

        set((state) => ({
            materialTextures: { ...state.materialTextures, ...loadedMaterials },
            isLoaded: true,
        }));
    },
}));

const loadAmbientCgMaterialTextures = async (texture: string, onProgress: (e: number) => void) => {
    const loader = new TextureLoader();

    const resolution = "1K";
    const format = "JPG";

    const getPath = (type: string) =>
        `${rootPath}${texture}/${texture}_${resolution}-${format}_${type}.jpg`;

    const handleLoadFinish = (value: Texture) => {
        onProgress(1);

        value.wrapS = RepeatWrapping;
        value.wrapT = RepeatWrapping;

        return value;
    };

    const color = await loader.loadAsync(getPath("Color")).then(handleLoadFinish);

    const displacement = await loader.loadAsync(getPath("Displacement")).then(handleLoadFinish);

    const normal = await loader.loadAsync(getPath("NormalGL")).then(handleLoadFinish);

    const roughness = await loader.loadAsync(getPath("Roughness")).then(handleLoadFinish);

    return { color, displacement, normal, roughness };
};
