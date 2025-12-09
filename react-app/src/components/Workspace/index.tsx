import { useRef, useState, useEffect, useMemo, useContext } from "react";
import Style from "./workspace.module.scss";
import Aside from "../Aside";
import TopRightListElements from "../TopRightListElements";
import Coordinates from "../Сoordinates";
import BlockTemplate from "../BlockTemplate";
import CodeContext, { CodeType } from "../../context/code";
import generatorCode from "../../utils/generatorCode";
import { Block } from "../../types/blocks";

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

  const refContainer = useRef<HTMLDivElement | null>(null);
  const refLast = useRef<Vec2>({ x: 0, y: 0 });
  const refCanDrop = useRef(false);
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

  const deleteBlock = (id: string) =>
    setWorkspaceBlocks((prev) => prev.filter((b) => b.id !== id));

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
        />
      )),
    [workspaceBlocks]
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

        <button onClick={handleRun} className={Style.RunButton}>
          ▶
        </button>
      </div>
    </main>
  );
}
