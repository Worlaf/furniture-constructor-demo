import { Matrix4, Vector3 } from "three";
import { RawMesh } from "./RawMesh";
import * as THREE from "three";
import { BoundingRect, getFromMinMaxCoordinates } from "../BoundingRect";

export class RawModel {
  meshes: RawMesh[] = [];

  boundingRect: BoundingRect = {
    min: new Vector3(),
    max: new Vector3(),
    center: new Vector3(),
    sizeX: 0,
    sizeY: 0,
    sizeZ: 0,
  };

  applyRotation(rotation: THREE.Euler, origin: THREE.Vector3) {
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationFromEuler(rotation);

    const translationMatrix = new Matrix4();
    translationMatrix.makeTranslation(origin.x, origin.y, origin.z);

    const inverseTranslationMatrix = new Matrix4();
    inverseTranslationMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);

    const transformationMatrix = new Matrix4();
    transformationMatrix.multiplyMatrices(
      inverseTranslationMatrix,
      rotationMatrix
    );

    this.meshes.forEach((mesh) => {
      mesh.applyTransformation(transformationMatrix);
    });
  }

  computeBoundingRect() {
    let minX = this.meshes[0].vertices[0];
    let minY = this.meshes[0].vertices[1];
    let minZ = this.meshes[0].vertices[2];

    let maxX = minX;
    let maxY = minY;
    let maxZ = minZ;

    this.meshes.forEach((mesh) => {
      mesh.computeBoundingRect();

      if (mesh.boundingRect.min.x < minX) minX = mesh.boundingRect.min.x;
      if (mesh.boundingRect.min.y < minY) minY = mesh.boundingRect.min.y;
      if (mesh.boundingRect.min.z < minZ) minZ = mesh.boundingRect.min.z;

      if (mesh.boundingRect.max.x > maxX) maxX = mesh.boundingRect.max.x;
      if (mesh.boundingRect.max.y > maxY) maxY = mesh.boundingRect.max.y;
      if (mesh.boundingRect.max.z > maxZ) maxZ = mesh.boundingRect.max.z;
    });

    this.boundingRect = getFromMinMaxCoordinates(
      minX,
      minY,
      minZ,
      maxX,
      maxY,
      maxZ
    );
  }
}
