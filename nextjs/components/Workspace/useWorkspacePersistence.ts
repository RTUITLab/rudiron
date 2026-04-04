import { useState, useRef, useEffect, useCallback } from "react";
import { saveWorkflow, getWorkflow } from "@/services/workflow";
import { useRouter } from "next/navigation";
import { useVariables } from "@/context/variables";
import { type BlockInstance, type PersistedBlockNode } from "./useWorkspaceBlocks";

type FieldValues = Record<string, string | number | undefined>;
type Transform = { x: number; y: number; scale: number };

interface PersistenceOptions {
    projectId?: string;
    workspaceBlocks: BlockInstance[];
    nestedBlocks: Record<string, Record<string, any[]>>;
    blockFieldValues: Record<string, FieldValues>;
    hasUserInteractedRef: React.MutableRefObject<boolean>;
    buildPayload: () => { blocks: PersistedBlockNode[] };
    restoreBlocks: (raw: any[]) => { blocks: BlockInstance[]; nested: Record<string, Record<string, any[]>>; fields: Record<string, FieldValues> };
    clearBlocks: () => void;
    setTransform: (t: Transform) => void;
    transformRef: React.MutableRefObject<Transform>;
    onLoaded?: (showTour: boolean) => void;
}

export function useWorkspacePersistence({
    projectId,
    workspaceBlocks,
    nestedBlocks,
    blockFieldValues,
    hasUserInteractedRef,
    buildPayload,
    restoreBlocks,
    clearBlocks,
    setTransform,
    transformRef,
    onLoaded,
}: PersistenceOptions) {
    const [isSaving, setIsSaving] = useState(false);
    const [workflowName, setWorkflowName] = useState("");
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);
    const router = useRouter();
    const { addVariable } = useVariables();

    const handleSave = useCallback(async () => {
        if (workspaceBlocks.length === 0) {
            setSaveStatus("Нет блоков для сохранения");
            setTimeout(() => setSaveStatus(null), 2000);
            return;
        }
        if (!workflowName || workflowName.trim().length === 0) {
            setSaveStatus("Введите название проекта");
            setTimeout(() => setSaveStatus(null), 2000);
            return;
        }
        if (isSaving) return;

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const { blocks: blocksData } = buildPayload();
            const targetId = projectId || workflowId;
            const saved = await saveWorkflow({
                id: targetId || undefined,
                name: workflowName.trim(),
                description: `Изменено ${new Date().toLocaleString("ru-RU")}`,
                blocks: blocksData,
                transform: transformRef.current,
            });
            setWorkflowId(saved.id || null);
            setSaveStatus("Сохранено");
            setTimeout(() => setSaveStatus(null), 3000);
            hasUserInteractedRef.current = false;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Ошибка сохранения:", error);
            setSaveStatus(`Ошибка: ${msg}`);
            setTimeout(() => setSaveStatus(null), 5000);
        } finally {
            setIsSaving(false);
        }
    }, [workspaceBlocks, nestedBlocks, blockFieldValues, workflowId, projectId, workflowName, isSaving]);

    useEffect(() => {
        if (!projectId) { router.push("/projects"); return; }
        setIsLoading(true);

        const load = async () => {
            try {
                const workflow = await getWorkflow(projectId);
                setWorkflowId(workflow.id || null);
                setWorkflowName(workflow.name || "");
                onLoaded?.(workflow.showTour !== false);

                if (workflow.transform && typeof workflow.transform === "object") {
                    setTransform({
                        x: workflow.transform.x || 0,
                        y: workflow.transform.y || 0,
                        scale: workflow.transform.scale || 1,
                    });
                }

                if (workflow.blocks && Array.isArray(workflow.blocks)) {
                    const { blocks, nested, fields } = restoreBlocks(workflow.blocks);

                    const restoreVars = (bl: BlockInstance[], fv: Record<string, FieldValues>) => {
                        bl.forEach((b) => {
                            if (b.block.block_name === "create_variable") {
                                const varName = fv[b.id]?.["var-name"];
                                const varType = fv[b.id]?.["var-type"];
                                if (varName && String(varName).trim()) {
                                    addVariable(String(varName).trim(), String(varType || "int").trim());
                                }
                            }
                            const bn = nested[b.id];
                            if (bn) {
                                Object.values(bn).flat().forEach((nb: any) => {
                                    if (nb.block?.block_name === "create_variable") {
                                        const n = nb.fieldValues?.["var-name"];
                                        const t = nb.fieldValues?.["var-type"];
                                        if (n && String(n).trim()) addVariable(String(n).trim(), String(t || "int").trim());
                                    }
                                });
                            }
                        });
                    };

                    restoreVars(blocks, fields);
                } else {
                    clearBlocks();
                }
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error("Ошибка загрузки проекта:", error);
                setSaveStatus(`Ошибка загрузки: ${msg}`);
                setTimeout(() => router.push("/projects"), 2000);
            } finally {
                setIsLoading(false);
                isInitialLoadRef.current = false;
            }
        };

        load();
    }, [projectId, router]);

    useEffect(() => {
        if (isInitialLoadRef.current || !projectId || !workflowId || !hasUserInteractedRef.current) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            if (workspaceBlocks.length > 0 && workflowName.trim() && !isSaving && hasUserInteractedRef.current) {
                handleSave();
            }
        }, 3000);
        return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
    }, [workspaceBlocks, nestedBlocks, blockFieldValues, handleSave]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleSave]);

    return { isSaving, workflowName, saveStatus, isLoading, handleSave };
}
