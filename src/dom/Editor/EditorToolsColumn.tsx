import React, { useState } from "react";
import { VertexGroupsEditor } from "./VertexGroupsEditor";
import { SelectedVerticesStats } from "./SelectedVerticesStats";
import { useEditorState } from "@/state/editorState";
import { ModelStats } from "./ModelStats";
import { ResizeTest } from "./ResizeTest";
import { ElementEditor } from "./ElementEditor";
import { AreaEditor } from "./AreaEditor";
import { ElementInstanceTest } from "./ElementInstanceTest";

export const EditorToolsColumn = () => {
    const [tab, setTab] = useState<"vertexGroups" | "elementEditor">("elementEditor");
    const model = useEditorState((state) => state.model);

    if (!model) {
        return <div>Loading...</div>;
    }

    return (
        <div className="d-flex flex-column flex-grow-1">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a
                        className={`nav-link ${tab === "vertexGroups" ? "active" : ""}`}
                        aria-current="page"
                        href="#"
                        onClick={() => setTab("vertexGroups")}
                    >
                        Vertex Groups
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${tab === "elementEditor" ? "active" : ""}`}
                        href="#"
                        onClick={() => setTab("elementEditor")}
                    >
                        Elements
                    </a>
                </li>
            </ul>
            {tab === "vertexGroups" && (
                <div className="border-start flex-grow-1 p-2 fs-6">
                    <ModelStats model={model} />
                    <SelectedVerticesStats />
                    <VertexGroupsEditor />
                    <ResizeTest />
                </div>
            )}
            {tab === "elementEditor" && (
                <div className="border-start flex-grow-1 p-2 fs-6">
                    <AreaEditor />
                    <ElementEditor />
                    <ElementInstanceTest />
                </div>
            )}
        </div>
    );
};
