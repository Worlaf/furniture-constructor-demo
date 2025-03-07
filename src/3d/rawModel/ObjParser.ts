import { RawMesh } from "./RawMesh";
import { RawModel } from "./RawModel";

const _face_vertex_data_separator_pattern = /\s+/;

export class ObjParser {
  #model: RawModel = new RawModel();
  #currentMesh: RawMesh | undefined;
  #smoothing: boolean = false;
  #currentMaterial: string | undefined;
  #currentMeshMaterialIndex: number = -1;
  #vertexCounter: number = 0;
  #normalCounter: number = 0;
  #uvCounter: number = 0;

  parse(content: string): RawModel {
    this.#model = new RawModel();

    if (content.indexOf("\r\n") !== -1) {
      // This is faster than String.split with regex that splits on both
      content = content.replace(/\r\n/g, "\n");
    }

    if (content.indexOf("\\\n") !== -1) {
      // join lines separated by a line continuation character (\)
      content = content.replace(/\\\n/g, "");
    }

    const lines = content.split("\n");

    for (const line of lines) {
      this.#parseLine(line);
    }

    console.log({ model: this.#model });

    return this.#model;
  }

  #parseLine(line: string) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") return;

    const lineFirstChar = trimmedLine[0];

    if (lineFirstChar === "#") return; // skip comments

    if (lineFirstChar === "v") {
      this.#parseVertex(trimmedLine);
    } else if (lineFirstChar === "o") {
      this.#startMesh(trimmedLine.substring(2));
    } else if (lineFirstChar === "f") {
      this.#parseFace(trimmedLine);
    } else if (lineFirstChar === "s") {
      const smoothingValue = parseInt(trimmedLine.substring(2));
      this.#smoothing = smoothingValue !== 0;
      console.warn("ObjParser: Smoothing is not supported yet");
    } else if (trimmedLine.startsWith("usemtl ")) {
      this.#startMaterial(trimmedLine.substring(7));
    } else if (trimmedLine.startsWith("mtllib ")) {
      console.warn("ObjParser: Material library is not supported yet");
    } else if (trimmedLine.startsWith("g ")) {
      console.warn("ObjParser: Group is not supported yet");
    } else {
      console.warn(`ObjParser: Unknown line: ${trimmedLine}`);
    }
  }

  #parseVertex(line: string) {
    if (!this.#currentMesh) {
      console.error("ObjParser: No mesh to add vertex to");
      return;
    }

    const parts = line.split(_face_vertex_data_separator_pattern);

    switch (parts[0]) {
      case "v":
        this.#currentMesh.vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
        break;
      case "vn":
        this.#currentMesh.normals.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
        break;
      case "vt":
        this.#currentMesh.uvs.push(parseFloat(parts[1]), parseFloat(parts[2]));
        break;
    }
  }

  // f 16/1/1 8/2/1 3/3/1 12/4/1
  // f v1/vt1 v2/vt2 v3/vt3 ...
  // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
  // f v1//vn1 v2//vn2 v3//vn3 ...
  #parseFace(line: string) {
    if (!this.#currentMesh) {
      console.error("ObjParser: No mesh to add face to");
      return;
    }

    const parts = line
      .substring(2)
      .split(_face_vertex_data_separator_pattern)
      .filter((part) => part.length > 0)
      .map((part) => part.split("/"))
      .map((indices) =>
        indices.map((index) => (index.length > 0 ? parseInt(index) : -1))
      )
      .filter((indices) => indices.length > 0);

    if (parts.length === 0) {
      console.error("ObjParser: No face data found");
      return;
    }

    this.#currentMesh.faceMaterials.push(this.#currentMeshMaterialIndex);
    this.#currentMesh.faceIndices.push(
      this.#currentMesh.faceData.length,
      parts.length
    );

    for (let i = 0; i < parts.length; i++) {
      const indices = parts[i];

      const vertexIndex = indices[0];
      const uvIndex = indices.length > 1 ? indices[1] : -1;
      const normalIndex = indices.length > 2 ? indices[2] : -1;

      if (uvIndex !== -1) {
        this.#currentMesh.hasUvs = true;
      }

      if (normalIndex !== -1) {
        this.#currentMesh.hasNormals = true;
      }

      this.#currentMesh.faceData.push(
        vertexIndex - 1 - this.#vertexCounter,
        normalIndex - 1 - this.#normalCounter,
        uvIndex - 1 - this.#uvCounter
      );
    }
  }

  #startMesh(name: string) {
    if (this.#currentMesh) {
      this.#vertexCounter += this.#currentMesh.vertices.length / 3;
      this.#normalCounter += this.#currentMesh.normals.length / 3;
      this.#uvCounter += this.#currentMesh.uvs.length / 2;
    }

    this.#currentMesh = new RawMesh();
    this.#currentMesh.name = name;

    this.#model.meshes.push(this.#currentMesh);

    if (this.#currentMaterial) {
      this.#startMaterial(this.#currentMaterial);
    }
  }

  #startMaterial(name: string) {
    if (!this.#currentMesh) {
      console.error("ObjParser: No mesh to add material to");
      return;
    }

    this.#currentMesh.materials.push(name);
    this.#currentMaterial = name;
    this.#currentMeshMaterialIndex = this.#currentMesh.materials.length - 1;
  }
}
