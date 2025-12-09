import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Style from "./authCallback.module.scss";
import anim1 from "../../anim1.svg";
import anim2 from "../../anim2.svg";

const YANDEX_CLIENT_ID = process.env.REACT_APP_YANDEX_CLIENT_ID || "";
const YANDEX_CLIENT_SECRET = process.env.REACT_APP_YANDEX_CLIENT_SECRET || "";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setStatus("error");
            setError("Ошибка авторизации");
            setTimeout(() => navigate("/login"), 3000);
            return;
        }

        if (!code) {
            setStatus("error");
            setError("Код авторизации не получен");
            setTimeout(() => navigate("/login"), 3000);
            return;
        }

        // Обмениваем код на токен
        fetch("https://oauth.yandex.ru/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                client_id: YANDEX_CLIENT_ID,
                client_secret: YANDEX_CLIENT_SECRET,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.access_token) {
                    localStorage.setItem("yandex_token", data.access_token);
                    localStorage.setItem("yandex_refresh_token", data.refresh_token || "");
                    
                    // Получаем информацию о пользователе
                    return fetch("https://login.yandex.ru/info", {
                        headers: {
                            Authorization: `OAuth ${data.access_token}`,
                        },
                    });
                } else {
                    throw new Error("Токен не получен");
                }
            })
            .then((res) => res.json())
            .then(async (userInfo) => {
                localStorage.setItem("user_info", JSON.stringify(userInfo));
                
                // Сохраняем пользователя в базу данных через API
                try {
                    await fetch("/api/auth/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            yandexId: userInfo.id,
                            email: userInfo.default_email,
                            displayName: userInfo.display_name,
                            avatarUrl: userInfo.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200` : null,
                        }),
                    });
                } catch (err) {
                    console.error("Failed to sync user to database:", err);
                }
                
                setStatus("success");
                setTimeout(() => navigate("/app"), 1000);
            })
            .catch((err) => {
                console.error("Auth error:", err);
                setStatus("error");
                setError(err.message || "Ошибка авторизации");
                setTimeout(() => navigate("/login"), 3000);
            });
    }, [searchParams, navigate]);

    return (
        <div className={Style.AuthCallback}>
            <img src={anim1} alt={"anim1"} style={{position: "absolute", top: 0, left: 0}}/>
            <img src={anim2} alt={"anim2"} style={{position: "absolute", bottom: 0, right: 0}}/>
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

