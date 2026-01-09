import React, { useState, useEffect } from "react";
import Block from "../BlockTemplate";
import "./SerialPortInit.css"; // Подключение CSS файла

interface SerialInitBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Code passed to the block
    onCodeChange: (id: string, newCode: string) => void; // Callback for code updates

}

const SerialInitBlock: React.FC<SerialInitBlockProps> = ({ id, position, onMove, code, onCodeChange }) => {
    const [baudRate, setBaudRate] = useState<number | null>(9600); // Default baud rate
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const [currentCode, setCode] = useState(`Serial.begin(${baudRate});`);

    // Захардкоженные скорости работы Serial порта
    const baudRates = [
        300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400, 250000, 500000, 1000000, 2000000,
    ];

    // Генерация кода для Serial.begin()
    const generateCode = (baudRate: number | null): string => {
        return baudRate ? `Serial.begin(${baudRate});` : "// No baud rate selected";
    };

    // Обновляем `code` при изменении скорости
    const handleBaudRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const rate = parseInt(event.target.value, 10);
        setBaudRate(rate);
        const newCode = `Serial.begin(${baudRate});`;
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
        // Обновляем `code` при изменении скорости
        if (baudRate !== null) {
            //const newCode = generateCode(baudRate);
            onMove(id, { ...position }); // Обновляем позицию, если необходимо
            //console.log(`Updated code for block ${id}: ${newCode}`);
        }
    }, [baudRate, id, position, onMove]);

    return (
        <Block
            id={id}
            type="serial-init"
            position={position}
            code={generateCode(baudRate)} // Генерация текущего кода
            onMove={isDraggingEnabled ? onMove : noop}
        >
            <div className="serial-init-block">
                <label className="serial-label">Инициализация Serial</label>
                <select
                    value={baudRate || ""}
                    onChange={handleBaudRateChange}
                    className="serial-dropdown"
                    onFocus={disableDragging}
                    onBlur={enableDragging}
                >
                    <option value="" disabled>
                        Выберите скорость
                    </option>
                    {baudRates.map((rate) => (
                        <option key={rate} value={rate}>
                            {rate} baud
                        </option>
                    ))}
                </select>
            </div>
        </Block>
    );
};

export default SerialInitBlock;
