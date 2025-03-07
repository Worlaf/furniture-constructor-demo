import React, { useState } from "react";
import { useEditorState } from "@/state/editorState";
export const AreaEditor = () => {
    const { meshAreas: areas, updateArea } = useEditorState();
    const [selectedAreaName, setSelectedAreaName] = useState<string | undefined>(undefined);
    const selectedArea = selectedAreaName ? areas[selectedAreaName] : undefined;

    return (
        <div className="d-flex flex-column gap-2 mb-3 border-bottom pb-3">
            <div className="mb-1">
                <div>
                    <b>Область</b>
                </div>
                <select
                    className="form-select form-select-sm"
                    value={selectedAreaName}
                    onChange={(e) => setSelectedAreaName(e.target.value)}
                >
                    <option value="">Выберите область</option>
                    {Object.keys(areas).map((area) => (
                        <option key={area} value={area}>
                            {area}
                        </option>
                    ))}
                </select>
            </div>
            {selectedAreaName && selectedArea && (
                <div>
                    <div>Layout</div>
                    <select
                        className="form-select form-select-sm"
                        value={selectedArea.layout.axis}
                        onChange={(e) => {
                            const axis = e.target.value as "x" | "y" | "z";
                            updateArea(selectedAreaName, {
                                layout: {
                                    ...selectedArea.layout,
                                    axis,
                                },
                            });
                        }}
                    >
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </div>
            )}
        </div>
    );
};
