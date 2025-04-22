import {ReactNode, useState} from "react";
import Style from "./blocks.module.scss";

interface Props {
    children: ReactNode;
}

export default function Blocks({children}: Props) {
    const [x, setX] = useState<null | number>(0);
    const [y, setY] = useState<null | number>(0);
    const [z, setZ] = useState<null | number>(0);

    return (
        <div className={Style.Blocks}>
            {children}
        </div>
    )
}