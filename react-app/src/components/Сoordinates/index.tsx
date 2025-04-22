import Style from "./coordinates.module.scss";

interface Props {
    x: number,
    y: number,
    title: string,
}

export default function Coordinates({x, y, title}: Props)
{
    return (
        <div className={Style.Сoordinates}>
            <div>
                <p>{title}</p>
            </div>
            <div>
                <p>X: <span>{x}</span></p>
                <p>Y: <span>{y}</span></p>
            </div>
        </div>
    )
}