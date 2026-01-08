export interface WorkflowData {
    id?: string;
    name: string;
    description?: string;
    blocks: any[];
    transform?: { x: number; y: number; scale: number };
}

const API_BASE = 'http://localhost:3001';

export async function saveWorkflow(workflow: WorkflowData): Promise<WorkflowData> {
    const token = localStorage.getItem('yandex_token');
    if (!token) {
        throw new Error('Not authenticated');
    }

    // Добавьте API_BASE
    const url = workflow.id
        ? `${API_BASE}/api/workflows/${workflow.id}`
        : `${API_BASE}/api/workflows`;

    const method = workflow.id ? 'PUT' : 'POST';

    const body = workflow.id 
        ? { name: workflow.name, description: workflow.description, blocks: workflow.blocks, transform: workflow.transform }
        : workflow;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to save workflow';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        return response.json();
    } catch (error: any) {
        // Если это ошибка сети (404 может быть из-за того, что сервер не запущен)
        if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
            throw new Error('Сервер не доступен. Убедитесь, что сервер запущен на порту 3001');
        }
        throw error;
    }
}

export async function getWorkflows(): Promise<WorkflowData[]> {
    const token = localStorage.getItem('yandex_token');
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/api/workflows`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch workflows');
    }

    return response.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
    const token = localStorage.getItem('yandex_token');
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/api/workflows/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete workflow');
    }
}

