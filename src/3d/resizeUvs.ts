import { RawMesh } from "./rawModel/RawMesh";
import { MeshStats } from "./modelConfig/MeshStats";
import { Vector2, Vector3 } from "three";
import { v2Equal } from "./math";

export const getResizedUvs = (raw: RawMesh, stats: MeshStats, resizedVertices: number[]) => {
    let faces: FaceData[] = [];
    const faceCount = raw.faceIndices.length / 2;

    for (let i = 0; i < faceCount; i++) {
        const face = getFaceData(raw, i, resizedVertices);
        UvResizeTools.resizeFace(face);
        faces.push(face);
    }

    rearrangeFaces(faces, stats);

    const uvBuffer = Array<number>(raw.uvs.length);
    writeResizedFaceUvsToBuffer(faces, uvBuffer);

    return uvBuffer;
};

type FaceData = {
    index: number;
    indexDataStart: number;
    indexDataCount: number;
    indices: number[];
    originalVertices: number[];
    resizedVertices: number[];
    originalUvs: number[];
    resizedUvs: number[];
};

const getFaceData = (raw: RawMesh, faceIndex: number, meshResizedVertices: number[]): FaceData => {
    const indexDataStart = raw.faceIndices[faceIndex * 2];
    const indexDataCount = raw.faceIndices[faceIndex * 2 + 1];

    // [vertex index, normal index, uv index ...]
    const indices = raw.faceData.slice(indexDataStart, indexDataStart + indexDataCount * 3);
    const originalVertices = Array<number>(indexDataCount * 3);
    const resizedVertices = Array<number>(indexDataCount * 3);
    const originalUvs = Array<number>(indexDataCount * 2);
    const resizedUvs = Array<number>(indexDataCount * 2);

    for (let i = 0; i < indexDataCount; i++) {
        const vertexIndex = indices[i * 3];
        const uvIndex = indices[i * 3 + 2];

        originalVertices[i * 3] = raw.vertices[vertexIndex * 3];
        originalVertices[i * 3 + 1] = raw.vertices[vertexIndex * 3 + 1];
        originalVertices[i * 3 + 2] = raw.vertices[vertexIndex * 3 + 2];

        resizedVertices[i * 3] = meshResizedVertices[vertexIndex * 3];
        resizedVertices[i * 3 + 1] = meshResizedVertices[vertexIndex * 3 + 1];
        resizedVertices[i * 3 + 2] = meshResizedVertices[vertexIndex * 3 + 2];

        originalUvs[i * 2] = raw.uvs[uvIndex * 2];
        originalUvs[i * 2 + 1] = raw.uvs[uvIndex * 2 + 1];
    }

    return {
        index: faceIndex,
        indexDataStart,
        indexDataCount,
        indices,
        originalVertices,
        resizedVertices,
        originalUvs,
        resizedUvs,
    };
};

const UvResizeTools = (() => {
    const vo0 = new Vector3();
    const vr0 = new Vector3();
    const vo1 = new Vector3();
    const vr1 = new Vector3();
    const deltaOriginal = new Vector3();
    const deltaResized = new Vector3();

    const uvo0 = new Vector2();
    const uvr0 = new Vector2();
    const uvr1 = new Vector2();
    const uvo1 = new Vector2();
    const deltaUvOriginal = new Vector2();
    const deltaUvResized = new Vector2();

    const resizeEdge = (faceData: FaceData, edgeIndex: number, assert = false) => {
        const edgeCount = faceData.indexDataCount;
        const p0i = edgeIndex % edgeCount;
        const p1i = (edgeIndex + 1) % edgeCount;

        // // console.log(`${assert ? "Assert" : "Resize"} edge ${edgeIndex % edgeCount}/${edgeCount} [${p0i}, ${p1i}]`);

        vo0.fromArray(faceData.originalVertices, p0i * 3);
        vr0.fromArray(faceData.resizedVertices, p0i * 3);
        vo1.fromArray(faceData.originalVertices, p1i * 3);
        vr1.fromArray(faceData.resizedVertices, p1i * 3);

        uvo0.fromArray(faceData.originalUvs, p0i * 2);
        uvo1.fromArray(faceData.originalUvs, p1i * 2);

        uvr0.fromArray(faceData.resizedUvs, p0i * 2);
        if (uvr0.x === undefined || uvr0.y === undefined || isNaN(uvr0.x) || isNaN(uvr0.y)) {
            console.error(`RawMesh: uv index ${p0i} is undefined (${uvr0.x} ${uvr0.y})`);
            debugger;
            uvr0.x = uvo0.x;
            uvr0.y = uvo0.y;
        }

        deltaOriginal.subVectors(vo1, vo0);
        deltaResized.subVectors(vr1, vr0);

        deltaUvOriginal.subVectors(uvo1, uvo0);

        const factor = deltaResized.length() / deltaOriginal.length();
        deltaUvResized.copy(deltaUvOriginal).multiplyScalar(factor);

        uvr1.addVectors(uvr0, deltaUvResized);

        if (uvr1.x === undefined || uvr1.y === undefined || isNaN(uvr1.x) || isNaN(uvr1.y)) {
            console.error("Resize went wrong");
            debugger;
        }

        const x = faceData.resizedUvs[p1i * 2];
        const y = faceData.resizedUvs[p1i * 2 + 1];
        if (assert && x !== undefined && y !== undefined) {
            if (!v2Equal(uvr1, { x, y })) {
                console.error(`Resize went wrong: ${uvr1.x} ${uvr1.y} !== ${x} ${y}`);
                debugger;
            }
        }

        faceData.resizedUvs[p1i * 2] = uvr1.x;
        faceData.resizedUvs[p1i * 2 + 1] = uvr1.y;
    };

    const resizeFace = (faceData: FaceData) => {
        // // console.log(`Resize face ${faceData.index}`);
        faceData.resizedUvs[0] = faceData.originalUvs[0];
        faceData.resizedUvs[1] = faceData.originalUvs[1];

        for (let i = 0; i < faceData.indexDataCount - 1; i++) {
            resizeEdge(faceData, i);
        }

        resizeEdge(faceData, faceData.indexDataCount - 1, true);
    };

    return { resizeFace };
})();

const rearrangeFaces = (faces: FaceData[], stats: MeshStats) => {
    // console.log("Rearrange faces");

    let isFaceRearranged = Array<boolean>(faces.length).fill(false);

    for (let i = 0; i < faces.length; i++) {
        const connectedFaces = stats.getConnectedFaces(i);
        if (!connectedFaces.length) {
            isFaceRearranged[i] = true;
            // console.log(`Face ${i} is not connected to any other face`);
            continue;
        }

        const face = faces[i];
        for (let j = 0; j < connectedFaces.length; j++) {
            const connectedFace = faces[connectedFaces[j]];

            if (isFaceRearranged[connectedFace.index] && isFaceRearranged[face.index]) {
                // console.log(`Face ${connectedFace.index} and ${face.index} are already rearranged`);
                continue;
            }

            if (isFaceRearranged[connectedFace.index] && !isFaceRearranged[face.index]) {
                rearrangeFace(connectedFace, face, stats);
            } else if (!isFaceRearranged[connectedFace.index]) {
                rearrangeFace(face, connectedFace, stats);
            }
        }
    }
};

const rearrangeFace = (base: FaceData, connected: FaceData, stats: MeshStats) => {
    // console.log(`Rearrange face ${connected.index} with ${base.index}`);
    logFaceUvData(base);
    logFaceUvData(connected);

    const connectionPoints = Array<number>();
    for (let i = 0; i < base.indexDataCount; i++) {
        const baseUvi = base.indices[i * 3 + 2];

        const isConnectionPoint = stats.isUvRelatedToFace(baseUvi, connected.index);
        if (!isConnectionPoint) {
            continue;
        }

        let connectedI = -1;
        for (let j = 0; j < connected.indices.length / 3; j++) {
            const connectedUvi = connected.indices[j * 3 + 2];
            if (connectedUvi === baseUvi) {
                connectedI = j;
                break;
            }
        }

        connectionPoints.push(i, connectedI);

        // console.log(`Faces connected on uv ${baseUvi} (${i}, ${connectedI})`);
    }

    const connectionCount = connectionPoints.length / 2;
    if (connectionCount === 0) {
        // console.log("No connection points found");
        return;
    }

    if (connectionCount > 2) {
        console.warn("More than 2 connection points found");
        // debugger;
        return;
    }

    const baseI = connectionPoints[0];
    const connectedI = connectionPoints[1];

    const baseUvx = base.resizedUvs[baseI * 2];
    const baseUvy = base.resizedUvs[baseI * 2 + 1];
    const connectedUvx = connected.resizedUvs[connectedI * 2];
    const connectedUvy = connected.resizedUvs[connectedI * 2 + 1];

    const deltaX = baseUvx - connectedUvx;
    const deltaY = baseUvy - connectedUvy;

    // console.log(`Delta: ${deltaX}, ${deltaY} [${baseUvx}, ${baseUvy}] -> [${connectedUvx}, ${connectedUvy}]`);

    for (let i = 0; i < connected.resizedUvs.length; i += 2) {
        connected.resizedUvs[i] += deltaX;
        connected.resizedUvs[i + 1] += deltaY;
    }

    if (connectionCount === 2) {
        const baseI = connectionPoints[2];
        const connectedI = connectionPoints[3];

        const baseUvx = base.resizedUvs[baseI * 2];
        const baseUvy = base.resizedUvs[baseI * 2 + 1];

        const connectedUvx = connected.resizedUvs[connectedI * 2];
        const connectedUvy = connected.resizedUvs[connectedI * 2 + 1];

        if (!v2Equal({ x: baseUvx, y: baseUvy }, { x: connectedUvx, y: connectedUvy })) {
            console.error(`Base and connected uvs are not equal: ${baseUvx}, ${baseUvy} !== ${connectedUvx}, ${connectedUvy}`);
            logFaceUvData(base);
            logFaceUvData(connected);
            debugger;
        }
    }
};

const writeResizedFaceUvsToBuffer = (faces: FaceData[], uvBuffer: number[]) => {
    const uvBufferAssignment = Array<number>(uvBuffer.length / 2).fill(-1);

    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < face.resizedUvs.length / 2; j++) {
            const uvi = face.indices[j * 3 + 2];
            const uvX = face.resizedUvs[j * 2];
            const uvY = face.resizedUvs[j * 2 + 1];

            if (uvBufferAssignment[uvi] > 0) {
                // assert
                if (!v2Equal({ x: uvX, y: uvY }, { x: uvBuffer[uvi * 2], y: uvBuffer[uvi * 2 + 1] })) {
                    console.error("Inconsistent uv buffer assignment");
                    debugger;
                }
            } else {
                uvBufferAssignment[uvi] = 1;
                uvBuffer[uvi * 2] = uvX;
                uvBuffer[uvi * 2 + 1] = uvY;
            }
        }
    }
};

const logFaceUvData = (face: FaceData) => {
    // console.log(`Face ${face.index} uvs:`);

    for (let i = 0; i < face.indices.length / 3; i++) {
        const uvIndex = face.indices[i * 3 + 2];
        const ouvx = face.originalUvs[i * 2];
        const ouvy = face.originalUvs[i * 2 + 1];
        const ruvx = face.resizedUvs[i * 2];
        const ruvy = face.resizedUvs[i * 2 + 1];

        // console.log(`${uvIndex}: ${ouvx}, ${ouvy} -> ${ruvx}, ${ruvy}`);
    }
};
