import {Block} from "../../types/blocks";
import {CSSProperties, DragEvent} from "react";
import Style from "./blockTemplateAttachments.module.scss";
import BlockList from "../BlockList";
import BlockAttachments from "../BlockAttachments";
import BlockInput from "../BlockInput";

interface Props {
    color: string;
    block: Block;
    deleteBlock: () => void;
}

export default function BlockTemplateAttachments({ color, block, deleteBlock}: Props) {

    const styleColor: CSSProperties = {
        outlineColor: color,
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div onDragOver={handleDragOver} className={Style.BlockTemplateAttachments} style={styleColor}>
            <div style={styleColor}>
                <p>{block.menu_name}</p>
                <div>
                    <button onClick={() => deleteBlock()}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M22.75 6.4165L22.027 18.1124C21.8423 21.1007 21.7499 22.5948 21.0009 23.669C20.6306 24.2001 20.1538 24.6483 19.6008 24.9852C18.4825 25.6665 16.9855 25.6665 13.9915 25.6665C10.9936 25.6665 9.49469 25.6665 8.37556 24.9839C7.82227 24.6465 7.34533 24.1974 6.97513 23.6655C6.22635 22.5895 6.13603 21.0933 5.95538 18.1008L5.25 6.4165"
                                stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                            <path
                                d="M3.5 6.41659H24.5M18.7317 6.41659L17.9352 4.7736C17.4062 3.68222 17.1416 3.13653 16.6853 2.79619C16.5841 2.7207 16.4769 2.65355 16.3649 2.5954C15.8596 2.33325 15.2531 2.33325 14.0403 2.33325C12.797 2.33325 12.1753 2.33325 11.6616 2.60639C11.5478 2.66693 11.4391 2.7368 11.3368 2.81528C10.8752 3.1694 10.6174 3.73506 10.1017 4.86639L9.39508 6.41659"
                                stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M11.082 19.25L11.082 12.25" stroke="white" stroke-width="1.5"
                                  stroke-linecap="round"/>
                            <path d="M16.918 19.25L16.918 12.25" stroke="white" stroke-width="1.5"
                                  stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div style={styleColor}>
                {block.fields.map((elem, index) =>
                    elem.type === 1 ? (
                        <BlockList systemTitle={elem.name} title={elem.placeholder} key={"block_list_" + index}
                                   values={elem.values.length === 0 ? [] : elem.values}
                                   setValue={(newValue: string | number) => {
                                       console.log(newValue)
                                   }}/>) : elem.type === 2 ? (<BlockAttachments title={elem.placeholder}
                                                                                key={"block_attachments_" + index}/>) : elem.type === 3 && (
                        <BlockInput title={elem.placeholder} systemTitle={elem.name} key={"block_input_" + index}/>)
                )}
            </div>
        </div>
    )
}