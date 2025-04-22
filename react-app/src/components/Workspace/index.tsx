import Aside from "../Aside";
import Style from "./workspace.module.scss"
import {useRef, useState, DragEvent, MouseEvent, useMemo, memo} from "react";
import TopRightListElements from "../TopRightListElements";
import Coordinates from "../Сoordinates";
import Categories from "../../types/categories";
import Blocks, {Block} from "../../types/blocks";
import BlockTemplate from "../BlockTemplate";

const CachedBlockTemplate = memo(BlockTemplate)

interface Props {
    categories: Categories,
    blocks: Blocks,
}

interface Position {
    x: number;
    y: number;
}

interface BlockTemplateType {
    color: string;
    block: Block;
    x: number;
    y: number;
}

export default function Workspace({ categories, blocks }: Props) {
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const lastMousePosition = useRef<Position>({ x: 0, y: 0 });
    const refCanDrop = useRef<boolean>(false);
    const [canDrop, setCanDrop] = useState(false);
    const [blocksWorkspace, setBlocksWorkspace] = useState<BlockTemplateType[]>([]);

    function deleteBlock(index: number) {
        setBlocksWorkspace((prevBlocks: BlockTemplateType[]) => prevBlocks.filter((block, id) => id !== index));
    }

    function setNewPosition(index: number, x: number, y: number) {
        setBlocksWorkspace((prevBlocks: BlockTemplateType[]) => {
            for(let i = 0; i < prevBlocks.length; i++)
            {
                if (i === index)
                {
                    prevBlocks[i].x = x;
                    prevBlocks[i].y = y;
                }
            }
            console.log(prevBlocks);
            return prevBlocks;
        })
    }

    const renderedBlocks = useMemo(() => {
        return blocksWorkspace.map((elem, index) => (
            <CachedBlockTemplate
                deleteBlock={deleteBlock}
                setNewPosition={setNewPosition}
                key={"block_template_workspace_" + index}
                z={index}
                color={elem.color}
                block={elem.block}
                x={elem.x + position.x}
                y={elem.y + position.y}
            />
        ));
    }, [blocksWorkspace, position]);

    const handleMouseMovePosition = (event: MouseEvent<HTMLDivElement>) => {
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = event.currentTarget;

        setMousePosition({
            x: event.clientX - offsetLeft - Math.floor(offsetWidth / 2) - 280,
            y: -1 * (event.clientY - offsetTop - Math.floor(offsetHeight / 2)),
        });
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (e.button === 0) {
            e.preventDefault();
            setIsDragging(true);
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMousePosition.current.x;
            const deltaY = e.clientY - lastMousePosition.current.y;

            setPosition((prev) => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY,
            }));

            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const blockData = e.dataTransfer.getData("application/json");
        if (blockData) {
            const block = JSON.parse(blockData);
            if (block.block.workspace)
            {
                const { offsetWidth, offsetHeight } = e.currentTarget;
                setBlocksWorkspace([...blocksWorkspace, {color: block.color, block: block.block, x: (mousePosition.x + -1 * position.x) + Math.floor(offsetWidth / 2), y: -1 * (mousePosition.y + position.y) + Math.floor(offsetHeight / 2)}]);
            }
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = e.currentTarget;

        setMousePosition({
            x: e.clientX - offsetLeft - Math.floor(offsetWidth / 2) - 280,
            y: -1 * (e.clientY - offsetTop - Math.floor(offsetHeight / 2)),
        });
    };

    const handleCombinedMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        handleMouseMove(e);
        handleMouseMovePosition(e);
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        if (refCanDrop.current) {
            setCanDrop(true);
        } else {
            setCanDrop(false);
        }
    };

    const handleDragLeave = () => {
        refCanDrop.current = false;
        setCanDrop(false);
    };

    return (
        <main className={Style.Workspace}>
            <Aside blocks={blocks} categories={categories} refCanDrop={refCanDrop}
                   workSpacePermission={!!blocksWorkspace.length}/>
            <div className={Style.WorkBuffer}>
                {renderedBlocks}
                <div
                    className={Style.Map}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleCombinedMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDrop={canDrop ? () => {
                    } : handleDrop}
                    onDragOver={canDrop ? () => {
                    } : handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    style={{
                        backgroundPosition: `${position.x}px ${position.y}px`,
                        cursor: isDragging ? "all-scroll" : "grab",
                    }}>
                </div>
                <TopRightListElements>
                    <Coordinates title={"Центр в области"} x={-1 * position.x} y={position.y}/>
                    <Coordinates title={"Указатель мыши"} x={mousePosition.x + -1 * position.x}
                                 y={mousePosition.y + position.y}/>
                </TopRightListElements>
            </div>
        </main>
    )
}

/*
<svg style={{zIndex: 10000}} width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_1184_755)">
                            <rect width="100" height="1" transform="translate(-25 24.5)" fill="white"/>
                        </g>
                        <rect width="1" height="50" transform="translate(24.5)" fill="white"/>
                        <defs>
                            <clipPath id="clip0_1184_755">
                                <rect width="50" height="50" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
 */