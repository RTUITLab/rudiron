import React, { useState, useEffect } from "react";
import Block from "../BlockTemplate";
import "./PinModeBlock.css"; // Подключение CSS файла

interface PinModeBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    code: string; // Code passed to the block
    onCodeChange: (id: string, newCode: string) => void; // Callback for code updates
}

const PinModeBlock: React.FC<PinModeBlockProps> = ({
    id,
    position,
    onMove,
    code,
    onCodeChange
}) => {
    const [selectedPin, setSelectedPin] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const [currentCode, setCode] = useState(`pinMode(${selectedPin}, ${selectedMode})`);

    // Arduino pin options
    const availablePins = ["5", "7", "35", "31", "32"];
    const pinModes = ["INPUT", "OUTPUT", "INPUT_PULLUP", "INPUT_PULLDOWN"];

    // Generate the Arduino pinMode code
    const generateCode = (pin: string | null, mode: string | null): string => {
        return pin && mode ? `pinMode(${pin}, ${mode});` : "// No pin or mode selected";
    };

    // Handle pin selection change
    const handlePinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const pin = event.target.value;
        setSelectedPin(pin);
        const newCode = generateCode(pin, selectedMode);
        setCode(newCode);

        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Notify parent
        }
    };

    // Handle mode selection change
    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = event.target.value;
        setSelectedMode(mode);
        const newCode = generateCode(selectedPin, mode);
        setCode(newCode);

        if (typeof onCodeChange === "function") {
            onCodeChange(id, newCode); // Notify parent
        }
    };

    // Manage dragging state
    const disableDragging = () => setIsDraggingEnabled(false);
    const enableDragging = () => setIsDraggingEnabled(true);

    const noop = () => {};

    useEffect(() => {
        // Update code whenever selectedPin or selectedMode changes
        if (selectedPin !== null && selectedMode !== null) {
            const newCode = generateCode(selectedPin, selectedMode);
            onMove(id, { ...position }); // Optionally update position
            //console.log(`Updated code for block ${id}: ${newCode}`);
        }
    }, [selectedPin, selectedMode, id, position, onMove]);

    return (
        <Block
            id={id}
            type="pin-mode"
            position={position}
            code={generateCode(selectedPin, selectedMode)} // Generate current code
            onMove={isDraggingEnabled ? onMove : noop}
        >
            <div className="pin-mode-block">
                <div className="pin-mode-row">
                    <div className="pin-selector">
                        <label className="pin-label">Пин</label>
                        <select
                            value={selectedPin || ""}
                            onChange={handlePinChange}
                            className="pin-selector-dropdown"
                            onFocus={disableDragging}
                            onBlur={enableDragging}
                        >
                            <option value="">
                                Выберите пин
                            </option>
                            {availablePins.map((pin) => (
                                <option key={pin} value={pin}>
                                    {pin}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mode-selector">
                        <label className="mode-label">Режим</label>
                        <select
                            value={selectedMode || ""}
                            onChange={handleModeChange}
                            className="mode-selector-dropdown"
                            onFocus={disableDragging}
                            onBlur={enableDragging}
                        >
                            <option value="" disabled>
                                Выберите режим
                            </option>
                            {pinModes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </Block>
    );
};

export default PinModeBlock;
