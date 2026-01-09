import { Block } from "@/types/blocks";
import { CSSProperties, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import Style from "./blockTemplateAttachments.module.scss";
import BlockList from "../BlockList";
import BlockAttachments, { BlockAttachmentsTemplate } from "../BlockAttachments";
import BlockInput from "../BlockInput";
import { useVariables } from "@/context/variables";
import { CodeType } from "@/context/code";

interface Props {
    color: string;
    block: Block;
    deleteBlock: () => void;
    onChange: (code: CodeType | null) => void;
    codeId?: number;
    onNestedBlocksChange?: (fieldName: string, nestedBlocks: BlockAttachmentsTemplate[]) => void;
    initialNestedBlocks?: Record<string, BlockAttachmentsTemplate[]>;
}

export default function BlockTemplateAttachments({ color, block, deleteBlock, onChange, codeId, onNestedBlocksChange, initialNestedBlocks }: Props) {
    const { variables, addVariable, removeVariable, updateVariable } = useVariables();
    const [fieldValues, setFieldValues] = useState<Record<string, string | number | undefined>>({});
    const [childrenByField, setChildrenByField] = useState<Record<string, CodeType[]>>({});
    const [nestedBlocksByField, setNestedBlocksByField] = useState<Record<string, BlockAttachmentsTemplate[]>>(initialNestedBlocks || {});
    const internalCodeId = useRef<number>(codeId ?? Date.now() + Math.floor(Math.random() * 1000));
    const previousVarNameRef = useRef<string>("");

    const styleColor: CSSProperties = { outlineColor: color };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const setFieldValue = (name: string, value: string | number | undefined) => {
        setFieldValues((prev) => ({ ...prev, [name]: value }));
    };

    // Устанавливаем значения по умолчанию для предзаполненных полей
    useEffect(() => {
        block.fields.forEach((field) => {
            if (field.type === 1 && field.hardcoded && fieldValues[field.name] === undefined) {
                // Для var-type устанавливаем "Выбор" по умолчанию
                if (field.name === "var-type") {
                    setFieldValue(field.name, "Выбор");
                } else if (field.values.length > 0) {
                    setFieldValue(field.name, field.values[0]);
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block.fields]);

    // Устанавливаем "Выбор" по умолчанию для var-selector
    useEffect(() => {
        block.fields.forEach((field) => {
            if (field.type === 1 && !field.hardcoded && field.name === "var-selector" && fieldValues[field.name] === undefined) {
                setFieldValue(field.name, "Выбор");
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block.fields]);

    const isCreateVariableBlock = useMemo(() => block.block_name === "create_variable", [block.block_name]);

    // Автоматическое добавление/обновление переменной при заполнении полей
    useEffect(() => {
        if (!isCreateVariableBlock) return;

        const varName = String(fieldValues["var-name"] ?? "").trim();
        const varType = String(fieldValues["var-type"] ?? "").trim();
        const previousName = previousVarNameRef.current;

        // Не создаем переменную, если тип равен "Выбор" или имя пустое/равно "Выбор"
        if (varType === "Выбор" || !varName || varName === "Выбор") {
            // Если была переменная, удаляем её
            if (previousName && previousName !== "" && previousName !== "Выбор") {
                removeVariable(previousName);
                previousVarNameRef.current = "";
            }
            return;
        }

        // Если имя переменной заполнено и тип не "Выбор"
        if (varName) {
            const type = varType || "int";
            
            // Если имя изменилось, обрабатываем старую переменную
            if (previousName && previousName !== varName && previousName !== "" && previousName !== "Выбор") {
                const oldVarExists = variables.some(v => v.name === previousName);
                const newVarExists = variables.some(v => v.name === varName);
                
                if (oldVarExists) {
                    if (!newVarExists) {
                        // Переименовываем переменную, если новая не существует
                        updateVariable(previousName, varName, type);
                    } else {
                        // Если новая переменная уже существует, удаляем старую
                        removeVariable(previousName);
                    }
                }
            }
            
            // Добавляем или обновляем переменную
            const varExists = variables.some(v => v.name === varName);
            if (!varExists) {
                addVariable(varName, type);
            } else {
                // Обновляем тип существующей переменной, если он изменился
                const existingVar = variables.find(v => v.name === varName);
                if (existingVar && existingVar.type !== type) {
                    updateVariable(varName, varName, type);
                }
            }
            
            previousVarNameRef.current = varName;
        } else {
            // Если имя переменной очищено, удаляем её
            if (previousName && previousName !== "" && previousName !== "Выбор") {
                removeVariable(previousName);
                previousVarNameRef.current = "";
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldValues["var-name"], fieldValues["var-type"], isCreateVariableBlock]);

    const lastPayloadRef = useRef<string>("");

    // Обновляем код блока при изменении значений или детей
    useEffect(() => {
        const children = Object.values(childrenByField).flat();

        // Для блока создания переменной: не генерируем код, если тип или имя равны "Выбор"
        if (isCreateVariableBlock) {
            const varName = String(fieldValues["var-name"] ?? "").trim();
            const varType = String(fieldValues["var-type"] ?? "").trim();
            if (varType === "Выбор" || !varName || varName === "Выбор") {
                const codeData: CodeType = {
                    id: internalCodeId.current,
                    code: "",
                    children,
                };
                onChange(codeData);
                return;
            }
        }

        let code = block.default_code;
        block.fields.forEach((field) => {
            const placeholder = `%${field.name}%`;

            if (field.type === 1 || field.type === 3) {
                const value = fieldValues[field.name] ?? "";
                // Пропускаем "Выбор" в коде
                const codeValue = value === "Выбор" ? "" : String(value);
                code = code.replace(new RegExp(placeholder, "g"), codeValue);
            }

            if (field.type === 2) {
                const childCode = (childrenByField[field.name] || []).map((c) => c.code).join("\n");
                code = code.replace(new RegExp(placeholder, "g"), childCode);
            }
        });

        const childKey = children.map((c) => `${c.id}:${c.code}`).join("|");
        const payloadKey = `${code}|${childKey}`;

        if (payloadKey === lastPayloadRef.current) return;
        lastPayloadRef.current = payloadKey;

        const codeData: CodeType = {
            id: internalCodeId.current,
            code,
            children,
        };

        onChange(codeData);
    }, [block.default_code, block.fields, childrenByField, fieldValues, isCreateVariableBlock]);

    // Удаляем переменную при удалении блока
    const handleDeleteBlock = () => {
        if (isCreateVariableBlock) {
            const varName = String(fieldValues["var-name"] ?? "").trim();
            // Удаляем переменную только если имя не пустое и не равно "Выбор"
            if (varName && varName !== "Выбор") {
                removeVariable(varName);
            }
        }
        deleteBlock();
        onChange(null);
    };

    return (
        <div onDragOver={handleDragOver} className={Style.BlockTemplateAttachments} style={styleColor}>
            <div style={styleColor}>
                <p>{block.menu_name}</p>
                <div>
                    <button onClick={handleDeleteBlock}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M22.75 6.4165L22.027 18.1124C21.8423 21.1007 21.7499 22.5948 21.0009 23.669C20.6306 24.2001 20.1538 24.6483 19.6008 24.9852C18.4825 25.6665 16.9855 25.6665 13.9915 25.6665C10.9936 25.6665 9.49469 25.6665 8.37556 24.9839C7.82227 24.6465 7.34533 24.1974 6.97513 23.6655C6.22635 22.5895 6.13603 21.0933 5.95538 18.1008L5.25 6.4165"
                                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                            />
                            <path
                                d="M3.5 6.41659H24.5M18.7317 6.41659L17.9352 4.7736C17.4062 3.68222 17.1416 3.13653 16.6853 2.79619C16.5841 2.7207 16.4769 2.65355 16.3649 2.5954C15.8596 2.33325 15.2531 2.33325 14.0403 2.33325C12.797 2.33325 12.1753 2.33325 11.6616 2.60639C11.5478 2.66693 11.4391 2.7368 11.3368 2.81528C10.8752 3.1694 10.6174 3.73506 10.1017 4.86639L9.39508 6.41659"
                                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                            />
                            <path d="M11.082 19.25L11.082 12.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M16.918 19.25L16.918 12.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div style={styleColor}>
                {block.fields.map((elem, index) =>
                    elem.type === 1 ? (
                        <BlockList
                            systemTitle={elem.name}
                            title={elem.placeholder}
                            key={"block_list_" + index}
                            values={
                                elem.hardcoded
                                    ? (elem.name === "var-type" 
                                        ? ["Выбор", ...(Array.isArray(elem.values) ? elem.values.map(v => String(v)) : [])]
                                        : (Array.isArray(elem.values) 
                                            ? elem.values.map(v => String(v))
                                            : ["Пусто"]))
                                    : ["Выбор", ...variables.map((v) => `${v.name} (${v.type})`)]
                            }
                            value={fieldValues[elem.name]}
                            setValue={(newValue: string | number) => {
                                if (!elem.hardcoded && variables.length === 0 && newValue !== "Выбор") return;
                                setFieldValue(elem.name, newValue);
                            }}
                        />
                    ) : elem.type === 2 ? (
                        <BlockAttachments
                            title={elem.placeholder}
                            key={"block_attachments_" + index}
                            onChange={(children) =>
                                setChildrenByField((prev) => ({ ...prev, [elem.name]: children }))
                            }
                            onBlocksChange={(blocks) => {
                                setNestedBlocksByField((prev) => {
                                    const prevBlocks = prev[elem.name] || [];
                                    const prevKey = JSON.stringify(prevBlocks);
                                    const newKey = JSON.stringify(blocks);
                                    
                                    if (prevKey !== newKey && onNestedBlocksChange) {
                                        // Откладываем вызов до завершения рендеринга
                                        queueMicrotask(() => {
                                            onNestedBlocksChange(elem.name, blocks);
                                        });
                                    }
                                    
                                    return { ...prev, [elem.name]: blocks };
                                });
                            }}
                            onNestedBlocksChange={(blockId, nestedBlocks) => {
                                setNestedBlocksByField((prev) => {
                                    const currentBlocks = prev[elem.name] || [];
                                    const updatedBlocks = currentBlocks.map(block => 
                                        block.id === blockId 
                                            ? { ...block, nestedBlocks }
                                            : block
                                    );
                                    
                                    if (onNestedBlocksChange) {
                                        // Откладываем вызов до завершения рендеринга
                                        queueMicrotask(() => {
                                            onNestedBlocksChange(elem.name, updatedBlocks);
                                        });
                                    }
                                    
                                    return { ...prev, [elem.name]: updatedBlocks };
                                });
                            }}
                            initialBlocks={nestedBlocksByField[elem.name] || []}
                        />
                    ) : (
                        elem.type === 3 && (
                            <BlockInput
                                title={elem.placeholder}
                                systemTitle={elem.name}
                                key={"block_input_" + index}
                                value={
                                    typeof fieldValues[elem.name] === "string"
                                        ? (fieldValues[elem.name] as string)
                                        : undefined
                                }
                                onChange={(val) => setFieldValue(elem.name, val)}
                            />
                        )
                    )
                )}
            </div>
        </div>
    );
}
