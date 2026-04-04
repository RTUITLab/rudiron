import type { ValidationContext, ValidationError, ValidationWarning, WorkspaceBlock } from "./blockValidator";
import { ValidationSeverity, getErrorMessage } from "./blockValidator";

const REQUIRED_BODY_FIELDS = new Set(["if-body", "else-body", "for-body", "while-body", "func-body", "try-body"]);
const LOOP_BLOCKS = new Set(["for_loop", "while_loop", "while_true"]);

function hasChildren(node: WorkspaceBlock, bodyField: string): boolean {
    const children = node.nestedBlocks?.[bodyField];
    return Array.isArray(children) && children.length > 0;
}

function createError(
    blockId: string,
    blockType: string,
    code: string,
    field?: string
): ValidationError {
    return {
        blockId,
        blockType,
        field,
        code,
        message: getErrorMessage(code),
        severity: ValidationSeverity.ERROR,
    };
}

function createWarning(blockId: string, blockType: string, code: string): ValidationWarning {
    return {
        blockId,
        blockType,
        code,
        message: getErrorMessage(code),
        severity: ValidationSeverity.WARNING,
    };
}

export function validateStructure(context: ValidationContext): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const item of context.traversal) {
        if (!item.definition) continue;

        for (const field of item.definition.fields) {
            if (field.type !== 2) continue;
            if (!REQUIRED_BODY_FIELDS.has(field.name)) continue;

            if (!hasChildren(item.node, field.name)) {
                errors.push(createError(item.blockId, item.blockType, "EMPTY_BODY", field.name));
            }
        }

        if (item.blockType === "break" && !item.ancestors.some((ancestor) => LOOP_BLOCKS.has(ancestor))) {
            errors.push(createError(item.blockId, item.blockType, "BREAK_OUTSIDE_LOOP"));
        }

        if (item.blockType === "continue" && !item.ancestors.some((ancestor) => LOOP_BLOCKS.has(ancestor))) {
            errors.push(createError(item.blockId, item.blockType, "CONTINUE_OUTSIDE_LOOP"));
        }

        if (item.blockType === "function_return" && !item.ancestors.includes("function_def")) {
            errors.push(createError(item.blockId, item.blockType, "RETURN_OUTSIDE_FUNCTION"));
        }

        if (item.blockType === "while_true" && item.definition.fields.some((field) => field.name === "body")) {
            const bodyBlocks = item.node.nestedBlocks?.body || [];
            const hasDelay = bodyBlocks.some((block) => containsDelayBlock(block));
            if (!hasDelay) {
                warnings.push(createWarning(item.blockId, item.blockType, "POSSIBLE_CPU_OVERLOAD"));
            }
        }
    }

    return { errors, warnings };
}

function containsDelayBlock(node: WorkspaceBlock): boolean {
    const blockType = node.block?.block_name || node.type || "";
    if (blockType === "sleep" || blockType === "sleep_ms" || blockType === "delay_ms") {
        return true;
    }

    const nested = node.nestedBlocks || {};
    for (const children of Object.values(nested)) {
        if (!Array.isArray(children)) continue;
        for (const child of children) {
            if (containsDelayBlock(child)) return true;
        }
    }

    return false;
}
