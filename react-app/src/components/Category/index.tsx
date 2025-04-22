import {Category} from "../../types/categories";
import Style from "./category.module.scss";
import Blocks from "../../types/blocks";
import BlockAside from "../BlockAside";
import {MutableRefObject} from "react";
import Icon from "../../arrow-down-01-round.svg";

interface Props {
    category: Category,
    blocks: Blocks,
    refCanDrop: MutableRefObject<boolean>;
    workSpacePermission: boolean;
}

export default function CategoryDiv({category, blocks, refCanDrop, workSpacePermission}: Props)
{
    return blocks.length > 0 ? (
        <div className={Style.Category}>
            <details className={Style.Accordion_details} open={true}>
                <summary>
                    <img src={Icon} alt=""/>
                    <h4 role={"term"}>{category.name}</h4>
                </summary>
            </details>
            <div className={Style.Accordion_content} role={"definition"}>
                <div>
                    <div>
                        {blocks.map((elem, index) => (
                            <BlockAside workSpacePermission={workSpacePermission} refCanDrop={refCanDrop} key={"block_" + category.name + "_" + index}
                                        color={category.color} block={elem}/>))}
                    </div>
                </div>
            </div>
        </div>
    ) : (<></>);
}