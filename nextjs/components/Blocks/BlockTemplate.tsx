import React, { useRef, useEffect, useState } from "react";
// import '@/style/vars.css';
// import '@/style/fonts.css';

interface BlockProps {
    id: string;
    type: string;
    position: { x: number; y: number };
    children?: React.ReactNode;
    code: string;
    onMove: (id: string, position: { x: number; y: number }) => void;
}

const Block: React.FC<BlockProps> = ({ id, type, position, children, code, onMove }) => {
    const blockRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 }); // Начальная позиция блока
    const [currentOffset, setCurrentOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: React.MouseEvent) => {
        setDragging(true);
        document.body.classList.add("dragging");

        const rect = blockRef.current!.getBoundingClientRect();

        // Устанавливаем начальное смещение
        setCurrentOffset({
            x: event.clientX,
            y: event.clientY,
        });

        // Сохраняем начальные координаты блока
        setStartPosition({
            x: position.x,
            y: position.y,
        });
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (dragging) {
            const deltaX = event.clientX - currentOffset.x; // Смещение от текущей позиции
            const deltaY = event.clientY - currentOffset.y;

            const newX = startPosition.x + deltaX - position.x;
            const newY = startPosition.y + deltaY - position.y;

            // Вызываем onMove только если положение блока изменилось
            onMove(id, { x: startPosition.x + deltaX, y: startPosition.y + deltaY });
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        if (dragging) {
            setDragging(false);
            document.body.classList.remove("dragging");

            const target = document.elementFromPoint(event.clientX, event.clientY);
            if (target && target.classList.contains("block-body")) {
                const container = target as HTMLElement;
                container.appendChild(blockRef.current!);

                // Сбрасываем стили позиции для вложенных блоков
                blockRef.current!.style.position = "relative";
                blockRef.current!.style.left = "0";
                blockRef.current!.style.top = "0";

                adjustBlockSize(container); // Обновляем размер контейнера
            }
        }
    };

    const adjustBlockSize = (container: HTMLElement) => {
        const parentBlock = container.closest(".draggable") as HTMLElement;
        if (parentBlock) {
            const contentHeight = container.scrollHeight + 20; // Учитываем внутренний отступ
            parentBlock.style.height = `${contentHeight}px`;
        }
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, currentOffset, startPosition, position]);

    return (
        <div
            ref={blockRef}
            className={`draggable block ${type}`}
            style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                cursor: dragging ? "grabbing" : "grab",
                userSelect: "none",
                padding: "8px",
                borderRadius: "20px",
                color: "#fff", // Белый текст
                border: "none", // Убираем любую обводку
                boxShadow: dragging
                    ? "0px 4px 6px rgba(0, 0, 0, 0.2)" // Тень при перетаскивании (мягкий эффект)
                    : "none", // Убираем тень, когда не перетаскиваем
                transition: dragging
                    ? "none"
                    : "box-shadow 0.2s ease, transform 0.2s ease", // Плавный эффект при отпускании
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="block-content">{children || type}</div>
        </div>
    );
    
};

export default Block;