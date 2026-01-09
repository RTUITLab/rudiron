import React, { useState, useEffect } from "react";
import { useVariableContext } from "../Var/VariableContext";
import Block from "../BlockTemplate";
import "./ConditionBlock.css"; // Подключение CSS файла

interface IfBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Код передается в блок
    onCodeChange: (id: string, newCode: string) => void; // Колбэк для обновления кода
}

const IfBlock: React.FC<IfBlockProps> = ({
    id,
    position,
    onMove,
    code,
    onCodeChange
}) => {
    const [leftOperand, setLeftOperand] = useState<string | null>(null);
    const [operator, setOperator] = useState("==");
    const [rightOperand, setRightOperand] = useState<string | null>(null);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const { variables } = useVariableContext();

    // Получение уникальных имен переменных
    const uniqueVariables = Array.from(
        new Set(variables.map((variable) => variable.name.split(" ")[0])) // Берем только название переменной
    );

    const operators = [
        "==", "!=", ">", "<", ">=", "<=" // Операторы сравнения
    ];

    // Функция для генерации кода
    const generateCode = (
        left: string | null,
        op: string,
        right: string | null
    ): string => {
        if (left && right) {
            return `if (${left} ${op} ${right}) {\n    // TODO: Add logic\n}`;
        }
        return "// Не выбраны операнды";
    };

    // Обновление `code` при изменении операндов или оператора
    useEffect(() => {
        const newCode = generateCode(leftOperand, operator, rightOperand);
        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode);
        } else {
            console.warn("onCodeChange prop is missing or not a function.");
        }
    }, [leftOperand, operator, rightOperand, id, onCodeChange]);

    // Обработчик выбора левого операнда
    const handleLeftOperandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLeftOperand(event.target.value);
    };

    // Обработчик выбора оператора
    const handleOperatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setOperator(event.target.value);
    };

    // Обработчик выбора правого операнда
    const handleRightOperandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRightOperand(event.target.value);
    };

    // Управление перетаскиванием
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    const noop = () => {};

    return (
        <Block
            id={id}
            type="if"
            position={position}
            code={generateCode(leftOperand, operator, rightOperand)} // Генерация текущего кода
            onMove={isDraggingEnabled ? onMove : noop}
        >
            <div className="if-block">
                {/* Левый операнд */}
                <label className="if-label">Левая переменная</label>
                <select
                    value={leftOperand || ""}
                    onChange={handleLeftOperandChange}
                    className="if-dropdown"
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

                {/* Оператор */}
                <label className="if-label">Оператор</label>
                <select
                    value={operator}
                    onChange={handleOperatorChange}
                    className="if-dropdown"
                    onFocus={disableDragging}
                    onBlur={enableDragging}
                >
                    {operators.map((op) => (
                        <option key={op} value={op}>
                            {op}
                        </option>
                    ))}
                </select>

                {/* Правый операнд */}
                <label className="if-label">Правая переменная</label>
                <select
                    value={rightOperand || ""}
                    onChange={handleRightOperandChange}
                    className="if-dropdown"
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

export default IfBlock;
