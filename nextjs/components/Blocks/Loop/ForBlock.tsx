import React, { useState, useEffect } from "react";
import Block from "../BlockTemplate";
import "./ForBlock.css"; // Подключение стилей

interface ForBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    onNest: (parentId: string, childId: string) => void;
    onUnnest: (parentId: string, childId: string) => void;
    code: string;
    childrenBlocks: string[];
}

const ForBlock: React.FC<ForBlockProps> = ({
    id,
    position,
    onMove,
    onNest,
    onUnnest,
    code,
    childrenBlocks,
}) => {
    const [iterations, setIterations] = useState<number | null>(null); // Состояние для числа повторений
    const [localChildren, setLocalChildren] = useState<string[]>(childrenBlocks);

    // Синхронизация локального состояния с пропсами
    useEffect(() => {
        setLocalChildren(childrenBlocks);
    }, [childrenBlocks]);

    // Обработка изменения числа повторений
    const handleIterationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value)) {
            setIterations(value);
        }
    };

    // Обработка дропа вложенных блоков
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const childId = event.dataTransfer.getData("blockId");
        if (childId && !localChildren.includes(childId)) {
            onNest(id, childId); // Уведомляем родителя о вложении
        }
    };

    // Удаление вложенного блока
    const handleRemoveChild = (childId: string) => {
        onUnnest(id, childId); // Уведомляем родителя об удалении вложения
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    // Генерация кода
    const generateCode = () => {
        const loopCode = iterations !== null ? `for (let i = 0; i < ${iterations}; i++) {\n` : "// No iterations set\n";
        const childrenCode = localChildren.map((childId) => `    // Block ${childId}`).join("\n");
        return `${loopCode}${childrenCode}\n}`;
    };

    return (
        <Block
            id={id}
            type="for"
            position={position}
            code={generateCode()} // Генерация текущего кода
            onMove={onMove}
        >
            <div className="for-block">
                <div className="for-header">
                    <label>Количество повторений:</label>
                    <input
                        type="number"
                        value={iterations || ""}
                        onChange={handleIterationsChange}
                        placeholder="Введите число"
                        className="for-input"
                    />
                </div>
                <div
                    className="for-body"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {localChildren.length === 0 ? (
                        <p className="for-placeholder">Перетащите блоки сюда</p>
                    ) : (
                        localChildren.map((childId) => (
                            <div key={childId} className="child-block">
                                {`Block ${childId}`}
                                <button onClick={() => handleRemoveChild(childId)}>Удалить</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Block>
    );
};

export default ForBlock;
