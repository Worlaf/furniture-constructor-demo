import { BoundingRect, getBoundingRectFromBufferGeometry } from "../BoundingRect";
import { MeshStats } from "../modelConfig/MeshStats";
import { RawMesh } from "../rawModel/RawMesh";
import { BufferGeometry } from "three";
import { RawModel } from "../rawModel/RawModel";
import { createBufferGeometry } from "../createBufferGeometry";
import { MeshConfig } from "../modelConfig/MeshConfig";

export type MeshInstance = {
    raw: RawMesh;
    config: MeshConfig;
    stats: MeshStats;
    geometry: BufferGeometry;
    isHidden: boolean;
    box: BoundingRect;
};

export const createMeshInstance = (
    model: RawModel,
    mesh: RawMesh,
    config: MeshConfig,
    stats: MeshStats,
    modelTargetBoundaries?: BoundingRect
) => {
    const geometry = !!modelTargetBoundaries
        ? createBufferGeometry(
              mesh,
              stats,
              model.boundingRect.center,
              model.boundingRect,
              modelTargetBoundaries
          )
        : mesh.getBufferGeometry();

    const box = getBoundingRectFromBufferGeometry(geometry);

    return { raw: mesh, config, stats, geometry, isHidden: config.isHidden || config.isArea, box };
};
