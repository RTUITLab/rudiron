import {updateWorkflowName} from "@/services/workflow";
import {useState} from "react";
import Style from "./InputNameProject.module.scss";

interface Props {
    id: string;
    name: string;
    onNameUpdated: (name: string) => void;
}

export default function InputNameProject({id, name, onNameUpdated}: Props) {
    const [editMode, setEditMode] = useState(false);
    const [currentName, setCurrentName] = useState(name);

    const saveName = async () => {
        if (currentName.trim() === name) {
            console.log('1')
            setEditMode(false);
            return;
        }

        try {
            await updateWorkflowName(id, currentName);
            setEditMode(false);
            console.log('2')
            if (onNameUpdated) {
                onNameUpdated(currentName);
            }
        } catch (error) {
            console.log('3');
            console.log(error);
            setCurrentName(name);
            setEditMode(false);
        }
    }

    return (
        <div id={"project-name"}>
            {editMode ?
                <input
                    className={Style.input}
                    spellCheck={false}
                    type="text"
                    value={currentName}
                    onChange={e => setCurrentName(e.target.value)}
                    onBlur={saveName}
                    autoFocus
                />
                : <span className={Style.name} onClick={() => setEditMode(true)}>{name}</span>
            }
        </div>
    )
}