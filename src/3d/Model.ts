import { RawModel } from "./rawModel/RawModel";
import { createMeshConfig, MeshConfig } from "./modelConfig/MeshConfig";
import { Vector3 } from "three";
import { BoundingRect } from "./BoundingRect";
import { RawMesh } from "./rawModel/RawMesh";

export class Model {
  raw: RawModel;
  meshConfig: Record<string, MeshConfig>;

  constructor(raw: RawModel) {
    this.raw = raw;
    this.meshConfig = {};
    raw.meshes.forEach((mesh) => {
      this.meshConfig[mesh.name] = createMeshConfig(mesh);
    });
  }
}
