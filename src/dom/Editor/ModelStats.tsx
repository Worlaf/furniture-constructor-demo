import { round } from "@/3d/math";
import { RawModel } from "@/3d/rawModel/RawModel";
import { useEditorState } from "@/state/editorState";
import React, { useMemo } from "react";

import cn from "classnames";

type ModelStatsProps = {
  className?: string;
  model: RawModel;
};

export const ModelStats = ({ className, model }: ModelStatsProps) => {
  const selectedMesh = useEditorState((state) => state.selectedMesh);
  const setSelectedMesh = useEditorState((state) => state.setSelectedMesh);

  const hiddenMeshes = useEditorState((state) => state.hiddenMeshes);
  const setHiddenMeshes = useEditorState((state) => state.setHiddenMeshes);
  const meshConfig = useEditorState((state) => state.meshConfig);
  const setMeshConfig = useEditorState((state) => state.setMeshConfig);

  const mesh = useMemo(() => {
    return model.meshes.find((m) => m.name === selectedMesh);
  }, [model, selectedMesh]);

  return (
    <div className={cn(className, "border-bottom pb-2")}>
      <div className="mb-2">
        <div>
          <b>Модель</b>
        </div>
        x y z: {round(model.boundingRect.sizeX)}{" "}
        {round(model.boundingRect.sizeY)} {round(model.boundingRect.sizeZ)}
      </div>
      <div className="mb-2 d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setHiddenMeshes(model.meshes.map((mesh) => mesh.name))}
        >
          Скрыть все
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setHiddenMeshes([])}
        >
          Показать все
        </button>
      </div>
      <select
        className="form-select form-select-sm"
        value={selectedMesh}
        onChange={(e) => setSelectedMesh(e.target.value)}
      >
        <option value="">Выберите меш</option>
        {model.meshes.map((mesh) => (
          <option key={mesh.name} value={mesh.name}>
            {mesh.name}
          </option>
        ))}
      </select>
      {mesh && (
        <div className="mt-2 mb-2">
          <div>
            <b>Свойства</b>
          </div>
          <div>
            x y z: {round(mesh.boundingRect.sizeX)}{" "}
            {round(mesh.boundingRect.sizeY)} {round(mesh.boundingRect.sizeZ)}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              checked={hiddenMeshes.includes(mesh.name)}
              onChange={(e) =>
                setHiddenMeshes(
                  e.target.checked
                    ? [...hiddenMeshes, mesh.name]
                    : hiddenMeshes.filter((name) => name !== mesh.name)
                )
              }
            />
            Скрыть в редакторе
          </div>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              checked={meshConfig[mesh.name].isHidden}
              onChange={(e) =>
                setMeshConfig(mesh.name, {
                  ...meshConfig[mesh.name],
                  isHidden: e.target.checked,
                })
              }
            />
            Скрыть в рендере
          </div>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              checked={meshConfig[mesh.name].isArea}
              onChange={(e) =>
                setMeshConfig(mesh.name, {
                  ...meshConfig[mesh.name],
                  isArea: e.target.checked,
                })
              }
            />
            Пространство
          </div>
        </div>
      )}
    </div>
  );
};
