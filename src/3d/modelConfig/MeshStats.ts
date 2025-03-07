// computed data to help construct geometry

import { RawMesh } from "../rawModel/RawMesh";
import { MeshConfig } from "./MeshConfig";
import { VertexGroup, VertexGroups } from "./VertexGroup";

export class MeshStats {
    meshName: string;
    // array of flags indicating if vertex (by index) belongs to a group
    verticesGroups: number[] = [];
    uvsFaces: number[] = [];
    facesToFaces: number[] = [];
    faceCount: number = 0;

    constructor(mesh: RawMesh, config: MeshConfig) {
        this.meshName = mesh.name;
        this.verticesGroups = getPositionGroupIndices(mesh, config);
        this.uvsFaces = getUvsFaces(mesh);
        this.facesToFaces = getUvFaceToFaceConnections(mesh, this.uvsFaces);
        this.faceCount = mesh.faceIndices.length / 2;
    }

    hasGroup(vertexIndex: number, group: VertexGroup) {
        const groupIndex = VertexGroups.indexOf(group);
        return this.hasGroupByIndex(vertexIndex, groupIndex);
    }

    hasGroupByIndex(vertexIndex: number, groupIndex: number) {
        return this.verticesGroups[vertexIndex * VertexGroups.length + groupIndex] === 1;
    }

    getConnectedFaces(faceIndex: number) {
        let faces: number[] = [];
        for (let i = 0; i < this.faceCount; i++) {
            if (i === faceIndex) {
                continue;
            }

            if (this.facesToFaces[faceIndex * this.faceCount + i] > 0) {
                faces.push(i);
            }
        }

        return faces;
    }

    isUvRelatedToFace(uvi: number, faceIndex: number) {
        return this.uvsFaces[uvi * this.faceCount + faceIndex] > 0;
    }
}

const getPositionGroupIndices = (mesh: RawMesh, config: MeshConfig) => {
    const verticesGroups = Array.from({ length: mesh.vertices.length * VertexGroups.length }, () => -1);

    VertexGroups.forEach((groupName) => {
        const group = config.vertexGroups[groupName];
        if (!group) {
            return;
        }

        const indices = group.vertexIndices;
        const groupIndex = VertexGroups.indexOf(groupName);

        indices.forEach((index) => {
            verticesGroups[index * VertexGroups.length + groupIndex] = 1;
        });
    });

    return verticesGroups;
};

const getUvsFaces = (mesh: RawMesh) => {
    const faceCount = mesh.faceIndices.length / 2;
    const uvsCount = mesh.uvs.length / 2;
    const uvsFaces = Array.from({ length: uvsCount * faceCount }, () => 0);

    for (let i = 0; i < mesh.faceIndices.length; i += 2) {
        const faceIndex = i / 2;
        const faceDataCount = mesh.faceIndices[i + 1];

        for (let j = 0; j < faceDataCount; j++) {
            const uvi = mesh.getAttributeIndexByFaceData(faceIndex, j, "uv");
            uvsFaces[uvi * faceCount + faceIndex]++;
        }
    }

    return uvsFaces;
};

const getUvFaceToFaceConnections = (mesh: RawMesh, uvsFaces: number[]) => {
    const faceCount = mesh.faceIndices.length / 2;
    const uvsCount = mesh.uvs.length / 2;
    const facesToFaces = Array.from({ length: faceCount * faceCount }, () => 0);

    for (let uvi = 0; uvi < uvsCount; uvi++) {
        for (let fi = 0; fi < faceCount; fi++) {
            const uvBelongsToFi = uvsFaces[uvi * faceCount + fi] > 0;
            if (!uvBelongsToFi) {
                continue;
            }

            for (let fj = fi + 1; fj < faceCount; fj++) {
                const uvBelongsToFj = uvsFaces[uvi * faceCount + fj] > 0;
                if (!uvBelongsToFj) {
                    continue;
                }

                facesToFaces[fi * faceCount + fj]++;
                facesToFaces[fj * faceCount + fi]++;
            }
        }
    }

    return facesToFaces;
};
