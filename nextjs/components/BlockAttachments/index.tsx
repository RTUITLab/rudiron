import {DragEvent, useEffect, useMemo, useRef, useState} from "react";
import {Block} from "@/types/blocks";
import Style from "./blockAttachments.module.scss";
import BlockTemplateAttachments from "../BlockTemplateAttachments";
import { CodeType } from "@/context/code";

export interface BlockAttachmentsTemplate {
    id: number;
    color: string;
    block: Block;
    nestedBlocks?: Record<string, BlockAttachmentsTemplate[]>;
}

interface Props {
    title: string;
    onChange: (children: CodeType[]) => void;
    onBlocksChange?: (blocks: BlockAttachmentsTemplate[]) => void;
    initialBlocks?: BlockAttachmentsTemplate[];
    onNestedBlocksChange?: (blockId: number, nestedBlocks: Record<string, BlockAttachmentsTemplate[]>) => void;
}

export default function BlockAttachments({ title, onChange, onBlocksChange, initialBlocks, onNestedBlocksChange }: Props) {
    const [blockAttachments, setBlockAttachments] = useState<BlockAttachmentsTemplate[]>(initialBlocks || []);
    const [childrenCodes, setChildrenCodes] = useState<Record<number, CodeType>>({});
    const [nestedBlocksByBlockId, setNestedBlocksByBlockId] = useState<Record<number, Record<string, BlockAttachmentsTemplate[]>>>({});
    const blockAttachmentsRef = useRef(blockAttachments);
    const nestedBlocksByBlockIdRef = useRef(nestedBlocksByBlockId);
    
    useEffect(() => {
        blockAttachmentsRef.current = blockAttachments;
    }, [blockAttachments]);
    
    useEffect(() => {
        nestedBlocksByBlockIdRef.current = nestedBlocksByBlockId;
    }, [nestedBlocksByBlockId]);
    
    const initialBlocksRef = useRef<string>("");
    const isInitialMountRef = useRef(true);
    const isUpdatingFromParentRef = useRef(false);

    // Нормализуем объект для стабильного сравнения
    const normalizeBlocks = (blocks: BlockAttachmentsTemplate[]) => {
        return JSON.stringify(
            blocks
                .map(b => ({
                    id: b.id,
                    color: b.color,
                    block: b.block,
                    nestedBlocks: b.nestedBlocks ? Object.keys(b.nestedBlocks)
                        .sort()
                        .reduce((acc, key) => {
                            acc[key] = b.nestedBlocks![key];
                            return acc;
                        }, {} as Record<string, BlockAttachmentsTemplate[]>) : {}
                }))
                .sort((a, b) => a.id - b.id)
        );
    };
    
    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            if (initialBlocks && initialBlocks.length > 0) {
                const initialKey = normalizeBlocks(initialBlocks);
                initialBlocksRef.current = initialKey;
                setBlockAttachments(initialBlocks);
                const nestedBlocks: Record<number, Record<string, BlockAttachmentsTemplate[]>> = {};
                initialBlocks.forEach(block => {
                    if (block.nestedBlocks) {
                        nestedBlocks[block.id] = block.nestedBlocks;
                    }
                });
                setNestedBlocksByBlockId(nestedBlocks);
            }
            return;
        }
        
        // Обновляем только если initialBlocks действительно изменились
        if (initialBlocks) {
            const normalizedInitial = normalizeBlocks(initialBlocks);
            if (normalizedInitial !== initialBlocksRef.current) {
                initialBlocksRef.current = normalizedInitial;
                isUpdatingFromParentRef.current = true;
                setBlockAttachments(initialBlocks);
                const nestedBlocks: Record<number, Record<string, BlockAttachmentsTemplate[]>> = {};
                initialBlocks.forEach(block => {
                    if (block.nestedBlocks) {
                        nestedBlocks[block.id] = block.nestedBlocks;
                    }
                });
                setNestedBlocksByBlockId(nestedBlocks);
            }
        }
    }, [initialBlocks]);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const blockData = e.dataTransfer.getData("application/json");
        if (blockData) {
            const block = JSON.parse(blockData);
            const id = Date.now() + Math.floor(Math.random() * 1000);
            setBlockAttachments((prev) => {
                return [...prev, { id, color: block.color, block: block.block, nestedBlocks: {} }];
            });
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleChildChange = (id: number, code: CodeType | null) => {
        setChildrenCodes((prev) => {
            const next = { ...prev };
            if (code) {
                next[id] = code;
            } else {
                delete next[id];
            }
            return next;
        });
    };

    const orderedChildren = useMemo(
        () =>
            blockAttachments
                .map((item) => childrenCodes[item.id])
                .filter((c): c is CodeType => !!c),
        [blockAttachments, childrenCodes]
    );

    const lastPayloadRef = useRef<string>("");

    useEffect(() => {
        const payloadKey = orderedChildren.map((c) => `${c.id}:${c.code}`).join("|");
        if (payloadKey === lastPayloadRef.current) return;
        lastPayloadRef.current = payloadKey;
        onChange(orderedChildren);
    }, [orderedChildren, onChange]);

    const lastBlocksRef = useRef<string>("");
    const isInitialMountRef2 = useRef(true);

    // Отдельный useEffect для вызова onBlocksChange после обновления blockAttachments или nestedBlocksByBlockId
    useEffect(() => {
        if (isInitialMountRef2.current) {
            isInitialMountRef2.current = false;
            return;
        }

        // Пропускаем если обновление идет от родителя
        if (isUpdatingFromParentRef.current) {
            isUpdatingFromParentRef.current = false;
            return;
        }

        if (onBlocksChange) {
            const updatedWithNested = blockAttachments.map(b => ({
                ...b,
                nestedBlocks: nestedBlocksByBlockId[b.id] || b.nestedBlocks || {}
            }));
            const normalizedKey = normalizeBlocks(updatedWithNested);
            if (normalizedKey !== lastBlocksRef.current) {
                lastBlocksRef.current = normalizedKey;
                console.log('Updating nested blocks with fieldValues:', updatedWithNested);
                onBlocksChange(updatedWithNested);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockAttachments, nestedBlocksByBlockId]);

    const handleNestedBlocksChange = (blockId: number, nestedBlocks: Record<string, BlockAttachmentsTemplate[]>) => {
        setNestedBlocksByBlockId((prev) => {
            const updated = {
                ...prev,
                [blockId]: nestedBlocks
            };
            return updated;
        });
        
        if (onNestedBlocksChange) {
            onNestedBlocksChange(blockId, nestedBlocks);
        }
    };

    return (
        <div className={Style.BlockAttachments}>
            <label>{title}</label>
            <div onDrop={handleDrop} onDragOver={handleDragOver}>
                {blockAttachments.map((blockAttachment, index) => (
                    <BlockTemplateAttachments
                        deleteBlock={() => {
                            setNestedBlocksByBlockId((prev) => {
                                const updated = { ...prev };
                                delete updated[blockAttachment.id];
                                return updated;
                            });
                            
                            setBlockAttachments((prevBlocks: BlockAttachmentsTemplate[]) => {
                                return prevBlocks.filter((block) => block.id !== blockAttachment.id);
                            });
                            
                            handleChildChange(blockAttachment.id, null);
                        }}
                        key={`block_attachments_${blockAttachment.id}`}
                        codeId={blockAttachment.id}
                        onChange={(code) => handleChildChange(blockAttachment.id, code)}
                        color={blockAttachment.color}
                        block={blockAttachment.block}
                        onNestedBlocksChange={(fieldName, nestedBlocks) => {
                            handleNestedBlocksChange(blockAttachment.id, {
                                ...(nestedBlocksByBlockId[blockAttachment.id] || {}),
                                [fieldName]: nestedBlocks
                            });
                        }}
                        initialNestedBlocks={blockAttachment.nestedBlocks || {}}
                    />
                ))}
                <div className={Style.Image}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M18 13.5V19.5M18 19.5H13.5C10.6716 19.5 9.25736 19.5 8.37868 20.3787C7.5 21.2574 7.5 22.6716 7.5 25.5M18 19.5H22.5C25.3284 19.5 26.7426 19.5 27.6213 20.3787C28.5 21.2574 28.5 22.6716 28.5 25.5"
                            stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path
                            d="M3.01299 31.5C3 31.0687 3 30.5731 3 30C3 27.8787 3 26.818 3.65901 26.159C4.31802 25.5 5.37868 25.5 7.5 25.5C9.62132 25.5 10.682 25.5 11.341 26.159C12 26.818 12 27.8787 12 30C12 30.5731 12 31.0687 11.987 31.5"
                            stroke="white" strokeWidth="2.25" strokeLinecap="round"/>
                        <path
                            d="M24.013 31.5C24 31.0687 24 30.5731 24 30C24 27.8787 24 26.818 24.659 26.159C25.318 25.5 26.3787 25.5 28.5 25.5C30.6213 25.5 31.682 25.5 32.341 26.159C33 26.818 33 27.8787 33 30C33 30.5731 33 31.0687 32.987 31.5"
                            stroke="white" strokeWidth="2.25" strokeLinecap="round"/>
                        <path
                            d="M15.4286 4.5H20.5714C23.6832 4.5 24 6.16489 24 9C24 11.8351 23.6832 13.5 20.5714 13.5H15.4286C12.3168 13.5 12 11.8351 12 9C12 6.16489 12.3168 4.5 15.4286 4.5Z"
                            stroke="white" strokeWidth="2.25"/>
                    </svg>
                    <p>{title}</p>
                </div>
            </div>
        </div>
    )
}