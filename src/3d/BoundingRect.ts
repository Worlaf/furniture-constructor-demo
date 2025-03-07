import { BufferGeometry, Vector3, Vector3Like } from "three";

// todo: replace with Box3
export type BoundingRectLike = {
    min: Vector3Like;
    max: Vector3Like;
    center: Vector3Like;
    sizeX: number;
    sizeY: number;
    sizeZ: number;
};

export type BoundingRect = {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    sizeX: number;
    sizeY: number;
    sizeZ: number;
};

export const getFromMinMaxCoordinates = (
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number
) => {
    const rect = {
        min: new Vector3(minX, minY, minZ),
        max: new Vector3(maxX, maxY, maxZ),
        center: new Vector3((maxX - minX) / 2, (maxY - minY) / 2, (maxZ - minZ) / 2),
        sizeX: maxX - minX,
        sizeY: maxY - minY,
        sizeZ: maxZ - minZ,
    };

    return rect;
};

export const scaleBoundingRect = (rect: BoundingRect, scale: Vector3Like) => {
    return getFromMinMaxCoordinates(
        rect.min.x * scale.x,
        rect.min.y * scale.y,
        rect.min.z * scale.z,
        rect.max.x * scale.x,
        rect.max.y * scale.y,
        rect.max.z * scale.z
    );
};

export const getBoundingRectFromMinAndSize = (
    min: Vector3Like,
    size: Vector3Like
): BoundingRect => {
    const rect = {
        min: new Vector3(min.x, min.y, min.z),
        max: new Vector3(min.x + size.x, min.y + size.y, min.z + size.z),
        center: new Vector3((min.x + size.x) / 2, (min.y + size.y) / 2, (min.z + size.z) / 2),
        sizeX: size.x,
        sizeY: size.y,
        sizeZ: size.z,
    };

    return rect;
};

export const getBoundingRectFromBufferGeometry = (geometry: BufferGeometry) => {
    if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
    }

    const box = geometry.boundingBox!;
    return getFromMinMaxCoordinates(
        box.min.x,
        box.min.y,
        box.min.z,
        box.max.x,
        box.max.y,
        box.max.z
    );
};
