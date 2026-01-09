import Style from "./aside.module.scss";
import Search from "../Search";
import Categories from "@/types/categories";
import Blocks from "@/types/blocks";
import CategoryDiv from "../Category";
import {MutableRefObject, useState} from "react";

interface Props {
    workSpacePermission: boolean;
    categories: Categories,
    blocks: Blocks,
    refCanDrop: MutableRefObject<boolean>,
}

const sortBlocksByCategory = (categories: Categories, blocks: Blocks) => {
    const groupedBlocks: Record<string, Blocks> = {};

    categories.forEach(category => {
        groupedBlocks[category.name] = [];
    });

    blocks.forEach(block => {
        if (groupedBlocks[block.category]) {
            groupedBlocks[block.category].push(block);
        }
    });

    return groupedBlocks;
};

export default function Aside({categories, blocks, refCanDrop, workSpacePermission}:Props) {
    const [sortedBlocks, setSortedBlocks] = useState<Blocks>(blocks);
    const blocksByCategory = sortBlocksByCategory(categories, sortedBlocks);

    return (
        <aside className={Style.Aside}>
            <Search originBlocks={blocks} setSortedBlocks={setSortedBlocks}/>
            <div className={Style.AsideCategories}>
                {categories.map((category, index) => (
                    <CategoryDiv workSpacePermission={workSpacePermission} refCanDrop={refCanDrop} key={index} category={category} blocks={blocksByCategory[category.name] || []}  />
                ))}
            </div>
        </aside>
    )
}