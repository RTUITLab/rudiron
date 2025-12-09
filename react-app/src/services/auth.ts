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
    localStorage.setItem('yandex_token', token);
    if (refreshToken) {
        localStorage.setItem('yandex_refresh_token', refreshToken);
    }
}

export function getUserToken(): string | null {
    return localStorage.getItem('yandex_token');
}

export function clearUserData() {
    localStorage.removeItem('yandex_token');
    localStorage.removeItem('yandex_refresh_token');
    localStorage.removeItem('user_info');
}





