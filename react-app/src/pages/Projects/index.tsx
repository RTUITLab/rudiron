import {getWorkflows, WorkflowData} from "../../services/workflow";
import {FormEvent, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Style from "./Projects.module.scss";
import CardProject from "../../components/CardProject";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import Empty from "../../empty.svg";

export default function Projects() {
    const [projects, setProjects] = useState<WorkflowData[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: "create" | "edit" | "delete" | null;
        projectId?: string;
        projectName?: string;
    }>({
        isOpen: false,
        type: null,
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const openModal = (type: "create" | "edit" | "delete", projectId?: string, projectName?: string) => {
        setModalState({
            isOpen: true,
            type,
            projectId,
            projectName,
        });
        setProjectName(projectName || "");
    };

    const closeModal = () => {
        setModalState({ isOpen: false, type: null });
        setProjectName("");
    };

    const loadProjects = async () => {
        try {
            const response = await getWorkflows();
            setProjects(response);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('yandex_token');

            const response = await fetch('/api/workflows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: projectName,
                    blocks: [],
                    transform: { x: 0, y: 0, scale: 1 },
                }),
            });

            const newProject = await response.json();
            await loadProjects();
            closeModal();
            navigate(`/project/${newProject.id}`);

        } catch (error) {
            console.error("Ошибка создания проекта:", error);
        }
    };

    const editProject = async (e: FormEvent) => {
        e.preventDefault();
        if (!modalState.projectId) return;

        try {
            const token = localStorage.getItem('yandex_token');

            await fetch(`/api/workflows/${modalState.projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: projectName,
                }),
            });

            await loadProjects();
            closeModal();
        } catch (error) {
            console.error("Ошибка редактирования проекта:", error);
        }
    };

    const deleteProject = async () => {
        if (!modalState.projectId) return;

        try {
            const token = localStorage.getItem('yandex_token');

            await fetch(`/api/workflows/${modalState.projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            await loadProjects();
            closeModal();
        } catch (error) {
            console.error("Ошибка удаления проекта:", error);
        }
    };

    const renderModalContent = () => {
        switch (modalState.type) {
            case "create":
                return (
                    <form onSubmit={createProject}>
                        <div className={Style.modal__form}>
                            <div className={Style.modal__input}>
                                <label className={Style.modal__input_label}>Название проекта</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Введите название проекта"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className={Style.modal__buttons}>
                                <button type="button" onClick={closeModal} className={Style.cancel}>
                                    Отмена
                                </button>
                                <button type="submit" className={Style.save}>
                                    Создать
                                </button>
                            </div>
                        </div>
                    </form>
                );

            case "edit":
                return (
                    <form onSubmit={editProject}>
                        <div className={Style.modal__form}>
                            <div className={Style.modal__input}>
                                <label className={Style.modal__input_label}>Название проекта</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Введите название проекта"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className={Style.modal__buttons}>
                                <button type="button" onClick={closeModal} className={Style.cancel}>
                                    Отмена
                                </button>
                                <button type="submit" className={Style.save}>
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </form>
                );

            case "delete":
                return (
                    <div className={Style.modal__form}>
                        <p style={{width: "85%"}}>Вы уверены, что хотите удалить проект "{modalState.projectName}"?</p>
                        <p className={Style.modal__warning}>Это действие нельзя отменить.</p>
                        <div className={Style.modal__buttons}>
                            <button type="button" onClick={closeModal} className={Style.cancel}>
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={deleteProject}
                                className={Style.delete}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (modalState.type) {
            case "create":
                return "Создать проект";
            case "edit":
                return "Редактировать проект";
            case "delete":
                return "Удалить проект";
            default:
                return "";
        }
    };

    return (
        <>
            <Header/>
            <main className={Style.main}>
                <button onClick={() => openModal("create")} className={Style.createButton}>Создать</button>
                <div className={Style.block}>
                    <div className={Style.blockTitle}>
                        <h2 className={Style.title}>Мои проекты</h2>
                        <div className={Style.line}></div>
                    </div>
                    {loading
                        ? <Loader/> : projects.length === 0
                            ? <div className={Style.empty}>
                                <img src={Empty} alt={"empty"} />
                                <div>
                                    <h2>Пусто</h2>
                                    <p>Создайте свой первый проект</p>
                                </div>
                            </div>
                            :
                            <div className={Style.test}>
                                <div className={Style.grid}>
                                    {projects.map((project) => (
                                        <CardProject
                                            key={project.id}
                                            id={project.id}
                                            name={project.name}
                                            description={project.description}
                                            onEdit={() => openModal("edit", project.id, project.name)}
                                            onDelete={() => openModal("delete", project.id, project.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                    }
                </div>
            </main>

            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={getModalTitle()}
            >
                {renderModalContent()}
            </Modal>
        </>
    );
}