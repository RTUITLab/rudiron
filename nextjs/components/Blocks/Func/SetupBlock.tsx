import React, { useState, useEffect } from "react";
import { useBlockContext } from "../Var/BlockContext"; // Подключение контекста
import Block from "../BlockTemplate";
import "./SetupBlock.css";

interface SetupBlockProps {
    id: string;
    position: { x: number; y: number };
    onMove: (id: string, position: { x: number; y: number }) => void;
    onNest: (parentId: string, childId: string) => void;
    onUnnest: (parentId: string, childId: string) => void;
    code: string;
    childrenBlocks: string[];
}

const SetupBlock: React.FC<SetupBlockProps> = ({
    id,
    position,
    onMove,
    onNest,
    onUnnest,
    code,
    childrenBlocks,
}) => {
    const { addNestedBlock, removeNestedBlock } = useBlockContext(); // Извлекаем методы из контекста
    const [localChildren, setLocalChildren] = useState<string[]>(childrenBlocks);

    // Синхронизация локального состояния с пропсами
    useEffect(() => {
        setLocalChildren(childrenBlocks);
    }, [childrenBlocks]);
    

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const childId = event.dataTransfer.getData("blockId");
        console.log(childId)
        console.log(event.dataTransfer.items)
        if (childId && !localChildren.includes(childId)) {
            onNest(id, childId); // Уведомляем родителя о вложении
            addNestedBlock(id, childId); // Добавляем вложение в контекст
        }
    };
    
    

    // Удаление вложенного блока
    const handleRemoveChild = (childId: string) => {
        onUnnest(id, childId); // Уведомляем родителя об удалении вложения
        removeNestedBlock(id, childId); // Удаляем вложение из контекста
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const childId = event.dataTransfer.getData("id");
        console.log(childId)
        console.log(event.dataTransfer)
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const childId = event.dataTransfer.getData("id");
        console.log(childId)
        console.log(event.dataTransfer)
    };

    return (
        <Block id={id} type="setup" position={position} code={code} onMove={onMove}>
            <div className="block-header">Инициализация</div>
            <div
                className="block-body"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {localChildren.length === 0 ? (
                    <p>Перетащите блоки сюда</p>
                ) : (
                    localChildren.map((childId) => (
                        <div key={childId} className="child-block">
                            {`Block ${childId}`}
                            <button onClick={() => handleRemoveChild(childId)}>Удалить</button>
                        </div>
                    ))
                )}
            </div>
        </Block>
    );
};

export default SetupBlock;
