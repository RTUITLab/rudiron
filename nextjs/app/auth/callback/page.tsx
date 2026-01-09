"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Style from "./authCallback.module.scss";
import anim1 from "@/assets/anim1.svg";
import anim2 from "@/assets/anim2.svg";
import { saveUserToken } from "@/services/auth";
import Image from "next/image";

export default function AuthCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams.get("code");
            const errorParam = searchParams.get("error");

            if (errorParam) {
                setStatus("error");
                setError("Ошибка авторизации от Yandex");
                setTimeout(() => router.push("/login"), 3000);
                return;
            }

            if (!code) {
                setStatus("error");
                setError("Код авторизации не получен");
                setTimeout(() => router.push("/login"), 3000);
                return;
            }

            try {
                // Получаем токен от сервера
                const tokenResponse = await fetch("/api/auth/yandex", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json().catch(() => ({}));
                    throw new Error(errorData.error || "Ошибка получения токена");
                }

                const tokenData = await tokenResponse.json();

                if (!tokenData.access_token) {
                    throw new Error(tokenData.error || "Токен не получен");
                }

                // Сохраняем токены
                saveUserToken(tokenData.access_token, tokenData.refresh_token);

                // Получаем информацию о пользователе
                const userInfoResponse = await fetch("https://login.yandex.ru/info", {
                    headers: { Authorization: `OAuth ${tokenData.access_token}` },
                });

                if (!userInfoResponse.ok) {
                    throw new Error("Не удалось получить информацию о пользователе");
                }

                const userInfo = await userInfoResponse.json();
                localStorage.setItem("user_info", JSON.stringify(userInfo));

                // Синхронизируем пользователя с базой
                const syncResponse = await fetch("/api/auth/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        yandexId: userInfo.id,
                        email: userInfo.default_email,
                        displayName: userInfo.display_name,
                        avatarUrl: userInfo.default_avatar_id
                            ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
                            : null,
                    }),
                });

                if (!syncResponse.ok) {
                    console.error("Failed to sync user to database");
                    // Не блокируем авторизацию, если синхронизация не удалась
                }

                setStatus("success");
                
                // Проверяем, есть ли сохраненный redirect в sessionStorage
                const savedRedirect = typeof window !== "undefined" ? sessionStorage.getItem("auth_redirect") : null;
                if (savedRedirect) {
                    sessionStorage.removeItem("auth_redirect");
                }
                
                const redirectPath = savedRedirect && savedRedirect !== "/login" ? savedRedirect : "/projects";
                
                setTimeout(() => router.push(redirectPath), 1000);
            } catch (err: any) {
                console.error("Auth error:", err);
                setStatus("error");
                setError(err.message || "Ошибка авторизации");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        handleAuth();
    }, [searchParams, router]);

    return (
        <div className={Style.AuthCallback}>
            <Image src={anim1} alt="anim1" style={{ position: "absolute", top: 0, left: 0 }} />
            <Image src={anim2} alt="anim2" style={{ position: "absolute", bottom: 0, right: 0 }} />
            <div className={Style.Container}>
                {status === "loading" && (
                    <>
                        <div className={Style.Spinner}></div>
                        <p>Авторизация...</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className={Style.Success}>✓</div>
                        <p>Успешная авторизация!</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className={Style.Error}>✗</div>
                        <p>{error}</p>
                        <p className={Style.Redirect}>Перенаправление на страницу входа...</p>
                    </>
                )}
            </div>
        </div>
    );
}
