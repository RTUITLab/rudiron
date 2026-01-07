interface ProjectAvatarProps {
    name: string;
    size?: number;
}

function getAcidColor(seed?: string) {
    let hue = Math.floor(Math.random() * 360);
    if (seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        hue = Math.abs(hash) % 360;
    }

    const saturation = 95;
    const lightness = 55;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const ProjectAvatarSVG = ({ name, size = 100 }: ProjectAvatarProps) => {
    const firstLetter = name[0]?.toUpperCase() || "?";
    const color = getAcidColor(name);

    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="4" />

            <text
                x="50"
                y="50"
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize="50"
                fontWeight="bold"
                fill={color}
                fontFamily="sans-serif"
            >
                {firstLetter}
            </text>
        </svg>
    );
};
