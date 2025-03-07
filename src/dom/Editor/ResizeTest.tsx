import { useEditorState } from "@/state/editorState";
import React from "react";

export const ResizeTest: React.FC = () => {
  const resizeTest = useEditorState((state) => state.resizeTest);
  const resizeTargetDimensions = useEditorState(
    (state) => state.resizeTargetDimensions
  );

  const setResizeTest = useEditorState((state) => state.setResizeTest);
  const setResizeTargetDimensions = useEditorState(
    (state) => state.setResizeTargetDimensions
  );

  return (
    <div className="border-bottom pb-2">
      <div className="d-flex flex-row gap-2">
        <input
          type="checkbox"
          checked={resizeTest}
          onChange={() => setResizeTest(!resizeTest)}
        />
        Тест размеров
      </div>
      <div className="d-flex flex-column gap-2">
        <input
          type="number"
          value={resizeTargetDimensions.x}
          onChange={(e) =>
            setResizeTargetDimensions({
              ...resizeTargetDimensions,
              x: Number(e.target.value),
            })
          }
        />
        <input
          type="number"
          value={resizeTargetDimensions.y}
          onChange={(e) =>
            setResizeTargetDimensions({
              ...resizeTargetDimensions,
              y: Number(e.target.value),
            })
          }
        />
        <input
          type="number"
          value={resizeTargetDimensions.z}
          onChange={(e) =>
            setResizeTargetDimensions({
              ...resizeTargetDimensions,
              z: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
};
