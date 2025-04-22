import Style from "./blockInput.module.scss";

interface Props {
    title: string;
    systemTitle: string;
}

export default function BlockInput({title, systemTitle}: Props) {
    return (
        <div className={Style.BlockInput}>
            <label htmlFor={systemTitle}>{title}</label>
            <input placeholder={title+"..."} name={systemTitle} type={"text"}/>
        </div>
    )
}