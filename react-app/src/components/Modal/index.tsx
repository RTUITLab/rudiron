import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    className?: string;
}

export default function Modal({isOpen, onClose, title, children, showCloseButton = true, className = "",}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const handleWrapperClick = (e: React.MouseEvent) => {
        if (e.target === wrapperRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={wrapperRef}
            className={`${styles.modal__wrapper} ${className}`}
            onClick={handleWrapperClick}
        >
            <div
                ref={modalRef}
                className={styles.modal}
                tabIndex={-1}
                role="dialog"
                aria-labelledby="modal-title"
            >
                <div className={styles.modal__header}>
                    <h2 id="modal-title" className={styles.modal__title}>
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            className={styles.modal__close}
                            onClick={onClose}
                            aria-label="Закрыть модальное окно"
                        >
                            <svg viewBox="0 0 24 24">
                                <path
                                    d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                    fill="#fff"
                                />
                            </svg>
                        </button>
                    )}
                </div>
                <div className={styles.modal__content}>{children}</div>
            </div>
        </div>
    );
}