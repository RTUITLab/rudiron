import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Style from "./login.module.scss";
import anim1 from "../../anim1.svg";
import anim2 from "../../anim2.svg";

const YANDEX_CLIENT_ID = process.env.REACT_APP_YANDEX_CLIENT_ID || "";
const YANDEX_REDIRECT_URI = process.env.REACT_APP_YANDEX_REDIRECT_URI || `${window.location.origin}/auth/callback`;

export default function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем, есть ли уже токен
        const token = localStorage.getItem("yandex_token");
        if (token) {
            navigate("/app");
        }
    }, [navigate]);

    const handleYandexLogin = () => {
        const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(YANDEX_REDIRECT_URI)}`;
        window.location.href = authUrl;
    };

    return (
        <div className={Style.Login}>
            <img src={anim1} alt={"anim1"} style={{position: "absolute", top: 0, left: 0, zIndex: 1}} className={Style.nonInteractive}/>
            <img src={anim2} alt={"anim2"} style={{position: "absolute", bottom: 0, right: 0, zIndex: 1}} className={Style.nonInteractive}/>
            <div className={Style.LoginContainer}>
                <h1>Авторизация</h1>
                <p>Для входа в аккаунт используйте авторизацию через Яндекс. Это быстро и безопасно.</p>
                <button onClick={handleYandexLogin} className={Style.YandexButton}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0C27.9401 0 36 8.05985 36 18C36 27.9401 27.9401 36 18 36C8.05985 36 0 27.9401 0 18C0 8.05985 8.05985 0 18 0Z" fill="#FC3F1D"/>
                    <path d="M20.4988 28.3491H24.2594V6.75312H18.788C13.2868 6.74813 10.394 9.57606 10.394 13.7406C10.394 17.0673 11.9801 19.0224 14.808 21.0424L9.90027 28.3441H13.9701L19.4364 20.1696L17.5412 18.8978C15.2419 17.3466 14.1247 16.1347 14.1247 13.5212C14.1247 11.2219 15.7407 9.66584 18.818 9.66584H20.4938L20.4988 28.3491Z" fill="white"/>
                </svg>
                    Продолжить с Яндекс
                </button>
            </div>
        </div>
    );
}





