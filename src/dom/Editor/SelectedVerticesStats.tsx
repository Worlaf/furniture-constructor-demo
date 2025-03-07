import React, { useMemo } from "react";
import { useEditorState } from "@/state/editorState";

export const SelectedVerticesStats = () => {
  const selectedVertices = useEditorState((state) => state.selectedVertices);

  const meshes = useMemo(() => {
    // unique names of meshes related to selected vertices
    return [...new Set(selectedVertices.map((v) => v.meshName))];
  }, [selectedVertices]);

  return selectedVertices.length > 0 ? (
    <div className="mb-2">
      <div>
        <b>Выбранные вершины</b>
      </div>
      <div>
        <div>Количество: {selectedVertices.length}</div>
        <div>
          <b>Меши: </b>
          {meshes.join(", ")}
        </div>
      </div>
    </div>
  ) : (
    <div className="mb-2">Вершины не выбраны</div>
  );
};
