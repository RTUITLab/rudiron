import React, { useState, useEffect } from "react";
import { useVariableContext } from "./VariableContext";
import Block from "../BlockTemplate";
import "./VariableSelectorBlock.css"; // Подключение CSS файла

interface VariableSelectorBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Code passed to the block
    onCodeChange: (id: string, newCode: string) => void; // Callback for code updates
}

const VariableSelectorBlock: React.FC<VariableSelectorBlockProps> = ({
    id,
    position,
    onMove,
    code,
    onCodeChange
}) => {
    const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const { variables } = useVariableContext();
    const [currentCode, setCode] = useState(`${selectedVariable}`);


    // Получение уникальных имен переменных
    const uniqueVariables = Array.from(
        new Set(variables.map((variable) => variable.name.split(" ")[0])) // Берём только название переменной
    );

    // Функция для обновления кода
    const generateCode = (variableName: string | null): string => {
        return variableName ? `${variableName};` : "// No variable selected";
    };

    // Обновляем `code` при изменении переменной
    const handleVariableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const variableName = event.target.value;
        setSelectedVariable(variableName);
        const newCode = `${event.target.value}`;
        setCode(newCode);

        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Notify parent
        } else {
            console.warn("onCodeChange prop is missing or not a function.");
        }
    };



    // Управление перетаскиванием
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    const noop = () => {};

    useEffect(() => {
        // Обновляем `code` при изменении выбранной переменной
        if (selectedVariable !== null) {
            const newCode = generateCode(selectedVariable);
            onMove(id, { ...position }); // Обновляем позицию, если необходимо
            //console.log(`Updated code for block ${id}: ${newCode}`);
        }
    }, [selectedVariable, id, position, onMove]);

    return (
        <Block
            id={id}
            type="variable-selector"
            position={position}
            code={generateCode(selectedVariable)} // Генерация текущего кода
            onMove={isDraggingEnabled ? onMove : noop}
        >
            <div className="variable-selector-block">
                <label className="variable-label">Переменная</label>
                <select
                    value={selectedVariable || ""}
                    onChange={handleVariableChange}
                    className="variable-selector-dropdown"
                    onFocus={disableDragging}
                    onBlur={enableDragging}
                >
                    <option value="" disabled>
                        Выберите переменную
                    </option>
                    {uniqueVariables.map((variableName) => (
                        <option key={variableName} value={variableName}>
                            {variableName}
                        </option>
                    ))}
                </select>
            </div>
        </Block>
    );
};

export default VariableSelectorBlock;
