import { BufferGeometry } from "three";
import { Area } from "../area/Area";
import { AreaConfig } from "../area/AreaConfig";
import { BoundingRect, getFromMinMaxCoordinates } from "../BoundingRect";
import { RawMesh } from "../rawModel/RawMesh";
import { MeshStats } from "../modelConfig/MeshStats";
import { createBufferGeometry } from "../createBufferGeometry";

export type Element = {
    id: string;
    name: string;
    meshName: string;
    parentAreaName: string;

    areaConfig: AreaConfig;
};

export type ElementInstance = {
    elementId: string;
    area: Area;
    geometry: BufferGeometry;
};

export const createElementInstance = (
    element: Element,
    box: BoundingRect,
    mesh: RawMesh,
    stats: MeshStats
): ElementInstance => {
    const geometry = createBufferGeometry(
        mesh,
        stats,
        mesh.boundingRect.min,
        mesh.boundingRect,
        getFromMinMaxCoordinates(
            -box.sizeX / 2,
            -box.sizeY / 2,
            -box.sizeZ / 2,
            box.sizeX / 2,
            box.sizeY / 2,
            box.sizeZ / 2
        )
    );

    return {
        elementId: element.id,
        area: new Area({ axis: "y", type: "1axis" }, box),
        geometry,
    };
};
