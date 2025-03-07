import React from "react";
import { useResourcesState } from "@/state/resourcesState";
import { useEditorState } from "@/state/editorState";
export const EditorStatusBar = () => {
    const { loadingProgress } = useResourcesState();
    const saveModelConfig = useEditorState((state) => state.saveModelConfig);

    return (
        <div className="d-flex gap-2">
            <span>Загрузка: {loadingProgress}%</span>
            <button onClick={() => saveModelConfig()}>Сохранить</button>
        </div>
    );
};
