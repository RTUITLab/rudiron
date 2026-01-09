"use client";

import { useRouter } from "next/navigation";
import Style from "./Main.module.scss";
import MireaGerb from "@/assets/MIREA.png"
import MainAnim from "@/assets/MainAnim.svg";
import Image from "next/image";
import { getUserToken } from "@/services/auth";


export default function Main() {
    const router = useRouter();

    const handleStart = () => {
        const token = getUserToken();
        if (token) {
            router.push("/projects");
        } else {
            router.push("/login");
        }
    };

    return (
        <>
            <Image src={MainAnim} alt={"Anim"} className={Style.anim} />
            <Image src={MireaGerb} alt="MireaGerb" className={Style.gerb} />
            <main className={Style.main}>
                <h1 className={Style.title}>KidsCode</h1>
                <p className={Style.description}>NoCode-платформа для Интернета вещей</p>
                <button onClick={handleStart} className={Style.button}>Начать 🚀</button>
            </main>
        </>
    )
}