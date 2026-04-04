"use client";

import Styles from "./not-found.module.scss";
import Link from "next/link";
import Image from "next/image";
import anim1 from "@/assets/anim1.svg";
import Style from "@/app/login/login.module.scss";
import anim2 from "@/assets/anim2.svg";
import {useState, useEffect} from "react";

const phrases = [
    "Ничего интересного здесь нет, можно",
    "Может скоро и добавим что-то, можно",
    "Разработчик еще не придумал страницу, можно",
    "Здесь могла быть ваша реклама. А пока можно",
    "Упс! Пусто. Зато можно"
];

export default function Custom404() {
    const [phrase, setPhrase] = useState(phrases[0]);

    useEffect(() => {
        setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Image src={anim1} alt={"anim1"} style={{position: "absolute", top: 0, left: 0, zIndex: 1}} className={Style.nonInteractive}/>
            <Image src={anim2} alt={"anim2"} style={{position: "absolute", bottom: 0, right: 0, zIndex: 1}} className={Style.nonInteractive}/>
            <div className={Styles.container}>
                <div className={Styles.headerContainer}>
                    <div className={Styles.wrapper}>
                        <h1 className={Styles.header}>
                            4
                            <svg
                                className={Styles.icon}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12,2 C16.9706,2 21,6.02944 21,11 L21,19.6207 C21,21.4506 19.0341,22.6074 17.4345,21.7187 L17.0720446,21.5243825 C16.0728067,21.0124062 15.2881947,20.8437981 14.1830599,21.4100628 L13.9846,21.5177 C12.8231222,22.1813611 11.4120698,22.2182312 10.2228615,21.6283102 L10.0154,21.5177 C8.73821,20.7879 7.84896,21.0056 6.56554,21.7187 C4.96587,22.6074 3,21.4506 3,19.6207 L3,11 C3,6.02944 7.02944,2 12,2 Z M8.5,9 C7.67157,9 7,9.67157 7,10.5 C7,11.3284 7.67157,12 8.5,12 C9.32843,12 10,11.3284 10,10.5 C10,9.67157 9.32843,9 8.5,9 Z M15.5,9 C14.6716,9 14,9.67157 14,10.5 C14,11.3284 14.6716,12 15.5,12 C16.3284,12 17,11.3284 17,10.5 C17,9.67157 16.3284,9 15.5,9 Z"
                                      fill="#90d7ff"
                                />
                            </svg>
                            4
                        </h1>
                    </div>
                    <div>
                        <h2>{phrase} <Link href={"/"}>вернуться</Link> обратно</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}