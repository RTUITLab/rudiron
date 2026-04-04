import { useState, useRef } from "react";
import { Block } from "@/types/blocks";
import { type WorkspaceBlock } from "@/src/validation/blockValidator";

export interface BlockInstance {
    id: string;
    color: string;
    block: Block;
    x: number;
    y: number;
}

export interface PersistedBlockNode extends WorkspaceBlock {
    x: number;
    y: number;
    color: string;
}

type FieldValues = Record<string, string | number | undefined>;
type NestedBlocksMap = Record<string, Record<string, any[]>>;

export function useWorkspaceBlocks() {
    const [workspaceBlocks, setWorkspaceBlocks] = useState<BlockInstance[]>([]);
    const [nestedBlocks, setNestedBlocks] = useState<NestedBlocksMap>({});
    const [blockFieldValues, setBlockFieldValues] = useState<Record<string, FieldValues>>({});
    const hasUserInteractedRef = useRef(false);

    const addBlock = (color: string, block: Block, x: number, y: number) => {
        hasUserInteractedRef.current = true;
        setWorkspaceBlocks((prev) => [
            ...prev,
            { id: `block-${Date.now()}-${Math.random()}`, color, block, x, y },
        ]);
    };

    const deleteBlock = (id: string) => {
        hasUserInteractedRef.current = true;
        setWorkspaceBlocks((prev) => prev.filter((b) => b.id !== id));
        setNestedBlocks((prev) => { const u = {...prev}; delete u[id]; return u; });
        setBlockFieldValues((prev) => { const u = {...prev}; delete u[id]; return u; });
    };

    const setPosition = (id: string, x: number, y: number) => {
        hasUserInteractedRef.current = true;
        setWorkspaceBlocks((prev) => prev.map((b) => (b.id === id ? {...b, x, y} : b)));
    };

    const handleNestedBlocksChange = (blockId: string, nestedByField: Record<string, any[]>) => {
        hasUserInteractedRef.current = true;
        setNestedBlocks((prev) => ({...prev, [blockId]: nestedByField}));
    };

    const handleFieldValuesChange = (blockId: string, fieldValues: FieldValues) => {
        hasUserInteractedRef.current = true;
        setBlockFieldValues((prev) => ({...prev, [blockId]: fieldValues}));
    };

    const collectNestedRecursively = (blocks: any[]): PersistedBlockNode[] =>
        blocks.map((block) => {
            const nested: Record<string, any[]> = {};
            if (block.nestedBlocks) {
                Object.keys(block.nestedBlocks).forEach((field) => {
                    const arr = block.nestedBlocks[field];
                    if (Array.isArray(arr) && arr.length > 0) {
                        nested[field] = collectNestedRecursively(arr);
                    }
                });
            }
            return {
                id: block.id,
                type: block.block?.block_name || block.block?.menu_name,
                x: block.x,
                y: block.y,
                color: block.color,
                block: block.block,
                nestedBlocks: Object.keys(nested).length > 0 ? nested : {},
                fieldValues: block.fieldValues || {},
            };
        });

    const buildPayload = (): { blocks: PersistedBlockNode[] } => ({
        blocks: workspaceBlocks.map((block): PersistedBlockNode => {
            const blockNested = nestedBlocks[block.id] || {};
            const processed: Record<string, PersistedBlockNode[]> = {};
            Object.keys(blockNested).forEach((field) => {
                const arr = blockNested[field];
                if (Array.isArray(arr) && arr.length > 0) {
                    processed[field] = collectNestedRecursively(arr);
                }
            });
            return {
                id: block.id,
                type: block.block.block_name || block.block.menu_name,
                x: block.x,
                y: block.y,
                color: block.color,
                block: block.block,
                nestedBlocks: Object.keys(processed).length > 0 ? processed : {},
                fieldValues: blockFieldValues[block.id] || {},
            };
        }),
    });

    const restoreBlocks = (rawBlocks: any[]) => {
        const blocks: BlockInstance[] = [];
        const nested: NestedBlocksMap = {};
        const fields: Record<string, FieldValues> = {};

        rawBlocks.forEach((data: any) => {
            const id = data.id || `block-${Date.now()}-${Math.random()}`;
            blocks.push({ id, color: data.color || "#4a90e2", block: data.block, x: data.x || 0, y: data.y || 0 });
            if (data.nestedBlocks && typeof data.nestedBlocks === "object") nested[id] = data.nestedBlocks;
            if (data.fieldValues && typeof data.fieldValues === "object") fields[id] = data.fieldValues;
        });

        setWorkspaceBlocks(blocks);
        setNestedBlocks(nested);
        setBlockFieldValues(fields);
        hasUserInteractedRef.current = false;

        return { blocks, nested, fields };
    };

    const clearBlocks = () => {
        setWorkspaceBlocks([]);
        setNestedBlocks({});
        setBlockFieldValues({});
    };

    return {
        workspaceBlocks, nestedBlocks, blockFieldValues,
        hasUserInteractedRef,
        addBlock, deleteBlock, setPosition,
        handleNestedBlocksChange, handleFieldValuesChange,
        buildPayload, restoreBlocks, clearBlocks,
    };
}
