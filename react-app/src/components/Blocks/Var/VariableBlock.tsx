import React, { useState, useEffect } from "react";
import { useVariableContext } from "./VariableContext";
import Block from "../BlockTemplate";
import './style.css';

interface VariableBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string;
    onCodeChange: (id: string, newCode: string) => void; // Callback for code updates
}

const VariableBlock: React.FC<VariableBlockProps> = ({ id, position, onMove, code, onCodeChange }) => {
    const [variableType, setVariableType] = useState("int");
    const [variableName, setVariableName] = useState(`var${id}`);
    const [currentCode, setCode] = useState(`${variableType} ${variableName};`);

    // Generate the updated code dynamically
    const generateCode = () => `${variableType} ${variableName};`;

    const typeMapping = {
        int: "Целое число",
        float: "Число с плавающей точкой",
        double: "Двойная точность",
        char: "Символ",
        string: "Строка",
        bool: "Логический тип",
    };

    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const { variables, updateVariable } = useVariableContext();

    // Update the variable in context whenever the name changes
    useEffect(() => {
        updateVariable(id, variableName);
    }, [variableName, id, updateVariable]);


    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVariableName(event.target.value);
        const newCode = `${variableType} ${event.target.value};`;
        setCode(newCode);
    
        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Notify parent
        } else {
            console.warn("onCodeChange prop is missing or not a function.");
        }
    };
    
    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setVariableType(event.target.value);
        const newCode = `${event.target.value} ${variableName};`;
        setCode(newCode);
    
        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Notify parent
        } else {
            console.warn("onCodeChange prop is missing or not a function.");
        }
    };

    // Handlers to enable/disable dragging during interactions
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    const noop = () => {}; // No operation function

    return (
        <Block
            id={id}
            type="variable"
            position={position}
            code={generateCode()} // Pass the dynamically generated code
            onMove={isDraggingEnabled ? onMove : noop}
        >
            <div className="variable-block">
                <div className="variable-row">
                    {/* Dropdown for selecting variable type */}
                    <label className="variable-type">Наименование</label>
                    <select
                        value={variableType}
                        onChange={handleTypeChange}
                        onFocus={disableDragging}
                        onBlur={enableDragging}
                        className="variable-dropdown"
                    >
                        {Object.entries(typeMapping).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>

                    {/* Search for variable name */}
                    <label className="variable-label">Тип данных</label>
                    <input
                        type="text"
                        value={variableName}
                        onChange={handleNameChange}
                        onFocus={disableDragging}
                        onBlur={enableDragging}
                        className="variable-input"
                        placeholder="Введите имя переменной"
                    />
                </div>
            </div>
        </Block>
    );
};

export default VariableBlock;
