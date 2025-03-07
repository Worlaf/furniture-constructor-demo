import { useEditorState } from "@/state/editorState";
import React from "react";

export const ElementInstanceTest = () => {
    const {
        elementInstanceTest,
        setElementInstanceTest,
        createElementInstance,
        clearElementInstances,
        currentElement,
        elements,
        modelInstance,
    } = useEditorState();

    return (
        <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center gap-2">
                <input
                    type="checkbox"
                    checked={elementInstanceTest}
                    onChange={(e) => setElementInstanceTest(e.target.checked)}
                />
                <label>Тест элементов</label>
            </div>
            {currentElement && (
                <>
                    <div>Выбранный элемент: {currentElement.name}</div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => createElementInstance(currentElement.id)}
                    >
                        Создать экземпляр
                    </button>
                </>
            )}
            <button className="btn btn-primary btn-sm" onClick={clearElementInstances}>
                Очистить экземпляры
            </button>
            <div>
                {modelInstance &&
                    modelInstance.elementInstances.map((instance, index) => (
                        <div key={index}>
                            [{index}]: {elements[instance.elementId].name}
                        </div>
                    ))}
            </div>
        </div>
    );
};
