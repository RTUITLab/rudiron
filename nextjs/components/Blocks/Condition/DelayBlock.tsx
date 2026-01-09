import React, { useState, useEffect } from "react";
import Block from "../BlockTemplate";
import "./DelayBlock.css"; // Стили для блока

interface DelayBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Генерируемый код
    onCodeChange: (id: string, newCode: string) => void; // Callback для обновления кода
}

const DelayBlock: React.FC<DelayBlockProps> = ({
    id,
    position,
    onMove,
    code,
    onCodeChange,
}) => {
    const [delayValue, setDelayValue] = useState<string>(""); // Состояние для хранения введенного значения
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);

    // Генерация кода `delay(value);`
    const generateCode = (value: string): string => {
        return value ? `delay(${value});` : "// No delay value set";
    };

    // Обработка изменения значения задержки
    const handleDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setDelayValue(value);

        const newCode = generateCode(value);
        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Сообщение родителю о смене кода
        }
    };

    // Управление перетаскиванием
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    useEffect(() => {
        // Обновляем код, если значение задержки изменяется
        if (delayValue) {
            const newCode = generateCode(delayValue);
            onMove(id, { ...position });
        }
    }, [delayValue, id, position, onMove]);

    return (
        <Block
            id={id}
            type="delay"
            position={position}
            code={generateCode(delayValue)} // Генерация текущего кода
            onMove={isDraggingEnabled ? onMove : () => { }}
        >
            <div className={`delay-block ${delayValue ? "" : "error"}`}>
                <label className="delay-value-label">Значение задержки</label>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <input
                        type="number"
                        value={delayValue}
                        onChange={handleDelayChange}
                        className="delay-value-input"
                        placeholder="Введите значение"
                    />
                    <span className="delay-value-unit">мс</span>
                </div>
            </div>

        </Block>
    );
};

export default DelayBlock;
