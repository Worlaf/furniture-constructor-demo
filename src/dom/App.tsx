import React, { useEffect } from "react";
import cn from "classnames";

import css from "./App.module.css";
import { Canvas } from "@react-three/fiber";
import { ModelEditor } from "@/3d/components/editor/ModelEditor";
import { useResourcesState } from "@/state/resourcesState";
import { EditorStatusBar } from "./Editor/EditorStatusBar";
import { EditorToolsColumn } from "./Editor/EditorToolsColumn";
import { RoomDemo } from "@/3d/components/demo/RoomDemo";
import { useApplicationState } from "@/state/applicationState";
import { DemoSettings } from "./Demo/DemoSettings";
export const App = () => {
    const { loadMaterialsTextures } = useResourcesState();

    const isEditor = useApplicationState((state) => state.isEditor);

    useEffect(() => {
        loadMaterialsTextures(["Wood049", "WoodFloor039", "Wallpaper002A"]);
    }, []);

    return (
        <div className={cn(css.main, "h-100 d-flex flex-column")}>
            <div className="flex-grow-1 d-flex">
                <div className="col">
                    <Canvas shadows={!isEditor}>{isEditor ? <ModelEditor /> : <RoomDemo />}</Canvas>
                </div>
                <div className="col-3 d-flex flex-column">
                    {isEditor ? <EditorToolsColumn /> : <DemoSettings />}
                </div>
            </div>
            <div className="border-top">{isEditor && <EditorStatusBar />}</div>
        </div>
    );
};
