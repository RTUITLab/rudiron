import type { ValidationContext, ValidationError, WorkspaceBlock } from "./blockValidator";
import { ValidationSeverity, getErrorMessage } from "./blockValidator";

const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const IDENTIFIER_FIELDS = new Set(["var-name", "func-name", "for-i", "var", "set-var"]);

function isEmptyValue(value: string | number | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
}

function isAllowedOption(value: string | number, options: Array<string | number>): boolean {
    const normalizedValue = String(value).trim();
    return options.some((option) => String(option).trim() === normalizedValue);
}

function createError(
    blockId: string,
    blockType: string,
    code: string,
    field?: string,
    message?: string
): ValidationError {
    return {
        blockId,
        blockType,
        field,
        code,
        message: message || getErrorMessage(code),
        severity: ValidationSeverity.ERROR,
    };
}

export function validateFields(
    context: ValidationContext,
    getFieldValue: (node: WorkspaceBlock, fieldName: string) => string | number | undefined
): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const item of context.traversal) {
        if (!item.definition) continue;

        for (const field of item.definition.fields) {
            if (field.type !== 1 && field.type !== 3) continue;

            const value = getFieldValue(item.node, field.name);

            if (isEmptyValue(value)) {
                errors.push(
                    createError(
                        item.blockId,
                        item.blockType,
                        "FIELD_EMPTY",
                        field.name,
                        `Field "${field.name}" cannot be empty`
                    )
                );
                continue;
            }

            if (field.type === 1 && Array.isArray(field.values) && field.values.length > 0) {
                const selectedValue = value as string | number;
                if (!isAllowedOption(selectedValue, field.values)) {
                    errors.push(
                        createError(item.blockId, item.blockType, "FIELD_INVALID_OPTION", field.name)
                    );
                }
            }

            if (IDENTIFIER_FIELDS.has(field.name)) {
                const identifierValue = String(value).trim();
                if (!IDENTIFIER_REGEX.test(identifierValue)) {
                    errors.push(
                        createError(item.blockId, item.blockType, "INVALID_IDENTIFIER", field.name)
                    );
                }
            }
        }
    }

    return errors;
}
