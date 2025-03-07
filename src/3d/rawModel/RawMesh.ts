import { BufferGeometry, Vector3, Euler, Matrix4, Vector2 } from "three";
import { BufferAttribute } from "three";
import { BoundingRect, getFromMinMaxCoordinates } from "../BoundingRect";

export class RawMesh {
    name: string = "";
    vertices: number[] = [];
    normals: number[] = [];
    uvs: number[] = [];
    hasNormals: boolean = false;
    hasUvs: boolean = false;

    // [vertex index, normal index, uv index ...] for all faces
    faceData: number[] = [];

    // [face data start index, face data count] for all faces
    faceIndices: number[] = [];

    faceMaterials: number[] = [];

    materials: string[] = [];

    boundingRect: BoundingRect = {
        min: new Vector3(),
        max: new Vector3(),
        center: new Vector3(),
        sizeX: 0,
        sizeY: 0,
        sizeZ: 0,
    };

    getAttributeIndexByFaceData(faceIndex: number, pointIndex: number, attribute: "vertex" | "normal" | "uv") {
        const faceStartIndex = this.faceIndices[faceIndex * 2];
        const faceCount = this.faceIndices[faceIndex * 2 + 1];

        if (pointIndex < 0 || pointIndex >= faceCount) {
            console.error("RawMesh: point index out of bounds");
            return -1;
        }

        if (attribute === "vertex") {
            return this.faceData[faceStartIndex + pointIndex * 3];
        } else if (attribute === "normal") {
            return this.faceData[faceStartIndex + pointIndex * 3 + 1];
        } else if (attribute === "uv") {
            return this.faceData[faceStartIndex + pointIndex * 3 + 2];
        }

        return -1;
    }

    applyTransformation(transformationMatrix: Matrix4) {
        const v = new Vector3();

        for (let i = 0; i < this.vertices.length; i += 3) {
            v.set(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);

            v.applyMatrix4(transformationMatrix);

            this.vertices[i] = v.x;
            this.vertices[i + 1] = v.y;
            this.vertices[i + 2] = v.z;
        }
    }

    getBufferGeometry(): BufferGeometry {
        const triangulatedVertices: number[] = [];
        const triangulatedNormals: number[] = [];
        const triangulatedUvs: number[] = [];

        if (!this.hasNormals) {
            console.warn("RawMesh: no normals");
        }

        if (!this.hasUvs) {
            console.warn("RawMesh: no uvs");
        }

        const geometry = new BufferGeometry();

        let currentGroupStart = 0;
        let currentGroupMaterialIndex = this.faceMaterials[0];

        for (let i = 0; i < this.faceIndices.length; i += 2) {
            if (this.faceMaterials[i] !== currentGroupMaterialIndex) {
                const vcount = triangulatedVertices.length / 3;
                geometry.addGroup(currentGroupStart, vcount - currentGroupStart, currentGroupMaterialIndex);

                currentGroupStart = vcount;
                currentGroupMaterialIndex = this.faceMaterials[i];
            }

            const faceStartIndex = this.faceIndices[i];
            const faceCount = this.faceIndices[i + 1];

            const avi = this.faceData[faceStartIndex];
            const ani = this.faceData[faceStartIndex + 1];
            const aui = this.faceData[faceStartIndex + 2];

            for (let j = 1; j < faceCount - 1; j++) {
                const bvi = this.faceData[faceStartIndex + j * 3];
                const bni = this.faceData[faceStartIndex + j * 3 + 1];
                const bui = this.faceData[faceStartIndex + j * 3 + 2];

                const cvi = this.faceData[faceStartIndex + (j + 1) * 3];
                const cni = this.faceData[faceStartIndex + (j + 1) * 3 + 1];
                const cui = this.faceData[faceStartIndex + (j + 1) * 3 + 2];

                triangulatedVertices.push(
                    this.vertices[avi * 3],
                    this.vertices[avi * 3 + 1],
                    this.vertices[avi * 3 + 2],
                    this.vertices[bvi * 3],
                    this.vertices[bvi * 3 + 1],
                    this.vertices[bvi * 3 + 2],
                    this.vertices[cvi * 3],
                    this.vertices[cvi * 3 + 1],
                    this.vertices[cvi * 3 + 2]
                );

                triangulatedNormals.push(
                    this.normals[ani * 3],
                    this.normals[ani * 3 + 1],
                    this.normals[ani * 3 + 2],
                    this.normals[bni * 3],
                    this.normals[bni * 3 + 1],
                    this.normals[bni * 3 + 2],
                    this.normals[cni * 3],
                    this.normals[cni * 3 + 1],
                    this.normals[cni * 3 + 2]
                );

                triangulatedUvs.push(this.uvs[aui * 2], this.uvs[aui * 2 + 1], this.uvs[bui * 2], this.uvs[bui * 2 + 1], this.uvs[cui * 2], this.uvs[cui * 2 + 1]);
            }
        }

        geometry.setAttribute("position", new BufferAttribute(new Float32Array(triangulatedVertices), 3));

        if (this.hasNormals) {
            geometry.setAttribute("normal", new BufferAttribute(new Float32Array(triangulatedNormals), 3));
        }

        if (this.hasUvs) {
            geometry.setAttribute("uv", new BufferAttribute(new Float32Array(triangulatedUvs), 2));
        }

        return geometry;
    }

    getPoints(): Vector3[] {
        const points: Vector3[] = [];

        for (let i = 0; i < this.vertices.length; i += 3) {
            points.push(new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));
        }

        return points;
    }

    computeBoundingRect() {
        let minX = this.vertices[0];
        let minY = this.vertices[1];
        let minZ = this.vertices[2];

        let maxX = minX;
        let maxY = minY;
        let maxZ = minZ;

        for (let i = 0; i < this.vertices.length; i += 3) {
            const x = this.vertices[i];
            const y = this.vertices[i + 1];
            const z = this.vertices[i + 2];

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        this.boundingRect = getFromMinMaxCoordinates(minX, minY, minZ, maxX, maxY, maxZ);
    }
}
