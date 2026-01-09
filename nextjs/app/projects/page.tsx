"use client";

import {getWorkflows, saveWorkflow, deleteWorkflow, WorkflowData} from "@/services/workflow";
import {FormEvent, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Style from "./Projects.module.scss";
import CardProject from "@/components/CardProject";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Empty from "@/assets/empty.svg";
import Image from "next/image";

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
    const router = useRouter();

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

        if (!projectName || projectName.trim().length === 0) {
            return;
        }

        try {
            const newProject = await saveWorkflow({
                name: projectName.trim(),
                blocks: [],
                transform: { x: 0, y: 0, scale: 1 },
            });

            if (!newProject || !newProject.id || typeof newProject.id !== "string") {
                throw new Error("Не удалось получить ID созданного проекта");
            }

            await loadProjects();
            closeModal();
            router.push(`/project/${newProject.id}`);
        } catch (error: any) {
            console.error("Ошибка создания проекта:", error);
            alert(`Ошибка создания проекта: ${error.message}`);
        }
    };

    const editProject = async (e: FormEvent) => {
        e.preventDefault();
        if (!modalState.projectId || !projectName || projectName.trim().length === 0) {
            return;
        }

        try {
            await saveWorkflow({
                id: modalState.projectId,
                name: projectName.trim(),
                blocks: [],
            });

            await loadProjects();
            closeModal();
        } catch (error: any) {
            console.error("Ошибка редактирования проекта:", error);
            alert(`Ошибка редактирования проекта: ${error.message}`);
        }
    };

    const deleteProject = async () => {
        if (!modalState.projectId) return;

        try {
            await deleteWorkflow(modalState.projectId);
            await loadProjects();
            closeModal();
        } catch (error: any) {
            console.error("Ошибка удаления проекта:", error);
            alert(`Ошибка удаления проекта: ${error.message}`);
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
                        <p style={{width: "85%"}}>Вы уверены, что хотите удалить проект &#34;{modalState.projectName}&#34;?</p>
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
                                <Image src={Empty} alt={"empty"} />
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
                                            id={project.id || undefined}
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