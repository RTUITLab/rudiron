import {Block} from "../../types/blocks";
import Style from "./blockAside.module.scss";
import {DragEvent, MutableRefObject} from "react";

interface Props {
    workSpacePermission: boolean;
    color: string;
    block: Block;
    refCanDrop: MutableRefObject<boolean>;
}

export default function BlockAside({color, block, refCanDrop, workSpacePermission}:Props) {
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        if (!block.workspace)
        {
            refCanDrop.current = true;
        }
        e.dataTransfer.setData("application/json", JSON.stringify({color: color, block: block}));
    };

    return (
        <div draggable={workSpacePermission ? true : block.workspace} style={{opacity: workSpacePermission ? "1" : block.workspace ? "1" : "0.5", cursor: workSpacePermission ? "grab" : block.workspace ? "grab" : "not-allowed"}} onDragStart={handleDragStart} className={Style.BlockAside}>
            <div style={{backgroundColor: color}}/>
            <div>
                <p>{block.menu_name}</p>
            </div>
        </div>
    )
}