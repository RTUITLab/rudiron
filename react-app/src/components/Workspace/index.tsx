import { useRef, useState, useEffect, useMemo, useContext, useCallback } from "react";
import Style from "./workspace.module.scss";
import Aside from "../Aside";
import TopRightListElements from "../TopRightListElements";
import Coordinates from "../Сoordinates";
import BlockTemplate from "../BlockTemplate";
import CodeContext, { CodeType } from "../../context/code";
import generatorCode from "../../utils/generatorCode";
import { Block } from "../../types/blocks";
import { saveWorkflow, getWorkflows } from "../../services/workflow";

interface Props {
  categories: any;
  blocks: any;
}

interface Vec2 {
  x: number;
  y: number;
}

interface BlockInstance {
  id: string;
  color: string;
  block: Block;
  x: number;
  y: number;
}

export default function Workspace({ categories, blocks }: Props) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [mouse, setMouse] = useState<Vec2>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [workspaceBlocks, setWorkspaceBlocks] = useState<BlockInstance[]>([]);
  const [nestedBlocks, setNestedBlocks] = useState<Record<string, Record<string, any[]>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  const refContainer = useRef<HTMLDivElement | null>(null);
  const refLast = useRef<Vec2>({ x: 0, y: 0 });
  const refCanDrop = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const { value: codeState } = useContext(CodeContext);

  // ───────────────────────────────
  // Сетка
  useEffect(() => {
    const canvas = document.getElementById("grid-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function drawGrid() {
      const { width, height } = canvas;
      const { x, y, scale } = transform;
      ctx.clearRect(0, 0, width, height);

      const spacing = 40 * scale;
      const offsetX = x % spacing;
      const offsetY = y % spacing;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = -spacing; i < width; i += spacing) {
        for (let j = -spacing; j < height; j += spacing) {
          ctx.fillRect(i + offsetX, j + offsetY, 2.5, 2.5);
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      drawGrid();
    }

    window.addEventListener("resize", resize);
    resize();

    drawGrid();
    const id = setInterval(drawGrid, 60);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", resize);
    };
  }, [transform]);

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
      const worldX = (e.clientX - rect.left - transform.x) / transform.scale;
      const worldY = (e.clientY - rect.top - transform.y) / transform.scale;
      setMouse({ x: worldX, y: worldY });
    }
  };

  const onMouseUp = () => setIsPanning(false);

  // Приближение
  /*
  useEffect(() => {
    const el = refContainer.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { clientX, clientY, deltaY } = e;
      const rect = el.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      const worldX = (mouseX - transform.x) / transform.scale;
      const worldY = (mouseY - transform.y) / transform.scale;

      const zoomFactor = deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.5), 2);

      setTransform({
        x: mouseX - worldX * newScale,
        y: mouseY - worldY * newScale,
        scale: newScale,
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [transform]);
  */

  // Drop логика
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const dropped = JSON.parse(data);
  
    if (!dropped.block.workspace) return;
  
    const rect = refContainer.current!.getBoundingClientRect();
    const dropX = (e.clientX - rect.left - transform.x) / transform.scale;
    const dropY = (e.clientY - rect.top - transform.y) / transform.scale;
  
    setWorkspaceBlocks((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}-${Math.random()}`,
        color: dropped.color,
        block: dropped.block,
        x: dropX,
        y: dropY,
      },
    ]);
  };
  

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const deleteBlock = (id: string) => {
    setWorkspaceBlocks((prev) => prev.filter((b) => b.id !== id));
    setNestedBlocks((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleRun = () => {
    const childIds = new Set<number>();
    codeState.forEach((item: CodeType) =>
      item.children.forEach((child: CodeType) => childIds.add(child.id))
    );
    const roots = codeState.filter((i: CodeType) => !childIds.has(i.id));
    const code = roots.map((i: CodeType) => i.code).join("\n\n");
    if (!code.trim()) return console.warn("Нет кода");
    generatorCode(code);
  };

  const handleSave = useCallback(async () => {
    if (workspaceBlocks.length === 0) {
      setSaveStatus("Нет блоков для сохранения");
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const blocksData = workspaceBlocks.map((block) => ({
        id: block.id,
        type: block.block.block_name || block.block.menu_name,
        x: block.x,
        y: block.y,
        color: block.color,
        block: block.block,
        nestedBlocks: nestedBlocks[block.id] || {},
      }));

      const workflowData = {
        id: workflowId || undefined,
        name: `Workflow ${new Date().toLocaleString("ru-RU")}`,
        description: `Сохранено ${new Date().toLocaleString("ru-RU")}`,
        blocks: blocksData,
      };

      const saved = await saveWorkflow(workflowData);
      setWorkflowId(saved.id || null);
      setSaveStatus("Сохранено");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error: any) {
      console.error("Ошибка сохранения:", error);
      setSaveStatus(`Ошибка: ${error.message}`);
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [workspaceBlocks, nestedBlocks, workflowId]);

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const workflows = await getWorkflows();
        if (workflows.length > 0) {
          const lastWorkflow = workflows[0];
          setWorkflowId(lastWorkflow.id || null);
          
          if (lastWorkflow.blocks && Array.isArray(lastWorkflow.blocks) && lastWorkflow.blocks.length > 0) {

            const restoredBlocks: BlockInstance[] = [];
            const restoredNestedBlocks: Record<string, Record<string, any[]>> = {};
            
            lastWorkflow.blocks.forEach((blockData: any) => {
              const blockId = blockData.id || `block-${Date.now()}-${Math.random()}`;
              restoredBlocks.push({
                id: blockId,
                color: blockData.color || "#4a90e2",
                block: blockData.block,
                x: blockData.x || 0,
                y: blockData.y || 0,
              });
              
              if (blockData.nestedBlocks) {
                restoredNestedBlocks[blockId] = blockData.nestedBlocks;
              }
            });
            
            setWorkspaceBlocks(restoredBlocks);
            setNestedBlocks(restoredNestedBlocks);
          }
        }
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error("Ошибка загрузки workflow:", error);
        isInitialLoadRef.current = false;
      }
    };

    loadWorkflow();
  }, []);
useEffect(() => {
    if (isInitialLoadRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (workspaceBlocks.length > 0) {
        handleSave();
      }
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [workspaceBlocks, nestedBlocks, handleSave]);

  const handleNestedBlocksChange = (blockId: string, nestedBlocksByField: Record<string, any[]>) => {
    setNestedBlocks((prev) => ({
      ...prev,
      [blockId]: nestedBlocksByField,
    }));
  };

  const renderedBlocks = useMemo(
    () =>
      workspaceBlocks.map((b) => (
        <BlockTemplate
          key={b.id}
          id={b.id}
          color={b.color}
          block={b.block}
          x={b.x}
          y={b.y}
          z={workspaceBlocks.indexOf(b)}
          deleteBlock={deleteBlock}
          setNewPosition={(id, x, y) =>
            setWorkspaceBlocks((prev) =>
              prev.map((blk) => (blk.id === id ? { ...blk, x, y } : blk))
            )
          }
          onChildrenChange={handleNestedBlocksChange}
          initialNestedBlocks={nestedBlocks[b.id]}
        />
      )),
    [workspaceBlocks, nestedBlocks]
  );

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
          {/* <span>Масштаб: {Math.round(transform.scale * 100)}%</span> */}
        </TopRightListElements>

        {saveStatus && (
          <div className={Style.SaveStatus}>
            <span>
              {saveStatus}
            </span>
          </div>
        )}

        <div
          onClick={handleSave} 
          className={Style.SaveButton}
          title="Сохранить workflow в базу данных"
        >
          <svg viewBox="0 0 24 24" fill="#8a8a8a" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3 9C3 6.171 3 4.757 3.879 3.879 4.757 3 6.172 3 9 3h6.343c.818 0 1.226 0 1.594.152.368.152.657.441 1.235 1.019l1.657 1.657c.578.578.867.867 1.019 1.235.152.368.152.777.152 1.594V15c0 2.829 0 4.243-.879 5.121-.641.642-1.568.815-3.121.862V18l-.001-.062c0-.654 0-1.242-.064-1.718-.07-.519-.232-1.052-.668-1.488-.436-.436-.97-.598-1.489-.668-.476-.064-1.064-.064-1.718-.064H9.938c-.654 0-1.242 0-1.718.064-.519.07-1.052.232-1.488.668-.436.436-.598.97-.668 1.488C6 16.696 6 17.284 6 17.938V18v2.924c-.975-.096-1.631-.313-2.121-.803C3 19.243 3 17.829 3 15V9Zm12 9v3H9c-.355 0-.688 0-1-.002V18c0-.735.002-1.186.046-1.513.038-.286.093-.334.1-.34l.001-.001c.006-.007.053-.062.34-.1.326-.044.777-.046 1.513-.046h3c.735 0 1.186.002 1.513.046.286.038.334.093.34.1l.001.001c.007.006.062.053.1.34.044.327.046.778.046 1.513ZM7 7c-.552 0-1 .448-1 1s.448 1 1 1h5c.552 0 1-.448 1-1s-.448-1-1-1H7Z"/>
          </svg>
        </div>

        <button onClick={handleRun} className={Style.RunButton}>
          ▶
        </button>
      </div>
    </main>
  );
}
