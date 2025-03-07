import { Area } from "../area/Area";
import { BoundingRect, getBoundingRectFromMinAndSize } from "../BoundingRect";
import { ModelConfig } from "../modelConfig/ModelConfig";
import { MeshConfig } from "../modelConfig/MeshConfig";
import { MeshStats } from "../modelConfig/MeshStats";
import { RawModel } from "../rawModel/RawModel";
import { MeshInstance, createMeshInstance } from "./MeshInstance";
import { ElementInstance, Element, createElementInstance } from "../element/Element";
import { LayoutFunctions } from "../area/LayoutFunctions";

export type ModelInstance = {
    raw: RawModel;
    config: ModelConfig;
    meshNames: string[];
    meshes: Record<string, MeshInstance>;
    meshAreas: Record<string, Area>;
    elementInstances: ElementInstance[];
    size: { x: number; y: number; z: number };
    box: BoundingRect;
};

export const createModelInstance = (
    model: RawModel,
    config: ModelConfig,
    meshStats: Record<string, MeshStats>
): ModelInstance => {
    const meshNames = model.meshes.map((mesh) => mesh.name);
    const targetSize = {
        x: model.boundingRect.sizeX,
        y: model.boundingRect.sizeY,
        z: model.boundingRect.sizeZ,
    };
    const targetRect = getBoundingRectFromMinAndSize({ x: 0, y: 0, z: 0 }, targetSize);

    const meshes = meshNames.reduce((acc, meshName) => {
        const mesh = model.meshes.find((m) => m.name === meshName);

        if (!mesh) {
            console.error(`Mesh ${meshName} not found in model`);
            return acc;
        }

        acc[meshName] = createMeshInstance(
            model,
            mesh,
            config.meshConfig[meshName],
            meshStats[meshName],
            targetRect
        );
        return acc;
    }, {} as Record<string, MeshInstance>);

    const meshAreaKeys = Object.keys(config.meshAreas);
    const meshAreas = meshAreaKeys.reduce((acc, meshAreaKey) => {
        const meshArea = config.meshAreas[meshAreaKey];
        acc[meshAreaKey] = new Area(meshArea.layout, meshes[meshAreaKey].box);
        return acc;
    }, {} as Record<string, Area>);

    return {
        raw: model,
        config,
        meshNames,
        meshes,
        meshAreas,
        elementInstances: [],
        size: targetSize,
        box: targetRect,
    };
};

export const resizeModelInstance = (
    modelInstance: ModelInstance,
    targetDimensions: { x: number; y: number; z: number }
) => {
    const targetBoundaries = getBoundingRectFromMinAndSize({ x: 0, y: 0, z: 0 }, targetDimensions);
    const meshAreas = modelInstance.meshAreas;

    // todo: update geometry instead of creating new instances
    const meshes = modelInstance.meshNames.reduce((acc, meshName) => {
        const mesh = modelInstance.meshes[meshName].raw;

        if (!mesh) {
            console.error(`Mesh ${meshName} not found in model`);
            return acc;
        }

        acc[meshName] = createMeshInstance(
            modelInstance.raw,
            mesh,
            modelInstance.meshes[meshName].config,
            modelInstance.meshes[meshName].stats,
            targetBoundaries
        );
        return acc;
    }, {} as Record<string, MeshInstance>);

    const instances = modelInstance.elementInstances;
    for (const meshName of Object.keys(meshAreas)) {
        const area = meshAreas[meshName];

        const oldSpace = area.getSpace();
        area.applyBoundaries(meshes[meshName].box);

        const newSpace = area.getSpace();

        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const element = modelInstance.config.elements[instance.elementId];
            if (element.parentAreaName !== meshName) {
                continue;
            }

            const resizedSpace = LayoutFunctions["1axis"].resizeSpace(
                instance.area.getSpace(),
                oldSpace,
                newSpace
            );

            const childBox = area.getChildBox(resizedSpace);

            if (!childBox) {
                continue;
            }

            instances[i] = createElementInstance(
                element,
                childBox,
                modelInstance.meshes[element.meshName].raw,
                modelInstance.meshes[element.meshName].stats
            );
        }
    }

    return {
        ...modelInstance,
        meshes,
        elementInstances: instances,
        size: { ...targetDimensions },
        box: targetBoundaries,
    };
};

export const addElementInstance = (
    modelInstance: ModelInstance,
    element: Element
): ModelInstance => {
    const area = modelInstance.meshAreas[element.parentAreaName];
    const instances = modelInstance.elementInstances;
    if (!area) {
        console.error(`Area ${element.parentAreaName} not found in model`);
        return modelInstance;
    }

    const space = LayoutFunctions["1axis"].getFreeSpaceForConfig(
        area.getSpace(),
        instances.map((i) => i.area.getSpaceForLayout(area.layout)),
        element.areaConfig
    );

    if (!space) {
        console.error(`No free space for element ${element.id}`);
        return modelInstance;
    }

    const restrictedSpace = LayoutFunctions["1axis"].applyConfig(space, element.areaConfig).space;

    const childBox = area.getChildBox(restrictedSpace);
    if (!childBox) {
        console.error(`No child box for element ${element.id}`);
        return modelInstance;
    }

    const newInstance = createElementInstance(
        element,
        childBox,
        modelInstance.meshes[element.meshName].raw,
        modelInstance.meshes[element.meshName].stats
    );

    return { ...modelInstance, elementInstances: [...instances, newInstance] };
};
