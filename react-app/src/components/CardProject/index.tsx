import Style from "./CardProject.module.scss";
import { useNavigate } from "react-router-dom";
import { ProjectAvatarSVG } from "../ProjectAvatarSVG";
import {useEffect, useRef, useState} from "react";
import { CardMenu } from "../CardMenu";

interface Props {
    id: string | undefined;
    name: string;
    description: string | undefined;
    onEdit?: (id: string) => void;
    onDelete?: (id: string, name: string) => void;
}

export default function CardProject({id, name, description, onEdit, onDelete}: Props) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLDivElement | null>(null);

    const openMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();

            let left = rect.left;
            const menuWidth = 200;
            if (left + menuWidth > window.innerWidth - 20) {
                left = window.innerWidth - menuWidth - 20;
            }

            setMenuPos({
                top: rect.bottom + window.scrollY,
                left: left + window.scrollX
            });
            setMenuOpen(true);
        }
    };

    const handleEdit = () => {
        if (onEdit && id) {
            onEdit(id);
        }
        setMenuOpen(false);
    };

    const handleDelete = () => {
        if (onDelete && id) {
            onDelete(id, name);
        }
        setMenuOpen(false);
    };

    const handleCardClick = () => {
        if (!menuOpen && id) {
            navigate(`/project/${id}`);
        }
    };

    return (
        <div className={Style.card} onClick={handleCardClick}>
            <div
                ref={btnRef}
                className={Style.menu}
                onClick={openMenu}
                title="Открыть меню"
            >
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="2" fill="#fff"/>
                    <circle cx="12" cy="12" r="2" fill="#fff"/>
                    <circle cx="12" cy="18" r="2" fill="#fff"/>
                </svg>
            </div>

            <ProjectAvatarSVG name={name} />

            <div className={Style.namespace}>
                <h3>{name}</h3>
                <p>{description?.trim() || "Изменено недавно"}</p>
            </div>

            {menuOpen && (
                <CardMenu
                    position={menuPos}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClose={() => setMenuOpen(false)}
                />
            )}
        </div>
    );
}