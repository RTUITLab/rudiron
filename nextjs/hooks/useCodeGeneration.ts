import { useState, useContext } from "react";
import generatorCode from "@/utils/generatorCode";
import CodeContext, { CodeType } from "@/context/code";
import { validateGeneratedTemplate } from "@/src/validation/blockValidator";

export const useCodeGeneration = () => {
    const [formattedCode, setFormattedCode] = useState("");
    const { value: codeState } = useContext(CodeContext);

    const generateCodeFromBlocks = () => {
        if (!codeState || codeState.length === 0) return "";

        const childIds = new Set<number>();
        codeState.forEach((item: CodeType) =>
            item.children.forEach((child: CodeType) => childIds.add(child.id))
        );

        const roots = codeState.filter((i: CodeType) => !childIds.has(i.id));
        const rawCode = roots.map((i: CodeType) => i.code).join("%n%%n%");
        const generatedCode = generatorCode(rawCode);
        const templateErrors = validateGeneratedTemplate(generatedCode);

        if (templateErrors.length > 0) {
            console.error("Template validation failed", templateErrors);
            return "";
        }

        return generatedCode;
    };

    const formatCode = () => {
        const code = generateCodeFromBlocks();
        setFormattedCode(code);
        return code;
    };

    return {
        formattedCode,
        setFormattedCode,
        generateCodeFromBlocks,
        formatCode
    };
};