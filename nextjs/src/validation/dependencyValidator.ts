import type {
    ValidationContext,
    ValidationError,
    WorkspaceBlock,
} from "./blockValidator";
import { ValidationSeverity, getErrorMessage } from "./blockValidator";

const VARIABLE_USAGE_FIELDS_BY_BLOCK: Record<string, string[]> = {
    set_variable: ["set-var"],
    increment: ["inc-var"],
    digital_read: ["var"],
    adc_read: ["var"],
    ticks_ms: ["var"],
    ticks_diff: ["var"],
    wifi_status: ["var"],
    math_operation: ["var"],
    random_int: ["var"],
    uart_read: ["var"],
};

const BLOCK_REQUIRED_IMPORTS: Record<string, Array<"machine" | "time" | "random" | "network">> = {
    pin_setup: ["machine"],
    digital_write: ["machine"],
    digital_read: ["machine"],
    if_digital_read: ["machine"],
    pwm_setup: ["machine"],
    pwm_write: ["machine"],
    adc_setup: ["machine"],
    adc_read: ["machine"],
    uart_setup: ["machine"],
    uart_write: ["machine"],
    uart_read: ["machine"],
    uart_any: ["machine"],
    sleep: ["time"],
    sleep_ms: ["time"],
    delay_ms: ["time"],
    ticks_ms: ["time"],
    ticks_diff: ["time"],
    random_int: ["random"],
    wifi_connect: ["network", "time"],
    wifi_status: ["network"],
};

const MISSING_IMPORT_CODE: Record<string, string> = {
    machine: "MISSING_MACHINE_IMPORT",
    time: "MISSING_TIME_IMPORT",
    random: "MISSING_RANDOM_IMPORT",
    network: "MISSING_NETWORK_IMPORT",
};

const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

interface DependencyState {
    declaredVariables: Set<string>;
    initializedPinsByNumber: Set<number>;
    initializedPinVariables: Set<string>;
    initializedPwmVariables: Set<string>;
    initializedAdcVariables: Set<string>;
    initializedUartVariables: Set<string>;
    wifiConnected: boolean;
    importedModules: Set<string>;
    usedModules: Set<string>;
    firstModuleUsage: Record<string, { blockId: string; blockType: string }>;
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

function extractNumber(value: string | number | undefined): number | null {
    if (value === undefined || value === null) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function extractModuleNames(rawModule: string): string[] {
    const matches = rawModule.match(/[a-zA-Z_][a-zA-Z0-9_.]*/g) || [];
    return matches
        .map((item) => item.split(".")[0].trim().toLowerCase())
        .filter(Boolean);
}

function getBlockType(node: WorkspaceBlock): string {
    return node.block?.block_name || node.type || "unknown_block";
}

export function validateDependencies(
    context: ValidationContext,
    getFieldValue: (node: WorkspaceBlock, fieldName: string) => string | number | undefined
): { errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const state: DependencyState = {
        declaredVariables: new Set<string>(),
        initializedPinsByNumber: new Set<number>(),
        initializedPinVariables: new Set<string>(),
        initializedPwmVariables: new Set<string>(),
        initializedAdcVariables: new Set<string>(),
        initializedUartVariables: new Set<string>(),
        wifiConnected: false,
        importedModules: new Set<string>(),
        usedModules: new Set<string>(),
        firstModuleUsage: {},
    };

    const rootNodes = context.traversal
        .filter((item) => item.ancestors.length === 0)
        .map((item) => item.node);

    const visit = (node: WorkspaceBlock) => {
        const blockType = getBlockType(node);
        const blockId = String(node.id);

        const requiredImports = BLOCK_REQUIRED_IMPORTS[blockType] || [];
        for (const moduleName of requiredImports) {
            if (!state.firstModuleUsage[moduleName]) {
                state.firstModuleUsage[moduleName] = { blockId, blockType };
            }
            state.usedModules.add(moduleName);
        }

        if (blockType === "import_machine_time") {
            state.importedModules.add("machine");
            state.importedModules.add("time");
        }

        if (blockType === "import_module") {
            const moduleRaw = String(getFieldValue(node, "module-name") || "").trim();
            for (const moduleName of extractModuleNames(moduleRaw)) {
                state.importedModules.add(moduleName);
            }
        }

        if (blockType === "create_variable") {
            const declared = String(getFieldValue(node, "var-name") || "").trim();
            if (IDENTIFIER_REGEX.test(declared)) {
                state.declaredVariables.add(declared);
            }
        }

        if (blockType === "for_loop") {
            const loopVar = String(getFieldValue(node, "for-i") || "").trim();
            if (IDENTIFIER_REGEX.test(loopVar)) {
                state.declaredVariables.add(loopVar);
            }
        }

        const usageFields = VARIABLE_USAGE_FIELDS_BY_BLOCK[blockType] || [];
        for (const usageField of usageFields) {
            const variableName = String(getFieldValue(node, usageField) || "").trim();
            if (!variableName || variableName === "Выбор") continue;
            if (!IDENTIFIER_REGEX.test(variableName)) continue;
            if (!state.declaredVariables.has(variableName)) {
                errors.push(createError(blockId, blockType, "VARIABLE_NOT_DEFINED", usageField));
            }
        }

        if (blockType === "pin_setup") {
            const pinNumber = extractNumber(getFieldValue(node, "pin"));
            if (pinNumber !== null) {
                state.initializedPinsByNumber.add(pinNumber);
                state.initializedPinVariables.add(`pin${pinNumber}`);
            }
        }

        if (blockType === "digital_write" || blockType === "digital_read") {
            const pinValue = String(getFieldValue(node, "pin") || "").trim();
            const pinNumFromVariable = pinValue.match(/^pin(\d+)$/);
            const initializedByVariable = state.initializedPinVariables.has(pinValue);
            const initializedByNumber =
                !!pinNumFromVariable && state.initializedPinsByNumber.has(Number(pinNumFromVariable[1]));
            if (!initializedByVariable && !initializedByNumber) {
                errors.push(createError(blockId, blockType, "PIN_NOT_INITIALIZED", "pin"));
            }
        }

        if (blockType === "if_digital_read") {
            const pinNumber = extractNumber(getFieldValue(node, "if-pin"));
            if (pinNumber === null || !state.initializedPinsByNumber.has(pinNumber)) {
                errors.push(createError(blockId, blockType, "PIN_NOT_INITIALIZED", "if-pin"));
            }
        }

        if (blockType === "pwm_setup") {
            const pinNumber = extractNumber(getFieldValue(node, "pin"));
            if (pinNumber !== null) {
                state.initializedPwmVariables.add(`pwm${pinNumber}`);
            }
        }

        if (blockType === "pwm_write") {
            const pwmVariable = String(getFieldValue(node, "pwm") || "").trim();
            if (!state.initializedPwmVariables.has(pwmVariable)) {
                errors.push(createError(blockId, blockType, "PWM_NOT_INITIALIZED", "pwm"));
            }
        }

        if (blockType === "adc_setup") {
            const pinNumber = extractNumber(getFieldValue(node, "pin"));
            if (pinNumber !== null) {
                state.initializedAdcVariables.add(`adc${pinNumber}`);
            }
        }

        if (blockType === "adc_read") {
            const adcVariable = String(getFieldValue(node, "adc") || "").trim();
            if (!state.initializedAdcVariables.has(adcVariable)) {
                errors.push(createError(blockId, blockType, "ADC_NOT_INITIALIZED", "adc"));
            }
        }

        if (blockType === "uart_setup") {
            const uartNum = extractNumber(getFieldValue(node, "uart-num"));
            if (uartNum !== null) {
                state.initializedUartVariables.add(`uart${uartNum}`);
            }
        }

        if (blockType === "uart_write" || blockType === "uart_read" || blockType === "uart_any") {
            const uartVariable = String(getFieldValue(node, "uart") || "").trim();
            if (!state.initializedUartVariables.has(uartVariable)) {
                errors.push(createError(blockId, blockType, "UART_NOT_INITIALIZED", "uart"));
            }
        }

        if (blockType === "wifi_connect") {
            state.wifiConnected = true;
        }
        if (blockType === "wifi_status" && !state.wifiConnected) {
            errors.push(createError(blockId, blockType, "WIFI_NOT_CONNECTED"));
        }

        const definition = context.blockDefinitions.get(blockType) || node.block;
        const bodyFields = definition?.fields.filter((field) => field.type === 2) || [];
        for (const bodyField of bodyFields) {
            const children = node.nestedBlocks?.[bodyField.name] || [];
            for (const child of children) {
                visit(child);
            }
        }
    };

    for (const root of rootNodes) {
        visit(root);
    }

    for (const moduleName of state.usedModules) {
        if (state.importedModules.has(moduleName)) continue;

        const usage = state.firstModuleUsage[moduleName];
        const code = MISSING_IMPORT_CODE[moduleName] || "VALIDATION_ERROR";
        errors.push(
            createError(
                usage?.blockId || "workspace",
                usage?.blockType || "workspace",
                code
            )
        );
    }

    return { errors };
}
