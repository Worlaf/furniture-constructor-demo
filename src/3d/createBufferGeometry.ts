import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { BoundingRect } from "./BoundingRect";
import { RawMesh } from "./rawModel/RawMesh";
import { MeshStats } from "./modelConfig/MeshStats";
import { resizeVertices } from "./resizeVertices";
import { getResizedUvs } from "./resizeUvs";

export const createBufferGeometry = (raw: RawMesh, stats: MeshStats, resizeOrigin: Vector3, sourceBoundaries: BoundingRect, targetBoundaries: BoundingRect) => {
    const resizedVertices = resizeVertices(raw.vertices, resizeOrigin, sourceBoundaries, targetBoundaries, (index, groupIndex) => stats.hasGroupByIndex(index, groupIndex));

    const resizedUvs = getResizedUvs(raw, stats, resizedVertices);

    return triangulateRawMesh(raw, resizedVertices, resizedUvs);
};

const triangulateRawMesh = (raw: RawMesh, vertexBuffer: number[], uvsBuffer: number[]): BufferGeometry => {
    const triangulatedVertices: number[] = [];
    const triangulatedNormals: number[] = [];
    const triangulatedUvs: number[] = [];

    if (!raw.hasNormals) {
        console.warn("RawMesh: no normals");
    }

    if (!raw.hasUvs) {
        console.warn("RawMesh: no uvs");
    }

    const geometry = new BufferGeometry();

    let currentGroupStart = 0;
    let currentGroupMaterialIndex = raw.faceMaterials[0];

    for (let i = 0; i < raw.faceIndices.length; i += 2) {
        if (raw.faceMaterials[i] !== currentGroupMaterialIndex) {
            const vcount = triangulatedVertices.length / 3;
            geometry.addGroup(currentGroupStart, vcount - currentGroupStart, currentGroupMaterialIndex);

            currentGroupStart = vcount;
            currentGroupMaterialIndex = raw.faceMaterials[i];
        }

        const faceStartIndex = raw.faceIndices[i];
        const faceCount = raw.faceIndices[i + 1];

        const avi = raw.faceData[faceStartIndex];
        const ani = raw.faceData[faceStartIndex + 1];
        const aui = raw.faceData[faceStartIndex + 2];

        for (let j = 1; j < faceCount - 1; j++) {
            const bvi = raw.faceData[faceStartIndex + j * 3];
            const bni = raw.faceData[faceStartIndex + j * 3 + 1];
            const bui = raw.faceData[faceStartIndex + j * 3 + 2];

            const cvi = raw.faceData[faceStartIndex + (j + 1) * 3];
            const cni = raw.faceData[faceStartIndex + (j + 1) * 3 + 1];
            const cui = raw.faceData[faceStartIndex + (j + 1) * 3 + 2];

            triangulatedVertices.push(
                vertexBuffer[avi * 3],
                vertexBuffer[avi * 3 + 1],
                vertexBuffer[avi * 3 + 2],
                vertexBuffer[bvi * 3],
                vertexBuffer[bvi * 3 + 1],
                vertexBuffer[bvi * 3 + 2],
                vertexBuffer[cvi * 3],
                vertexBuffer[cvi * 3 + 1],
                vertexBuffer[cvi * 3 + 2]
            );

            triangulatedNormals.push(
                raw.normals[ani * 3],
                raw.normals[ani * 3 + 1],
                raw.normals[ani * 3 + 2],
                raw.normals[bni * 3],
                raw.normals[bni * 3 + 1],
                raw.normals[bni * 3 + 2],
                raw.normals[cni * 3],
                raw.normals[cni * 3 + 1],
                raw.normals[cni * 3 + 2]
            );

            // prettier-ignore
            triangulatedUvs.push(
              uvsBuffer[aui * 2], 
              uvsBuffer[aui * 2 + 1], 
              uvsBuffer[bui * 2], 
              uvsBuffer[bui * 2 + 1], 
              uvsBuffer[cui * 2], 
              uvsBuffer[cui * 2 + 1]);

            // triangulatedUvs.push(
            //   raw.uvs[aui * 2],
            //   raw.uvs[aui * 2 + 1],
            //   raw.uvs[bui * 2],
            //   raw.uvs[bui * 2 + 1],
            //   raw.uvs[cui * 2],
            //   raw.uvs[cui * 2 + 1]
            // );
        }
    }

    geometry.setAttribute("position", new BufferAttribute(new Float32Array(triangulatedVertices), 3));

    if (raw.hasNormals) {
        geometry.setAttribute("normal", new BufferAttribute(new Float32Array(triangulatedNormals), 3));
    }

    if (raw.hasUvs) {
        geometry.setAttribute("uv", new BufferAttribute(new Float32Array(triangulatedUvs), 2));
    }

    return geometry;
};
