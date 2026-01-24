import { useRef, useEffect } from "react";

export default function MainEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const colors = [
            ["#00bfff", "#7f00ff"],
            ["#ff00ff", "#00ffcc"],
            ["#ff9900", "#ff0066"],
        ];

        // создаём «блоб» с массивом случайных радиусов для каждой вершины
        const blobs = colors.map((c, i) => {
            const points = 6 + i * 2;
            const baseRadius = 250 + i * 120; // фиксированная база, как в старом
            return {
                points,
                radius: baseRadius,
                phase: i * 2,
                color1: c[0],
                color2: c[1],
                speed: 0.00025 + i * 0.0001,
            };
        });

        const drawBlob = (b: typeof blobs[number], t: number) => {
            const cx = w / 2;
            const cy = h / 2;

            const a = Math.sin(t * b.speed + b.phase) * Math.PI * 2;
            const offset = Math.sin(t * 0.0002 + b.phase) * 200;

            const x0 = cx + Math.cos(a) * offset;
            const y0 = cy + Math.sin(a * 0.8) * offset;

            ctx.beginPath();
            for (let i = 0; i <= b.points; i++) {
                const theta = (i / b.points) * Math.PI * 2;
                const noise = Math.sin(t * 0.001 + i + b.phase) * 40; // небольшое колебание
                const r = b.radius + noise;
                const x = x0 + Math.cos(theta) * r;
                const y = y0 + Math.sin(theta) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            const grad = ctx.createRadialGradient(x0, y0, 0, x0, y0, b.radius * 3);
            grad.addColorStop(0, `${b.color1}33`);
            grad.addColorStop(0.5, `${b.color2}22`);
            grad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.globalAlpha = 0.45;
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = grad;
            ctx.fill();
        };


        const render = (t: number) => {
            ctx.fillStyle = "rgba(0,0,0,0.05)";
            ctx.fillRect(0, 0, w, h);

            blobs.forEach((b) => drawBlob(b, t));
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                background: "#000",
                mixBlendMode: "screen",
                filter: "blur(60px) contrast(1.1)", // сильный блюр, чтобы не было видно точек
            }}
        />
    );
}
