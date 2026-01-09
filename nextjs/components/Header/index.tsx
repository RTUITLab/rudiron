"use client";

import Style from "./header.module.scss";
import {useParams, useRouter} from "next/navigation";
import {useState, useEffect} from "react";
import Categories from "@/types/categories";
import categoriesData from "@/data/categories";
import Blocks from "@/types/blocks";
import blocksData from "@/data/blocks";
import Link from "next/link";

export default function Header() {
    const router = useRouter();
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);
    const { id } = useParams<{ id: string }>();
    const projectId = id;
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("user_info");
                if (stored) {
                    setUserInfo(JSON.parse(stored));
                }
            } catch (error) {
                console.error("Error parsing user info:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("yandex_token");
            localStorage.removeItem("yandex_refresh_token");
            localStorage.removeItem("user_info");
            
            // Удаляем токены из cookies
            document.cookie = 'yandex_token=; path=/; max-age=0';
            document.cookie = 'yandex_refresh_token=; path=/; max-age=0';
        }
        router.push("/login");
    };

    return (
        <header className={Style.Header}>
            <Link href={"/projects"} style={{ textDecoration: "none", color: "white" }}>
                <h1>KidsCode</h1>
            </Link>
            <div className={Style.UserInfo}>
                {userInfo.display_name && (
                    <span>{userInfo.display_name}</span>
                )}
                <button onClick={handleLogout} className={Style.LogoutButton}>
                    <svg width="44" height="48" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M14.5248 6C14.4 7.38631 14.4 9.12852 14.4 11.3324V36.6675C14.4 38.8714 14.4 40.6138 14.5248 42H12C6.34316 42 3.51473 42 1.75735 40.2428C-1.43051e-07 38.4852 0 35.6568 0 30V18C0 12.3432 -1.43051e-07 9.51473 1.75735 7.75735C3.51473 6 6.34316 6 12 6H14.5248Z" fill="#D6D6D6"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.0974 0.98087C14.4 2.48565 14.4 5.23821 14.4 10.7434V37.2567C14.4 42.7618 14.4 45.5144 16.0974 47.0192C17.7948 48.524 20.3892 48.0713 25.5783 47.1663L31.1674 46.1916C36.9142 45.1892 39.7875 44.688 41.4939 42.5801C43.2001 40.4724 43.2001 37.424 43.2001 31.327V16.6731C43.2001 10.5761 43.2001 7.52765 41.4939 5.41982C39.7875 3.31197 36.9142 2.81082 31.1674 1.80849L25.5783 0.833654C20.3892 -0.0713874 17.7948 -0.523908 16.0974 0.98087ZM23.4 21.4884C23.4 20.448 22.5941 19.6047 21.6 19.6047C20.606 19.6047 19.8 20.448 19.8 21.4884V26.5116C19.8 27.552 20.606 28.3954 21.6 28.3954C22.5941 28.3954 23.4 27.552 23.4 26.5116V21.4884Z" fill="#D6D6D6"/>
                    </svg>
                </button>
            </div>
        </header>
    )
}