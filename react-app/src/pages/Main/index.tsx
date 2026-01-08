import Style from "./Main.module.scss";
import MireaGerb from "../../MIREA.png"
import MainAnim from "../../MainAnim.svg";
import {Link} from "react-router-dom";


export default function Main() {
    return (
        <>
            <img src={MainAnim} alt={"Anim"} className={Style.anim} />
            <img src={MireaGerb} alt="MireaGerb" className={Style.gerb} />
            <main className={Style.main}>
                <h1 className={Style.title}>KidsCode</h1>
                <p className={Style.description}>NoCode-платформа для Интернета вещей</p>
                <Link to={"/projects"}>
                    <button className={Style.button}>Начать 🚀</button>
                </Link>
            </main>
        </>
    )
}