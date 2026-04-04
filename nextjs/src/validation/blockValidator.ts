import blocksData from "@/data/blocks";
import type { Block, Field } from "@/types/blocks";
import { validateFields } from "./fieldValidator";
import { validateStructure } from "./structureValidator";
import { validateDependencies } from "./dependencyValidator";
import { validateValues } from "./valueValidator";

export enum ValidationSeverity {
    ERROR = "ERROR",
    WARNING = "WARNING",
    INFO = "INFO",
}

export interface WorkspaceBlock {
    id: string | number;
    type?: string;
    block?: Block;
    fieldValues?: Record<string, string | number | undefined>;
    nestedBlocks?: Record<string, WorkspaceBlock[]>;
}

export interface WorkspacePayload {
    blocks: WorkspaceBlock[];
    generatedCode?: string;
}

export interface ValidationIssue {
    blockId: string;
    blockType: string;
    field?: string;
    code: string;
    message: string;
    severity?: ValidationSeverity;
}

export type ValidationError = ValidationIssue;
export type ValidationWarning = ValidationIssue;

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface TraversalNode {
    node: WorkspaceBlock;
    blockId: string;
    blockType: string;
    definition?: Block;
    ancestors: string[];
}

export interface ValidationContext {
    blockDefinitions: Map<string, Block>;
    traversal: TraversalNode[];
}

const ERROR_MESSAGES: Record<string, string> = {
    FIELD_EMPTY: "Field cannot be empty",
    FIELD_INVALID_OPTION: "Field contains invalid option",
    INVALID_IDENTIFIER: "Invalid Python identifier",
    EMPTY_BODY: "Body container cannot be empty",
    BREAK_OUTSIDE_LOOP: "break can be used only inside loops",
    CONTINUE_OUTSIDE_LOOP: "continue can be used only inside loops",
    RETURN_OUTSIDE_FUNCTION: "return can be used only inside a function",
    VARIABLE_NOT_DEFINED: "Variable is used before declaration",
    PIN_NOT_INITIALIZED: "Pin is used before pin setup",
    PWM_NOT_INITIALIZED: "PWM is used before setup",
    ADC_NOT_INITIALIZED: "ADC is used before setup",
    UART_NOT_INITIALIZED: "UART is used before init",
    WIFI_NOT_CONNECTED: "WiFi is used before connect",
    PWM_DUTY_RANGE: "PWM duty value must be in range 0..1023",
    RANDOM_RANGE_INVALID: "Random range is invalid: min > max",
    NEGATIVE_TIME: "Time value cannot be negative",
    MISSING_MACHINE_IMPORT: "Required machine import is missing",
    MISSING_TIME_IMPORT: "Required time import is missing",
    MISSING_RANDOM_IMPORT: "Required random import is missing",
    MISSING_NETWORK_IMPORT: "Required network import is missing",
    POSSIBLE_CPU_OVERLOAD: "while True loop has no delay call",
    TEMPLATE_FIELD_NOT_REPLACED: "Template placeholder was not replaced",
};

export function getErrorMessage(code: string): string {
    return ERROR_MESSAGES[code] || "Validation error";
}

export function validateGeneratedTemplate(
    code: string,
    blockId = "workspace",
    blockType = "workspace"
): ValidationError[] {
    const placeholderPattern = /%[a-zA-Z0-9_-]+%/g;
    const placeholders = code.match(placeholderPattern) || [];

    return placeholders.map((placeholder) => ({
        blockId,
        blockType,
        code: "TEMPLATE_FIELD_NOT_REPLACED",
        message: `${getErrorMessage("TEMPLATE_FIELD_NOT_REPLACED")}: ${placeholder}`,
        severity: ValidationSeverity.ERROR,
    }));
}

function normalizeWorkspace(workspace: WorkspacePayload | WorkspaceBlock[] | undefined): WorkspacePayload {
    if (!workspace) {
        return { blocks: [] };
    }

    if (Array.isArray(workspace)) {
        return { blocks: workspace };
    }

    return {
        blocks: Array.isArray(workspace.blocks) ? workspace.blocks : [],
        generatedCode: workspace.generatedCode,
    };
}

function createBlockDefinitionMap(): Map<string, Block> {
    const definitions = blocksData().blocks;
    return new Map<string, Block>(definitions.map((definition) => [definition.block_name, definition]));
}

function getFieldValue(node: WorkspaceBlock, fieldName: string): string | number | undefined {
    return node.fieldValues?.[fieldName];
}

function resolveBlockType(node: WorkspaceBlock): string {
    if (node.block?.block_name) return node.block.block_name;
    if (typeof node.type === "string" && node.type.trim()) return node.type.trim();
    return "unknown_block";
}

function getOrderedBodyFields(definition?: Block): Field[] {
    if (!definition) return [];
    return definition.fields.filter((field) => field.type === 2);
}

function flattenBlocks(
    blocks: WorkspaceBlock[],
    definitions: Map<string, Block>,
    ancestors: string[] = []
): TraversalNode[] {
    const result: TraversalNode[] = [];

    for (const node of blocks) {
        const blockType = resolveBlockType(node);
        const definition = definitions.get(blockType) || node.block;
        const blockId = String(node.id);
        const currentAncestors = [...ancestors];

        result.push({
            node,
            blockId,
            blockType,
            definition,
            ancestors: currentAncestors,
        });

        const bodyFields = getOrderedBodyFields(definition);
        for (const bodyField of bodyFields) {
            const children = node.nestedBlocks?.[bodyField.name] || [];
            result.push(...flattenBlocks(children, definitions, [...ancestors, blockType]));
        }
    }

    return result;
}

export function validateWorkspace(workspace: WorkspacePayload | WorkspaceBlock[]): ValidationResult {
    const normalizedWorkspace = normalizeWorkspace(workspace);
    const definitions = createBlockDefinitionMap();
    const traversal = flattenBlocks(normalizedWorkspace.blocks, definitions);
    const context: ValidationContext = {
        blockDefinitions: definitions,
        traversal,
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    errors.push(...validateFields(context, getFieldValue));

    const structureResult = validateStructure(context);
    errors.push(...structureResult.errors);
    warnings.push(...structureResult.warnings);

    const dependencyResult = validateDependencies(context, getFieldValue);
    errors.push(...dependencyResult.errors);

    const valueResult = validateValues(context, getFieldValue);
    errors.push(...valueResult.errors);
    warnings.push(...valueResult.warnings);

    if (normalizedWorkspace.generatedCode) {
        errors.push(...validateGeneratedTemplate(normalizedWorkspace.generatedCode));
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
