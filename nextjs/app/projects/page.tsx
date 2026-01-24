"use client";

import {getWorkflows, saveWorkflow, deleteWorkflow, WorkflowData} from "@/services/workflow";
import {FormEvent, useCallback, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Style from "./Projects.module.scss";
import CardProject from "@/components/CardProject";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Empty from "@/assets/empty.svg";
import Image from "next/image";
import ProjectsLoader from "@/components/ProjectsLoader";

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export default function Projects() {
    const [projects, setProjects] = useState<WorkflowData[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [projectName, setProjectName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
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

    function getVisiblePages(current: number, total: number, delta: number = 2) {
        const pages = [];
        const range = {
            start: Math.max(2, current - delta),
            end: Math.min(total - 1, current + delta),
        };

        for (let i = range.start; i <= range.end; i++) {
            pages.push(i);
        }

        if (range.start > 2) pages.unshift("...");
        if (range.end < total - 1) pages.push("...");

        pages.unshift(1);
        if (total > 1) pages.push(total);

        return pages;
    }


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

    const loadProjects = useCallback(async (page: number = 1, append: boolean = false) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await getWorkflows(page, pagination.limit);

            if (append) {
                setProjects(prev => [...prev, ...response.data]);
            } else {
                setProjects(response.data);
            }

            setPagination(response.pagination);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        loadProjects(1);
    }, [loadProjects]);

    const handleLikeChange = (projectId: string, liked: boolean) => {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.id === projectId
                    ? {...project, liked}
                    : project
            )
        );
    }

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
                liked: false,
            });

            if (!newProject || !newProject.id || typeof newProject.id !== "string") {
                throw new Error("Не удалось получить ID созданного проекта");
            }

            await loadProjects(1);

            closeModal();
            router.push(`/project/${newProject.id}`);
        } catch (error: any) {
            console.error("Ошибка создания проекта:", error);
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
                liked: false,
            });

            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project.id === modalState.projectId
                        ? {...project, name: projectName.trim()}
                        : project
                )
            );
            closeModal();
        } catch (error: any) {
            console.error("Ошибка редактирования проекта:", error);
        }
    };

    const deleteProject = async () => {
        if (!modalState.projectId) return;

        try {
            await deleteWorkflow(modalState.projectId);

            setProjects(prevProjects =>
                prevProjects.filter(project => project.id !== modalState.projectId)
            );
            closeModal();
        } catch (error: any) {
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

    const allProjects = projects;
    const likedProjects = projects.filter((p => p.liked === true));

    return (
        <>
            <Header/>
            <main className={Style.main}>
                <button onClick={() => openModal("create")} className={Style.createButton}>Создать</button>
                <div className={Style.block}>
                    <div className={Style.blockTitle}>
                        <h2 className={Style.title}>Избранное</h2>
                        <div className={Style.line}></div>
                    </div>
                    {loading
                        ? <div className={Style.empty}><ProjectsLoader/></div> : likedProjects.length === 0
                            ? <div className={Style.empty}>
                                <Image src={Empty} alt={"empty"} />
                                <div>
                                    <h2>Пусто</h2>
                                    <p>Добавьте проект в избранное</p>
                                </div>
                            </div>
                            :
                            <div className={Style.test}>
                                <div className={Style.grid}>
                                    {likedProjects.map((project) => (
                                        <CardProject
                                            key={project.id}
                                            id={project.id || undefined}
                                            name={project.name}
                                            description={project.description}
                                            liked={project.liked}
                                            onEdit={() => openModal("edit", project.id, project.name)}
                                            onDelete={() => openModal("delete", project.id, project.name)}
                                            onLikeChange={handleLikeChange}
                                        />
                                    ))}
                                </div>
                            </div>
                    }
                    <div className={Style.blockTitle}>
                        <h2 className={Style.title}>Мои проекты</h2>
                        <div className={Style.line}></div>
                    </div>
                    {loading
                        ? <div className={Style.empty}><ProjectsLoader/></div> : projects.length === 0
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
                                    {allProjects.map((project) => (
                                        <CardProject
                                            key={project.id}
                                            id={project.id || undefined}
                                            name={project.name}
                                            description={project.description}
                                            liked={project.liked}
                                            onEdit={() => openModal("edit", project.id, project.name)}
                                            onDelete={() => openModal("delete", project.id, project.name)}
                                            onLikeChange={handleLikeChange}
                                        />
                                    ))}
                                </div>
                            </div>
                    }
                </div>
                {!loading && pagination.totalPages > 1 && (
                    <div className={Style.pagination}>
                        <button
                            disabled={!pagination.hasPrevPage}
                            onClick={() => loadProjects(pagination.page - 1)}
                        >
                            ‹
                        </button>

                        {getVisiblePages(pagination.page, pagination.totalPages).map((pageNum, idx) =>
                            pageNum === "..." ? (
                                <span key={`ellipsis-${idx}`}>...</span>
                            ) : (
                                <button
                                    key={pageNum}
                                    className={`${Style.pageButton} ${
                                        pagination.page === pageNum ? Style.active : ""
                                    }`}
                                    onClick={() => loadProjects(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            )
                        )}


                        <button
                            disabled={!pagination.hasNextPage}
                            onClick={() => loadProjects(pagination.page + 1)}
                        >
                            ›
                        </button>
                    </div>
                )}
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