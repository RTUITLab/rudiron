import Style from "./coordinates.module.scss";

interface Props {
    x: number,
    y: number,
}

export default function Coordinates({x, y}: Props)
{
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    
    return (
        <div className={Style.Сoordinates}>
            <div>
                <p>X: <span>{roundedX}</span></p>
                <p>Y: <span>{roundedY}</span></p>
            </div>
        </div>
    )
}