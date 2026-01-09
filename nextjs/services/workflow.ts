import { getUserToken } from "./auth";

export interface WorkflowData {
    id?: string;
    name: string;
    description?: string;
    blocks: any[];
    transform?: { x: number; y: number; scale: number };
}

export async function saveWorkflow(workflow: WorkflowData): Promise<WorkflowData> {
    const token = getUserToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    if (!workflow.name || workflow.name.trim().length === 0) {
        throw new Error('Workflow name is required');
    }

    const url = workflow.id
        ? `/api/workflows/${workflow.id}`
        : `/api/workflows`;

    const method = workflow.id ? 'PUT' : 'POST';

    const body = {
        name: workflow.name.trim(),
        description: workflow.description || null,
        blocks: workflow.blocks || [],
        transform: workflow.transform || null,
    };

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

        return await response.json();
    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Сервер не доступен. Проверьте подключение к интернету.');
        }
        throw error;
    }
}

export async function getWorkflows(): Promise<WorkflowData[]> {
    const token = getUserToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await fetch('/api/workflows', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to fetch workflows';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Сервер не доступен. Проверьте подключение к интернету.');
        }
        throw error;
    }
}

export async function deleteWorkflow(id: string): Promise<void> {
    const token = getUserToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    if (!id || typeof id !== 'string') {
        throw new Error('Workflow ID is required');
    }

    try {
        const response = await fetch(`/api/workflows/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to delete workflow';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }
    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Сервер не доступен. Проверьте подключение к интернету.');
        }
        throw error;
    }
}

export async function getWorkflow(id: string): Promise<WorkflowData> {
    const token = getUserToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    if (!id || typeof id !== 'string') {
        throw new Error('Workflow ID is required');
    }

    try {
        const response = await fetch(`/api/workflows/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to fetch workflow';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Сервер не доступен. Проверьте подключение к интернету.');
        }
        throw error;
    }
}

