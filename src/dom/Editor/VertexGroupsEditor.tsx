import React, { useMemo, useState } from "react";
import { VertexGroup, VertexGroups } from "@/3d/modelConfig/VertexGroup";
import { useEditorState, VertexSelectionData } from "@/state/editorState";
import { updateMeshConfigVertexGroup } from "@/3d/modelConfig/MeshConfig";

const EmptyGroupVertices: Record<VertexGroup, VertexSelectionData[]> =
  VertexGroups.reduce((acc, group) => {
    acc[group] = [];
    return acc;
  }, {} as Record<VertexGroup, VertexSelectionData[]>);

export const VertexGroupsEditor = () => {
  const [selectedVertexGroup, setSelectedVertexGroup] =
    useState<VertexGroup>("Back");

  const selectedVertices = useEditorState((state) => state.selectedVertices);
  const setSelectedVertices = useEditorState(
    (state) => state.setSelectedVertices
  );

  const meshConfig = useEditorState((state) => state.meshConfig);
  const setMeshConfig = useEditorState((state) => state.setMeshConfig);

  const vertexIndicesByMeshNames = useMemo(() => {
    return selectedVertices.reduce((acc, vertex) => {
      acc[vertex.meshName] = [...(acc[vertex.meshName] || []), vertex.index];
      return acc;
    }, {} as Record<string, number[]>);
  }, [selectedVertices]);

  const groupsVertices: Record<VertexGroup, VertexSelectionData[]> =
    useMemo(() => {
      return Object.keys(meshConfig).reduce((acc, meshName) => {
        const currentMesh = meshConfig[meshName];

        return VertexGroups.reduce((acc2, group) => {
          const vertexIndices = currentMesh.vertexGroups[group].vertexIndices;
          const points = vertexIndices.map(
            (index): VertexSelectionData => ({
              meshName,
              index,
            })
          );

          return {
            ...acc2,
            [group]: [...acc2[group], ...points],
          };
        }, acc);
      }, EmptyGroupVertices);
    }, [meshConfig, selectedVertexGroup]);

  const handleUpdateVertexGroups = (action: "add" | "remove" | "set") => {
    if (!selectedVertices.length || !selectedVertexGroup) return;

    Object.entries(vertexIndicesByMeshNames).forEach(
      ([meshName, vertexIndices]) => {
        setMeshConfig(
          meshName,
          updateMeshConfigVertexGroup(
            meshConfig[meshName],
            selectedVertexGroup,
            vertexIndices,
            action
          )
        );
      }
    );
  };

  const handleUpdateSelection = (action: "set" | "add" | "remove") => {
    const groupPoints = groupsVertices[selectedVertexGroup];

    if (action === "set") {
      setSelectedVertices(groupPoints);
    } else if (action === "add") {
      setSelectedVertices([
        ...selectedVertices,
        ...groupPoints.filter(
          (point) =>
            !selectedVertices.some(
              (v) => v.index === point.index && v.meshName === point.meshName
            )
        ),
      ]);
    } else if (action === "remove") {
      setSelectedVertices(
        selectedVertices.filter(
          (point) =>
            !groupPoints.some(
              (v) => v.index === point.index && v.meshName === point.meshName
            )
        )
      );
    }
  };

  return (
    <div className="border-bottom pb-2">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex flex-row gap-1  justify-content-center">
          <button
            className="btn btn-secondary btn-sm"
            disabled={selectedVertices.length === 0}
            onClick={() => handleUpdateVertexGroups("set")}
          >
            Задать
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={selectedVertices.length === 0}
            onClick={() => handleUpdateVertexGroups("remove")}
          >
            Удалить
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={selectedVertices.length === 0}
            onClick={() => handleUpdateVertexGroups("add")}
          >
            Добавить
          </button>
        </div>
        <div className="d-flex flex-row justify-content-center">
          <span className="align-middle">в {selectedVertexGroup}</span>
        </div>
      </div>
      <div>Группы вертексов</div>
      <div className="mb-3">
        <select
          className="form-select"
          size={VertexGroups.length}
          value={selectedVertexGroup}
          onChange={(e) =>
            setSelectedVertexGroup(e.target.value as VertexGroup)
          }
        >
          {VertexGroups.map((group) => (
            <option key={group} value={group}>
              {group} ({groupsVertices[group].length})
            </option>
          ))}
        </select>
      </div>
      <div className="d-flex flex-row gap-2 justify-content-center">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleUpdateSelection("set")}
        >
          Задать
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleUpdateSelection("remove")}
        >
          Удалить
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleUpdateSelection("add")}
        >
          Добавить
        </button>
      </div>
      <div className="d-flex flex-row gap-2 justify-content-center">
        К выделению
      </div>
    </div>
  );
};
