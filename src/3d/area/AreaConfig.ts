import { AreaLayout } from "./AreaLayout";

type AreaConfig1axis = {
    type: "1axis";
    minSize: number;
    maxSize: number | undefined;
    minStartOffset: number;
};

export type AreaConfig = AreaConfig1axis;

export const getDefaultAreaConfig = (layout: AreaLayout): AreaConfig => {
    switch (layout.type) {
        case "1axis":
        default:
            return {
                type: "1axis",
                minSize: 0,
                maxSize: undefined,
                minStartOffset: 0,
            };
    }
};

export const convertAreaConfig = (config: AreaConfig, layout: AreaLayout): AreaConfig => {
    switch (config.type) {
        case "1axis":
            return convert1axisConfig(config, layout);
        default:
            throw Error("Unexpected config type: " + config.type);
    }
};

const convert1axisConfig = (config: AreaConfig1axis, layout: AreaLayout): AreaConfig => {
    switch (layout.type) {
        case "1axis":
            return config;
        default:
            throw Error("Unexpected layout type: " + layout.type);
    }
};
