import {ReactNode} from "react";
import Style from "./topRightListElements.module.scss";

interface Props {
    children: ReactNode
}

export default function TopRightListElements({children}: Props) {
    return <div className={Style.TopRightListElements}>{children}</div>
}