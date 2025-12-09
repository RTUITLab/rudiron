import {DragEvent, useEffect, useMemo, useRef, useState} from "react";
import {Block} from "../../types/blocks";
import Style from "./blockAttachments.module.scss";
import BlockTemplateAttachments from "../BlockTemplateAttachments";
import { CodeType } from "../../context/code";

interface BlockAttachmentsTemplate {
    id: number;
    color: string;
    block: Block;
}

interface Props {
    title: string;
    onChange: (children: CodeType[]) => void;
}

export default function BlockAttachments({ title, onChange }: Props) {
    const [blockAttachments, setBlockAttachments] = useState<BlockAttachmentsTemplate[]>([]);
    const [childrenCodes, setChildrenCodes] = useState<Record<number, CodeType>>({});

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const blockData = e.dataTransfer.getData("application/json");
        if (blockData) {
            const block = JSON.parse(blockData);
            const id = Date.now() + Math.floor(Math.random() * 1000);
            setBlockAttachments((prev) => [...prev, { id, color: block.color, block: block.block }]);
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

    // Сообщаем родителю об изменениях в детях, но только при реальном изменении
    useEffect(() => {
        const payloadKey = orderedChildren.map((c) => `${c.id}:${c.code}`).join("|");
        if (payloadKey === lastPayloadRef.current) return;
        lastPayloadRef.current = payloadKey;
        onChange(orderedChildren);
    }, [orderedChildren, onChange]);

    return (
        <div className={Style.BlockAttachments}>
            <label>{title}</label>
            <div onDrop={handleDrop} onDragOver={handleDragOver}>
                {blockAttachments.map((blockAttachment, index) => (
                    <BlockTemplateAttachments
                        deleteBlock={() => {
                            setBlockAttachments((prevBlocks: BlockAttachmentsTemplate[]) =>
                                prevBlocks.filter((block) => block.id !== blockAttachment.id)
                            );
                            handleChildChange(blockAttachment.id, null);
                        }}
                        key={`block_attachments_${blockAttachment.id}`}
                        codeId={blockAttachment.id}
                        onChange={(code) => handleChildChange(blockAttachment.id, code)}
                        color={blockAttachment.color}
                        block={blockAttachment.block}
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