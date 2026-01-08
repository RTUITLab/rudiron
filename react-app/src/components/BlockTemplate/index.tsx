import { Block } from "../../types/blocks";
import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent, useContext } from "react";
import Style from "./blockTemplate.module.scss";
import BlockAttachments from "../BlockAttachments";
import CodeContext, { CodeType } from "../../context/code";

interface Props {
  id: string;
  color: string;
  block: Block;
  x: number;
  y: number;
  z: number;
  deleteBlock: (id: string) => void;
  setNewPosition: (id: string, x: number, y: number) => void;
  onChildrenChange?: (blockId: string, childrenByField: Record<string, any[]>) => void;
  initialNestedBlocks?: Record<string, any[]>;
}

export default function BlockTemplate({
  id,
  color,
  block,
  x,
  y,
  z,
  deleteBlock,
  setNewPosition,
  onChildrenChange,
  initialNestedBlocks,
}: Props) {
  const refBlock = useRef<HTMLDivElement | null>(null);
  const refOriginOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const { updateData } = useContext(CodeContext);
  const [childrenByField, setChildrenByField] = useState<Record<string, CodeType[]>>({});
  const [nestedBlocksByField, setNestedBlocksByField] = useState<Record<string, any[]>>(initialNestedBlocks || {});
  const lastPayloadRef = useRef<string>("");
  const lastNestedBlocksRef = useRef<string>(JSON.stringify(initialNestedBlocks || {}));
  const onChildrenChangeRef = useRef(onChildrenChange);

  const codeId = id.split("-").reduce((acc, part) => acc + part.charCodeAt(0), 0);
  useEffect(() => {
    const children = Object.values(childrenByField).flat();
    let code = block.default_code;

    block.fields.forEach((field) => {
      if (field.type === 2) {
        const placeholder = `%${field.name}%`;
        const childCode = (childrenByField[field.name] || []).map((c) => c.code).join("\n");
        code = code.replace(new RegExp(placeholder, "g"), childCode);
      }
    });

    const childKey = children.map((c) => `${c.id}:${c.code}`).join("|");
    const payloadKey = `${code}|${childKey}`;
    if (payloadKey === lastPayloadRef.current) return;
    lastPayloadRef.current = payloadKey;

    updateData({ code, children, id: codeId }, "set");
    return () => updateData({ code: block.default_code, children: [], id: codeId }, "delete");
  }, [block.default_code, block.fields, childrenByField, codeId, updateData]);

  useEffect(() => {
    onChildrenChangeRef.current = onChildrenChange;
  }, [onChildrenChange]);
  useEffect(() => {
    const nestedKey = JSON.stringify(nestedBlocksByField);
    if (nestedKey === lastNestedBlocksRef.current) return;
    lastNestedBlocksRef.current = nestedKey;
    
    if (onChildrenChangeRef.current) {
      onChildrenChangeRef.current(id, nestedBlocksByField);
    }
  }, [nestedBlocksByField, id]);

  useEffect(() => {
    if (refBlock.current) {
      refBlock.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [x, y]);

  const handleDragButtonMouseDown = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const blockEl = refBlock.current;
    if (!blockEl) return;

    setIsDragging(true);

    const workspaceEl = blockEl.closest(`.${Style.Workspace} .${Style.Content}`) as HTMLDivElement | null;
    let transformX = 0;
    let transformY = 0;
    if (workspaceEl) {
      const match = workspaceEl.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        transformX = parseFloat(match[1]);
        transformY = parseFloat(match[2]);
      }
    }

    refOriginOffset.current = {
      x: e.clientX - transformX - x,
      y: e.clientY - transformY - y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const blockEl = refBlock.current;
    if (!blockEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const workspaceEl = blockEl.closest(`.${Style.Workspace} .${Style.Content}`) as HTMLDivElement | null;
      let transformX = 0;
      let transformY = 0;
      if (workspaceEl) {
        const match = workspaceEl.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        if (match) {
          transformX = parseFloat(match[1]);
          transformY = parseFloat(match[2]);
        }
      }

      const newX = e.clientX - transformX - refOriginOffset.current.x;
      const newY = e.clientY - transformY - refOriginOffset.current.y;

      blockEl.style.transform = `translate(${newX}px, ${newY}px)`
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const transformStyle = blockEl.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      const finalX = transformStyle ? parseFloat(transformStyle[1]) : 0;
      const finalY = transformStyle ? parseFloat(transformStyle[2]) : 0;

      setNewPosition(id, finalX, finalY);

      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, id, setNewPosition]);

  return (
    <div
      ref={refBlock}
      className={Style.BlockTemplate}
      style={{
        outlineColor: color,
        zIndex: z + 2,
        cursor: isDragging ? "grabbing" : "default",
        position: "absolute",
        userSelect: "none",
      }}
    >
      <div style={{ outlineColor: color }}>
        <p>{block.menu_name}</p>
        <div>
          <button
            onMouseDown={handleDragButtonMouseDown}
            className={Style.DragButton}
            title="Переместить блок"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="7" cy="7" r="1.5" fill="white" /> <circle cx="14" cy="7" r="1.5" fill="white" /> <circle cx="21" cy="7" r="1.5" fill="white" /> <circle cx="7" cy="14" r="1.5" fill="white" /> <circle cx="14" cy="14" r="1.5" fill="white" /> <circle cx="21" cy="14" r="1.5" fill="white" /> <circle cx="7" cy="21" r="1.5" fill="white" /> <circle cx="14" cy="21" r="1.5" fill="white" /> <circle cx="21" cy="21" r="1.5" fill="white" /> </svg>
          </button>

          <button onClick={() => deleteBlock(id)} title="Удалить блок">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M22.75 6.4165L22.027 18.1124C21.8423 21.1007 21.7499 22.5948 21.0009 23.669C20.6306 24.2001 20.1538 24.6483 19.6008 24.9852C18.4825 25.6665 16.9855 25.6665 13.9915 25.6665C10.9936 25.6665 9.49469 25.6665 8.37556 24.9839C7.82227 24.6465 7.34533 24.1974 6.97513 23.6655C6.22635 22.5895 6.13603 21.0933 5.95538 18.1008L5.25 6.4165" stroke="white" strokeWidth="1.5" strokeLinecap="round" /> <path d="M3.5 6.41659H24.5M18.7317 6.41659L17.9352 4.7736C17.4062 3.68222 17.1416 3.13653 16.6853 2.79619C16.5841 2.7207 16.4769 2.65355 16.3649 2.5954C15.8596 2.33325 15.2531 2.33325 14.0403 2.33325C12.797 2.33325 12.1753 2.33325 11.6616 2.60639C11.5478 2.66693 11.4391 2.7368 11.3368 2.81528C10.8752 3.1694 10.6174 3.73506 10.1017 4.86639L9.39508 6.41659" stroke="white" strokeWidth="1.5" strokeLinecap="round" /> <path d="M11.082 19.25L11.082 12.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" /> <path d="M16.918 19.25L16.918 12.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" /> </svg>
          </button>
        </div>
      </div>

      <div style={{ outlineColor: color }}>
        {block.fields.map(
          (elem, index) =>
            elem.type === 2 && (
              <BlockAttachments
                title={elem.placeholder}
                key={`block_attach_${index}`}
                onChange={(children) =>
                  setChildrenByField((prev) => ({ ...prev, [elem.name]: children }))
                }
                onBlocksChange={(blocks) => {
                  setNestedBlocksByField((prev) => {
                    const updated = { ...prev, [elem.name]: blocks };
                    const updatedKey = JSON.stringify(updated);
                    const prevKey = JSON.stringify(prev);
                    if (updatedKey === prevKey) {
                      return prev;
                    }
                    return updated;
                  });
                }}
                initialBlocks={initialNestedBlocks?.[elem.name] || []}
              />
            )
        )}
      </div>
    </div>
  );
}
