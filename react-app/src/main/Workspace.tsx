import React, { useState, useRef } from "react";
import Menu from "./Sidebar";
import VariableBlock from "../components/Blocks/Var/VariableBlock";
import VariableSelectorBlock from "../components/Blocks/Var/VariableSelectorBlock";
import SetupBlock from "../components/Blocks/Func/SetupBlock";
import SerialInitBlock from "../components/Blocks/SerialPort/SerialPortInit";
import PinModeBlock from "../components/Blocks/IO/PinModeBlock";
import DigitalReadBlock from "../components/Blocks/IO/DigitalReadBlock";
import DigitalWriteBlock from "../components/Blocks/IO/DigitalWriteBlock";
import LoopBlock from "../components/Blocks/Func/LoopBlock"
import DelayBlock from "../components/Blocks/Condition/DelayBlock";
import ConditionBlock from "../components/Blocks/Condition/ConditionBlock"
import ForBlock from "../components/Blocks/Loop/ForBlock"
import { useBlockContext } from "../components/Blocks/Var/BlockContext"; // Импорт контекста блоков


import "../App.css";
import Aside from "../components/Aside";

const Workspace: React.FC = () => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [blocks, setBlocks] = useState<{ id: string; position: { x: number; y: number }; element: JSX.Element }[]>([]);
    const [isWorkspaceHovered, setIsWorkspaceHovered] = useState(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const workspaceRef = useRef<HTMLDivElement>(null); // Ref for the workspace element
    const { blocksArray } = useBlockContext(); // Получаем массив блоков из контекста


    const handleMouseDownCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).classList.contains("workspace")) {
            setIsPanning(true);
            startPoint.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
        }
    };

    const handleMouseMoveCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning) {
            const newOffset = {
                x: event.clientX - startPoint.current.x,
                y: event.clientY - startPoint.current.y,
            };
            setOffset(newOffset);
        }
    };

    const handleMouseUpCanvas = () => {
        setIsPanning(false);
    };

    const { addBlock } = useBlockContext(); // Получаем метод addBlock из контекста

    const addBlockToWorkspace = (block: JSX.Element, position: { x: number; y: number }) => {
        const id = `${Date.now()}`;
        setBlocks((prevBlocks) => [
            ...prevBlocks,
            {
                id,
                position,
                element: React.cloneElement(block, {
                    id,
                    position,
                    onMove: moveBlock,
                    onCodeChange: (blockId: string, newCode: string) => {
                        updateBlockCode(blockId, newCode);
                    },
                }),
            },
        ]);

        // Добавляем блок в контекст
        addBlock(id, block.props.type || "unknown", block.props.code || "");
    };


    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsWorkspaceHovered(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        if (event.relatedTarget && (event.relatedTarget as HTMLElement).closest(".workspace") === null) {
            setIsWorkspaceHovered(false);
        }
    };

    const updateBlockCode = (id: string, newCode: string) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === id
                    ? {
                        ...block,
                        element: React.cloneElement(block.element, { code: newCode }),
                    }
                    : block
            )
        );
    };

    function extractSetupAndLoop(input: string): string {
        // Regular expressions to match setup and loop blocks
        const setupRegex = /setup\s*\(\s*\)\s*{([\s\S]*?)}/;
        const loopRegex = /loop\s*\(\s*\)\s*{([\s\S]*?)}/;
    
        // Find matches for setup and loop
        const setupMatch = input.match(setupRegex);
        const loopMatch = input.match(loopRegex);
    
        // Extract the content inside the curly braces if matches are found
        const setupContent = setupMatch ? setupMatch[0] : '';
        const loopContent = loopMatch ? loopMatch[0] : '';
    
        // Combine setup and loop contents into the desired result
        const result = `${setupContent}\n\n${loopContent}`;
    
        return result;
    }
    
    const sendCodeInParts = async (fullCode: string): Promise<void> => {
        if (!("serial" in navigator)) {
            alert("Web Serial API is not supported in this browser.");
            return;
        }
    
        // Helper function to introduce a delay
        const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
    
        let port: SerialPort | null = null;
        let writer: WritableStreamDefaultWriter | null = null;
        let reader: ReadableStreamDefaultReader | null = null;
    
        try {
            // Step 1: Request access to a serial port
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            const encoder = new TextEncoder();
            writer = port.writable!.getWriter();
            reader = port.readable?.getReader();
    
            const readResponse = async (): Promise<string | null> => {
                if (reader) {
                    try {
                        const { value, done } = await reader.read();
                        if (done || !value) return null;
                        return new TextDecoder().decode(value);
                    } catch (error) {
                        console.error("Error reading response:", error);
                        return null;
                    }
                }
                return null;
            };
    
            // Step 2: Split and parse the code
            const lines = fullCode.split("\n").map(line => line.trim());
            console.log("Parsed lines:", lines);
    
            // Extract variables
            const variables = lines.filter(line => line.match(/^\s*int\s/)); // Collect variables
    
            // Extract setup block
            const setupStartIndex = lines.findIndex(line => line.includes("setup"));
            const setupEndIndex = lines.findIndex((line, idx) => idx > setupStartIndex && line.includes("}"));
            const setup = setupStartIndex >= 0 ? lines.slice(setupStartIndex, setupEndIndex + 1).join(" ") : null;
    
            // Extract loop block
            const loopStartIndex = lines.findIndex(line => line.includes("loop"));
            const loopEndIndex = lines.findIndex((line, idx) => idx > loopStartIndex && line.includes("}"));
            const loop = loopStartIndex >= 0 ? lines.slice(loopStartIndex, loopEndIndex + 1).join(" ") : null;
    
            // Step 3: Send STOP Command
            console.log("Sending STOP");
            await writer.write(encoder.encode("STOP\r\n"));
            await delay(1500);
    
            // Step 4: Send variables one by one
            for (const variable of variables) {
                console.log("Sending variable:", variable);
                await writer.write(encoder.encode(variable + "\r\n"));
                const response = await readResponse();
                if (response) console.log("Device response:", response);
                await delay(500);
            }
    
            // Step 5: Send setup block
            if (setup) {
                console.log("Sending setup:", setup);
                await writer.write(encoder.encode("void " + setup + "\r\n"));
                const setupResponse = await readResponse();
                if (setupResponse) console.log("Device response:", setupResponse);
                await delay(500);
            } else {
                console.warn("No setup block found!");
            }
    
            // Step 6: Send loop block
            if (loop) {
                console.log("Sending loop:", loop);
                await writer.write(encoder.encode("void " + loop + "\r\n"));
                const loopResponse = await readResponse();
                if (loopResponse) console.log("Device response:", loopResponse);
                await delay(500);
            } else {
                console.warn("No loop block found!");
            }
    
            // Step 7: Send RUN Command
            console.log("Sending RUN");
            await writer.write(encoder.encode("RUN\r\n"));
            const runResponse = await readResponse();
            if (runResponse) console.log("Device response:", runResponse);
    
        } catch (error) {
            console.error("Error sending code:", error);
            alert("An error occurred while sending the code.");
        } finally {
            // Step 8: Safely close connections
            try {
                if (writer) {
                    writer.releaseLock();
                    writer = null;
                }
            } catch (writerError) {
                console.error("Error releasing writer lock:", writerError);
            }
    
            try {
                if (reader) {
                    reader.cancel(); // Cancel any ongoing read operation
                    reader.releaseLock();
                    reader = null;
                }
            } catch (readerError) {
                console.error("Error releasing reader lock:", readerError);
            }
    
            try {
                if (port) {
                    await port.close();
                    port = null;
                }
            } catch (closeError) {
                console.error("Error closing the connection:", closeError);
            }
    
            console.log("Connection closed.");
        }
    };

    const generateCode = () => {
        let setupCode = "";
        let loopCode = "";
    
        console.log("=== Начало генерации кода ===");
        console.log("Блоки в рабочей области:", blocks);
    
        // Вспомогательная функция для рекурсивной генерации кода блока
        const generateBlockCode = (blockId: string): string => {
            console.log(`Генерация кода для блока с ID: ${blockId}`);
            const block = blocks.find((b) => b.id === blockId);
    
            if (!block) {
                console.warn(`Блок с ID ${blockId} не найден.`);
                return ""; // Пропускаем, если блок не найден
            }
    
            let blockCode = block.element.props.code || ""; // Получаем код блока
            const children = block.element.props.childrenBlocks || []; // Получаем дочерние блоки
    
            console.log(`Код блока: ${blockCode}`);
            console.log(`Дочерние блоки для блока с ID ${blockId}:`, children);
    
            // Удаляем вызовы setup() и loop(), если они случайно включены
            blockCode = blockCode.replace(/setup\(\)/g, "").replace(/loop\(\)/g, "").trim();
    
            // Генерируем код для дочерних блоков рекурсивно
            const childrenCode = children
                .map((childId: string) => generateBlockCode(childId))
                .join("\n");
    
            // Если есть дочерние блоки, оборачиваем их в фигурные скобки
            if (children.length > 0) {
                return `${blockCode} {\n${childrenCode}\n}`;
            } else {
                return blockCode;
            }
        };
    
        // Обрабатываем все блоки
        blocks.forEach((block) => {
            let blockCode = generateBlockCode(block.id);
    
            // Удаляем лишние вызовы setup() и loop() из корневого уровня
            blockCode = blockCode.replace(/setup\(\)/g, "").replace(/loop\(\)/g, "").trim();
    
            // Проверяем, является ли блок инициализацией пина (например, pinMode)
            if (block.element.props.code.startsWith("pinMode")) {
                console.log(`Добавление блока в setup(): ${blockCode}`);
                setupCode += blockCode + "\n";
            } else {
                console.log(`Добавление блока в loop(): ${blockCode}`);
                loopCode += blockCode + "\n";
            }
        });
    
        // Убираем лишние пустые строки
        setupCode = setupCode.trim();
        loopCode = loopCode.trim();
    
        // Формируем итоговый код
        const finalCode = `setup() {\n${setupCode}\n}\n\nloop() {\n${loopCode}\n}`;
    
        console.log("Generated Arduino Code:\n", finalCode.trim());
        let optimizedCode: string = extractSetupAndLoop(finalCode.trim());
        console.log("Generated Arduino Code:\n", optimizedCode);
        optimizedCode += "\n\rRUN";
        sendCodeInParts(optimizedCode);
        // Возвращаем результат
        return optimizedCode;
    };
    
    
    const copyCode = async (): Promise<void> => {
        let setupCode = "";
        let loopCode = "";
    
        console.log("=== Начало генерации кода ===");
        console.log("Блоки в рабочей области:", blocks);
    
        // Вспомогательная функция для рекурсивной генерации кода блока
        const generateBlockCode = (blockId: string): string => {
            console.log(`Генерация кода для блока с ID: ${blockId}`);
            const block = blocks.find((b) => b.id === blockId);
    
            if (!block) {
                console.warn(`Блок с ID ${blockId} не найден.`);
                return ""; // Пропускаем, если блок не найден
            }
    
            let blockCode = block.element.props.code || ""; // Получаем код блока
            const children = block.element.props.childrenBlocks || []; // Получаем дочерние блоки
    
            console.log(`Код блока: ${blockCode}`);
            console.log(`Дочерние блоки для блока с ID ${blockId}:`, children);
    
            // Удаляем вызовы setup() и loop(), если они случайно включены
            blockCode = blockCode.replace(/setup\(\)/g, "").replace(/loop\(\)/g, "").trim();
    
            // Генерируем код для дочерних блоков рекурсивно
            const childrenCode = children
                .map((childId: string) => generateBlockCode(childId))
                .join("\n");
    
            // Если есть дочерние блоки, оборачиваем их в фигурные скобки
            if (children.length > 0) {
                return `${blockCode} {\n${childrenCode}\n}`;
            } else {
                return blockCode;
            }
        };
    
        // Обрабатываем все блоки
        blocks.forEach((block) => {
            let blockCode = generateBlockCode(block.id);
    
            // Удаляем лишние вызовы setup() и loop() из корневого уровня
            blockCode = blockCode.replace(/setup\(\)/g, "").replace(/loop\(\)/g, "").trim();
    
            // Проверяем, является ли блок инициализацией пина (например, pinMode)
            if (block.element.props.code.startsWith("pinMode")) {
                console.log(`Добавление блока в setup(): ${blockCode}`);
                setupCode += blockCode + "\n";
            } else {
                console.log(`Добавление блока в loop(): ${blockCode}`);
                loopCode += blockCode + "\n";
            }
        });
    
        // Убираем лишние пустые строки
        setupCode = setupCode.trim();
        loopCode = loopCode.trim();
    
        // Формируем итоговый код
        const finalCode = `setup() {\n${setupCode}\n}\n\nloop() {\n${loopCode}\n}`;

        console.log("Generated Arduino Code:\n", finalCode.trim());
        const optimizedCode: string = extractSetupAndLoop(finalCode.trim());
        console.log("Optimized Arduino Code:\n", optimizedCode);
    
        try {
            await navigator.clipboard.writeText(optimizedCode); // Copy to clipboard
            alert("Code copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy code to clipboard:", error);
            alert("Error copying code to clipboard.");
        }
    };
    

    const handleRightClick = (blockId: string, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== blockId));
    };



    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsWorkspaceHovered(false);
    };
    const blockDefinitions = [
        {
            id: "delay",
            label: "Задержка",
            createBlock: () => (
                <DelayBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code={"delay(100);"}
                    onCodeChange={updateBlockCode} // Ensure this is passed
                />
            ),
        },
        {
            id: "variable",
            label: "Объявление переменной",
            createBlock: () => (
                <VariableBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code={"int " + Date.now().toString() + " = 0;"}
                    onCodeChange={updateBlockCode} // Ensure this is passed
                />
            ),
        },
        {
            id: "variable-selector",
            label: "Выбор переменной",
            createBlock: () => (
                <VariableSelectorBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="myVariable"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "setup",
            label: "Функция инициализации",
            createBlock: () => (
                <SetupBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    code="setup()"
                    onNest={nestBlock}
                    onUnnest={unnestBlock}
                    onMove={moveBlock}
                    childrenBlocks={[]}

                />
            ),
        },
        {
            id: "loop",
            label: "Основной цикл",
            createBlock: () => (
                <LoopBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    code="loop()"
                    onNest={nestBlock}
                    onUnnest={unnestBlock}
                    onMove={moveBlock}
                    childrenBlocks={[]}

                />
            ),
        },
        {
            id: "serial-init",
            label: "Инициализация Serial",
            createBlock: () => (
                <SerialInitBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="Serial.begin(9600);"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "pinmode",
            label: "Настройка Пина",
            createBlock: () => (
                <PinModeBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="pinMode(5, OUTPUT);"
                    onCodeChange={updateBlockCode} />
            )
        },
        {
            id: "digital-read",
            label: "Чтение цифрового значения",
            createBlock: () => (
                <DigitalReadBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="digitalRead(D5);"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "digital-write",
            label: "Запись цифрового значения",
            createBlock: () => (
                <DigitalWriteBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="digitalWrite(D5, 1);"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "analog-read",
            label: "Чтение аналогового значения",
            createBlock: () => (
                <DigitalReadBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="analogRead(D5);"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "analog-write",
            label: "Запись аналогового значения",
            createBlock: () => (
                <DigitalWriteBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="analogWrite(D5, 1);"
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "if",
            label: "Условие",
            createBlock: () => (
                <ConditionBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="if "
                    onCodeChange={updateBlockCode}
                />
            ),
        },
        {
            id: "for",
            label: "Повтор N раз",
            createBlock: () => (
                <ForBlock
                    key={Date.now()}
                    id={Date.now().toString()}
                    position={{ x: 0, y: 0 }}
                    onMove={moveBlock}
                    code="for"
                    onNest={nestBlock}
                    onUnnest={unnestBlock}
                    childrenBlocks={[]}
                />
            ),
        }
    ];

    const moveBlock = (id: string, position: { x: number; y: number }) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === id ? { ...block, position } : block
            )
        );
    };

    const nestBlock = (parentId: string, childId: string) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) => {
                if (block.id === parentId) {
                    const currentChildren = block.element.props.childrenBlocks || [];
                    const uniqueChildren = Array.from(
                        new Set(currentChildren.concat(childId))
                    ); // Используем Array.from и concat
                    return {
                        ...block,
                        element: React.cloneElement(block.element, {
                            childrenBlocks: uniqueChildren,
                        }),
                    };
                }
                return block;
            })
        );
    };


    const unnestBlock = (parentId: string, childId: string) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) => {
                if (block.id === parentId) {
                    const currentChildren = block.element.props.childrenBlocks || [];
                    return {
                        ...block,
                        element: React.cloneElement(block.element, {
                            childrenBlocks: currentChildren.filter((id: string) => id !== childId),
                        }),
                    };
                }
                return block;
            })
        );
    };


    return (
        <div className="app-container" style={{ display: "flex", height: "100vh" }}>
            <div
  ref={workspaceRef} // Attach the ref to the workspace div
  className={`workspace ${isWorkspaceHovered ? "drag-over" : ""}`}
  onMouseDown={handleMouseDownCanvas}
  onMouseMove={handleMouseMoveCanvas}
  onMouseUp={handleMouseUpCanvas}
  onMouseLeave={handleMouseUpCanvas}
  onDragEnter={handleDragEnter}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  style={{
    backgroundPosition: `${offset.x}px ${offset.y}px`,
  }}
>
  {/* Render blocks */}
  {blocks.map((block) => (
    <div
      key={block.id}
      className="draggable"
      onContextMenu={(e) => handleRightClick(block.id, e)}
      style={{
        position: "absolute",
        left: block.position.x + offset.x,
        top: block.position.y + offset.y,
      }}
      data-code={block.element.props.code}
    >
      {React.cloneElement(block.element, { onCodeChange: updateBlockCode })}
    </div>
  ))}

  {/* Floating Buttons */}
  <button className="canvas-button" onClick={generateCode}>
    Generate Code
  </button>
  <button
    className="canvas-button"
    style={{ top: '60px' }} /* Adjust second button position */
    onClick={copyCode}
  >
    Copy Code
  </button>
</div>
        </div>
    );
};

export default Workspace;