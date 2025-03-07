import { useEditorState } from "@/state/editorState";
import React from "react";

export const ElementEditor = () => {
    const { elements, currentElement, updateCurrentElement, createElement, setCurrentElement } =
        useEditorState();
    const { meshAreas } = useEditorState();
    const model = useEditorState((state) => state.model);

    if (!model) {
        return <div>Loading...</div>;
    }

    return (
        <div className="border-bottom pb-2">
            <div className="d-flex flex-column gap-2 mb-3 ">
                <div>
                    <b>Элемент</b>
                </div>
                <select
                    className="form-select form-select-sm"
                    value={currentElement?.id}
                    onChange={(e) => setCurrentElement(e.target.value)}
                >
                    <option value="">Выберите элемент</option>
                    {Object.values(elements).map((element) => (
                        <option key={element.id} value={element.id}>
                            {element.name}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={createElement}>
                    Создать
                </button>
            </div>
            {currentElement && (
                <div className="d-flex flex-column gap-2">
                    <div>Название</div>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={currentElement?.name}
                        onChange={(e) =>
                            updateCurrentElement({ id: currentElement.id, name: e.target.value })
                        }
                    />
                    <div>Меш</div>
                    <select
                        className="form-select form-select-sm"
                        value={currentElement.meshName}
                        onChange={(e) =>
                            updateCurrentElement({
                                id: currentElement.id,
                                meshName: e.target.value,
                            })
                        }
                    >
                        <option value="">Выберите меш</option>
                        {model.meshes.map((mesh) => (
                            <option key={mesh.name} value={mesh.name}>
                                {mesh.name}
                            </option>
                        ))}
                    </select>
                    <div>Родительская область</div>
                    <select
                        className="form-select form-select-sm"
                        value={currentElement.parentAreaName}
                        onChange={(e) =>
                            updateCurrentElement({
                                id: currentElement.id,
                                parentAreaName: e.target.value,
                            })
                        }
                    >
                        <option value="">Выберите область</option>
                        {Object.keys(meshAreas).map((areaName) => (
                            <option key={areaName} value={areaName}>
                                {areaName}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};
