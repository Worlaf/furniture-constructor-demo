import React from "react";
import { useDemoState } from "@/state/demoState";
export const DemoSettings: React.FC = () => {
    const instance = useDemoState((state) => state.instance);
    const model = useDemoState((state) => state.model);
    const resizeInstance = useDemoState((state) => state.resizeInstance);
    const addElementInstance = useDemoState((state) => state.addElementInstance);

    if (!instance || !model) {
        return <div>Loading...</div>;
    }

    const renderSizeInput = (label: string, axis: "x" | "y" | "z") => {
        return (
            <div className="mb-3">
                <label className="form-label">{label}</label>
                <input
                    type="number"
                    step={0.1}
                    value={instance.size[axis]}
                    className="form-control"
                    onChange={(e) =>
                        resizeInstance({ ...instance.size, [axis]: Number(e.target.value) })
                    }
                />
            </div>
        );
    };

    return (
        <div className="p-3 border-start">
            {renderSizeInput("Глубина", "x")}
            {renderSizeInput("Высота", "y")}
            {renderSizeInput("Ширина", "z")}
            {Object.values(model.config.elements).map((element) => {
                return (
                    <button
                        key={element.id}
                        className="btn btn-primary"
                        onClick={() => addElementInstance(element)}
                    >
                        Добавить элемент "{element.name}"
                    </button>
                );
            })}
            <div>
                {instance.elementInstances.map((instance, index) => {
                    const element = model.config.elements[instance.elementId];

                    return <div key={index}>{element.name}</div>;
                })}
            </div>
        </div>
    );
};
