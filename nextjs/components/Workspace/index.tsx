import { useRef, useState, useEffect, useMemo, useContext } from "react";
import Style from "./workspace.module.scss";
import Aside from "../Aside";
import TopRightListElements from "../TopRightListElements";
import Coordinates from "../Сoordinates";
import BlockTemplate from "../BlockTemplate";
import CodeContext, { CodeType } from "@/context/code";
import { Block } from "@/types/blocks";
import Loader from "../Loader";
import Modal from "@/components/Modal";
import FlasherPanel from "@/components/FlasherPanel";
import { validateWorkspace } from "@/src/validation/blockValidator";
import { useWorkspaceBlocks } from "./useWorkspaceBlocks";
import { useWorkspacePersistence } from "./useWorkspacePersistence";
import Categories from "@/types/categories";
import Blocks from "@/types/blocks";
import toast from "react-hot-toast";

interface Props {
    categories: Categories;
    blocks: Blocks;
    projectId?: string;
    onShowTour?: (val: boolean) => void;
}

interface Vec2 { x: number; y: number; }

export default function Workspace({ categories, blocks, projectId, onShowTour }: Props) {
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const transformRef = useRef(transform);
    useEffect(() => { transformRef.current = transform; }, [transform]);

    const [mouse, setMouse] = useState<Vec2>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const refContainer = useRef<HTMLDivElement | null>(null);
    const refLast = useRef<Vec2>({ x: 0, y: 0 });
    const refCanDrop = useRef(false);
    const { value: codeState } = useContext(CodeContext);

    const {
        workspaceBlocks, nestedBlocks, blockFieldValues,
        hasUserInteractedRef,
        addBlock, deleteBlock, setPosition,
        handleNestedBlocksChange, handleFieldValuesChange,
        buildPayload, restoreBlocks, clearBlocks,
    } = useWorkspaceBlocks();

    const { isSaving, saveStatus, isLoading, handleSave } = useWorkspacePersistence({
        projectId,
        workspaceBlocks, nestedBlocks, blockFieldValues,
        hasUserInteractedRef,
        buildPayload, restoreBlocks, clearBlocks,
        setTransform, transformRef,
        onLoaded: onShowTour,
    });

    useEffect(() => {
        const canvas = document.getElementById("grid-canvas") as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        function drawGrid() {
            const w = canvas.width / devicePixelRatio;
            const h = canvas.height / devicePixelRatio;
            const { x, y, scale } = transform;
            ctx.clearRect(0, 0, w, h);
            const spacing = 40 * scale;
            const offsetX = x % spacing;
            const offsetY = y % spacing;
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            for (let i = -spacing; i < w; i += spacing) {
                for (let j = -spacing; j < h; j += spacing) {
                    ctx.fillRect(i + offsetX, j + offsetY, 2.5, 2.5);
                }
            }
        }

        function resize() {
            canvas.width = window.innerWidth * devicePixelRatio;
            canvas.height = window.innerHeight * devicePixelRatio;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            drawGrid();
        }

        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
    }, [transform, isLoading]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsPanning(true);
        refLast.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - refLast.current.x;
            const dy = e.clientY - refLast.current.y;
            refLast.current = { x: e.clientX, y: e.clientY };
            setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
        }
        const rect = refContainer.current?.getBoundingClientRect();
        if (rect) {
            setMouse({
                x: (e.clientX - rect.left - transform.x) / transform.scale,
                y: (e.clientY - rect.top - transform.y) / transform.scale,
            });
        }
    };

    const onMouseUp = () => setIsPanning(false);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;
        let dropped: { color: string; block: Block };
        try { dropped = JSON.parse(data); } catch { return; }
        if (!dropped.block.workspace) return;

        const rect = refContainer.current!.getBoundingClientRect();
        addBlock(
            dropped.color,
            dropped.block,
            (e.clientX - rect.left - transform.x) / transform.scale,
            (e.clientY - rect.top - transform.y) / transform.scale,
        );
    };

    const onDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleRun = () => {
        const payload = buildPayload();
        const validation = validateWorkspace(payload);

        // if (validation.errors.length > 0) {
        //     toast.error(`Ошибки валидации:\n${validation.errors.map((e) => e.message).join("\n")}`);
        // }

        const childIds = new Set<number>();
        codeState.forEach((item: CodeType) =>
            item.children.forEach((child: CodeType) => childIds.add(child.id))
        );
        const roots = codeState.filter((i: CodeType) => !childIds.has(i.id));
        const code = roots.map((i: CodeType) => i.code).join("\n\n");

        if (!code.trim()) {
            toast.error("Нет сгенерированного кода! Добавьте блоки в рабочую область.");
            return;
        }

        setIsCodeModalOpen(true);
    };

    const renderedBlocks = useMemo(
        () =>
            workspaceBlocks.map((b, idx) => (
                <BlockTemplate
                    key={b.id}
                    id={b.id}
                    color={b.color}
                    block={b.block}
                    x={b.x}
                    y={b.y}
                    z={idx}
                    deleteBlock={deleteBlock}
                    setNewPosition={(id, x, y) => setPosition(id, x, y)}
                    onChildrenChange={handleNestedBlocksChange}
                    initialNestedBlocks={nestedBlocks[b.id]}
                    initialFieldValues={blockFieldValues[b.id]}
                    onFieldValuesChange={(fv) => handleFieldValuesChange(b.id, fv)}
                />
            )),
        [workspaceBlocks, nestedBlocks, blockFieldValues]
    );

    if (isLoading) return <Loader />;

    return (
        <main className={Style.Workspace}>
            <Aside
                blocks={blocks}
                categories={categories}
                refCanDrop={refCanDrop}
                workSpacePermission={!!workspaceBlocks.length}
            />

            <div
                ref={refContainer}
                className={Style.WorkBuffer}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onDrop={onDrop}
                onDragOver={onDragOver}
            >
                <canvas id="grid-canvas" className={Style.GridCanvas} />

                <div
                    className={Style.Content}
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: "0 0",
                    }}
                >
                    {renderedBlocks}
                </div>

                <TopRightListElements>
                    <Coordinates x={mouse.x} y={mouse.y} />
                </TopRightListElements>

                {saveStatus && (
                    <div className={Style.SaveStatus}>
                        <span>{saveStatus}</span>
                    </div>
                )}

                <div onClick={handleSave} className={Style.SaveButton} title="Сохранить">
                    <svg viewBox="0 0 24 24" fill="#8a8a8a" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd"
                            d="M3 9C3 6.171 3 4.757 3.879 3.879 4.757 3 6.172 3 9 3h6.343c.818 0 1.226 0 1.594.152.368.152.657.441 1.235 1.019l1.657 1.657c.578.578.867.867 1.019 1.235.152.368.152.777.152 1.594V15c0 2.829 0 4.243-.879 5.121-.641.642-1.568.815-3.121.862V18l-.001-.062c0-.654 0-1.242-.064-1.718-.07-.519-.232-1.052-.668-1.488-.436-.436-.97-.598-1.489-.668-.476-.064-1.064-.064-1.718-.064H9.938c-.654 0-1.242 0-1.718.064-.519.07-1.052.232-1.488.668-.436.436-.598.97-.668 1.488C6 16.696 6 17.284 6 17.938V18v2.924c-.975-.096-1.631-.313-2.121-.803C3 19.243 3 17.829 3 15V9Zm12 9v3H9c-.355 0-.688 0-1-.002V18c0-.735.002-1.186.046-1.513.038-.286.093-.334.1-.34l.001-.001c.006-.007.053-.062.34-.1.326-.044.777-.046 1.513-.046h3c.735 0 1.186.002 1.513.046.286.038.334.093.34.1l.001.001c.007.006.062.053.1.34.044.327.046.778.046 1.513ZM7 7c-.552 0-1 .448-1 1s.448 1 1 1h5c.552 0 1-.448 1-1s-.448-1-1-1H7Z" />
                    </svg>
                </div>

                <button onClick={handleRun} className={Style.RunButton}>▶</button>
            </div>

            <Modal
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                title="Прошивка устройства"
                showCloseButton={true}
                isWorkspace={true}
            >
                <FlasherPanel />
            </Modal>
        </main>
    );
}
