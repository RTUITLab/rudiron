import React, { createContext, useContext, useState } from "react";

interface Block {
    id: string;
    type: string; // Тип блока, например, "setup", "variable", "serial-init"
    code: string; // Генерируемый код для блока
    children?: string[]; // Массив ID вложенных блоков
}

interface BlockContextProps {
    blocksArray: Block[];
    addBlock: (id: string, type: string, code: string) => void; // Добавить новый блок
    addNestedBlock: (parentId: string, childId: string) => void; // Добавить вложенный блок
    removeNestedBlock: (parentId: string, childId: string) => void; // Удалить вложенный блок
    updateBlockCode: (id: string, newCode: string) => void; // Обновить код блока
}

const BlockContext = createContext<BlockContextProps | null>(null);

export const BlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blocksArray, setBlocks] = useState<Block[]>([]);

    // Добавить новый блок
    const addBlock = (id: string, type: string, code: string) => {
        setBlocks((prev) => [...prev, { id, type, code }]);
    };

    // Добавить вложенный блок
    const addNestedBlock = (parentId: string, childId: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === parentId
                    ? {
                          ...block,
                          children: Array.from(new Set([...(block.children || []), childId])), // Используем Array.from вместо spread
                      }
                    : block
            )
        );
    };

    // Удалить вложенный блок
    const removeNestedBlock = (parentId: string, childId: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === parentId
                    ? {
                          ...block,
                          children: (block.children || []).filter((id) => id !== childId), // Удаляем по ID
                      }
                    : block
            )
        );
    };

    // Обновить код блока
    const updateBlockCode = (id: string, newCode: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === id
                    ? {
                          ...block,
                          code: newCode,
                      }
                    : block
            )
        );
    };

    return (
        <BlockContext.Provider
            value={{ blocksArray, addBlock, addNestedBlock, removeNestedBlock, updateBlockCode }}
        >
            {children}
        </BlockContext.Provider>
    );
};

export const useBlockContext = () => {
    const context = useContext(BlockContext);
    if (!context) {
        throw new Error("useBlockContext must be used within a BlockProvider");
    }
    return context;
};

export default BlockContext;
