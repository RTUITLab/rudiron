import React, { useState, useEffect } from "react";
import Block from "../BlockTemplate";
import "./AnalogReadBlock.css"; // Стили для блока

interface AnalogReadBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Генерируемый код
    onCodeChange: (id: string, newCode: string) => void; // Callback для обновления кода
}

const AnalogReadBlock: React.FC<AnalogReadBlockProps> = ({
    id,
    position,
    onMove,
    code,
    onCodeChange,
}) => {
    const [selectedPin, setSelectedPin] = useState<string | null>(null);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);

    // Доступные пины для Arduino
    const availablePins = ["5", "7", "35", "31", "32"];

    // Генерация кода `digitalRead(pin)`
    const generateCode = (pin: string | null): string => {
        return pin ? `anaolgRead(${pin});` : "// No pin selected";
    };

    // Обновление выбранного пина
    const handlePinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const pin = event.target.value;
        setSelectedPin(pin);

        const newCode = generateCode(pin);
        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Сообщение родителю о смене кода
        }
    };

    // Управление перетаскиванием
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    useEffect(() => {
        // Обновляем код, если выбранный пин изменяется
        if (selectedPin) {
            const newCode = generateCode(selectedPin);
            onMove(id, { ...position });
        }
    }, [selectedPin, id, position, onMove]);

    return (
        <Block
            id={id}
            type="digital-read"
            position={position}
            code={generateCode(selectedPin)} // Генерация текущего кода
            onMove={isDraggingEnabled ? onMove : () => {}}
        >
            <div className="digital-read-block">
                <label className="digital-read-pin-label">Пин</label>
                <select
                    value={selectedPin || ""}
                    onChange={handlePinChange}
                    className="digital-read-pin-selector-dropdown"
                    onFocus={disableDragging}
                    onBlur={enableDragging}
                >
                    <option value="" disabled>
                        Выберите пин
                    </option>
                    {availablePins.map((pin) => (
                        <option key={pin} value={pin}>
                            {pin}
                        </option>
                    ))}
                </select>
            </div>
        </Block>
    );
};

export default AnalogReadBlockProps;
