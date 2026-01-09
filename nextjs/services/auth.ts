export interface UserInfo {
    id: string;
    login: string;
    display_name?: string;
    real_name?: string;
    first_name?: string;
    last_name?: string;
    default_email?: string;
    emails?: string[];
    default_avatar_id?: string;
    is_avatar_empty?: boolean;
    psuid?: string;
}

export async function getUserInfo(token: string): Promise<UserInfo | null> {
    try {
        const response = await fetch('https://login.yandex.ru/info', {
            headers: {
                Authorization: `OAuth ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

export function saveUserToken(token: string, refreshToken?: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('yandex_token', token);
        if (refreshToken) {
            localStorage.setItem('yandex_refresh_token', refreshToken);
        }
        
        // Сохраняем токен в cookies для proxy
        document.cookie = `yandex_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
        if (refreshToken) {
            document.cookie = `yandex_refresh_token=${refreshToken}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }
}

export function getUserToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('yandex_token');
    }
    return null;
}

export function clearUserData() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('yandex_token');
        localStorage.removeItem('yandex_refresh_token');
        localStorage.removeItem('user_info');
        
        // Удаляем токены из cookies
        document.cookie = 'yandex_token=; path=/; max-age=0';
        document.cookie = 'yandex_refresh_token=; path=/; max-age=0';
    }
}
