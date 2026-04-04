import type {
    ValidationContext,
    ValidationError,
    ValidationWarning,
    WorkspaceBlock,
} from "./blockValidator";
import { ValidationSeverity, getErrorMessage } from "./blockValidator";

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

function toNumber(value: string | number | undefined): number | null {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export function validateValues(
    context: ValidationContext,
    getFieldValue: (node: WorkspaceBlock, fieldName: string) => string | number | undefined
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const item of context.traversal) {
        if (item.blockType === "pwm_write") {
            const duty = toNumber(getFieldValue(item.node, "duty"));
            if (duty !== null && (duty < 0 || duty > 1023)) {
                errors.push(createError(item.blockId, item.blockType, "PWM_DUTY_RANGE", "duty"));
            }
        }

        if (item.blockType === "random_int") {
            const min = toNumber(getFieldValue(item.node, "min"));
            const max = toNumber(getFieldValue(item.node, "max"));
            if (min !== null && max !== null && min > max) {
                errors.push(createError(item.blockId, item.blockType, "RANDOM_RANGE_INVALID"));
            }
        }

        if (item.blockType === "sleep" || item.blockType === "sleep_ms" || item.blockType === "delay_ms") {
            const fieldName = item.blockType === "sleep" ? "seconds" : item.blockType === "sleep_ms" ? "ms" : "delay";
            const timeValue = toNumber(getFieldValue(item.node, fieldName));
            if (timeValue !== null && timeValue < 0) {
                errors.push(createError(item.blockId, item.blockType, "NEGATIVE_TIME", fieldName));
            }
        }
    }

    return { errors, warnings };
}
