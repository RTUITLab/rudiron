export interface WorkflowData {
    id?: string;
    name: string;
    description?: string;
    blocks: any[];
}

export async function saveWorkflow(workflow: WorkflowData): Promise<WorkflowData> {
    const token = localStorage.getItem('yandex_token');
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch('/api/workflows', {
        method: workflow.id ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workflow),
    });

    if (!response.ok) {
        throw new Error('Failed to save workflow');
    }

    return response.json();
}

export async function getWorkflows(): Promise<WorkflowData[]> {
    const token = localStorage.getItem('yandex_token');
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch('/api/workflows', {
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

    const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete workflow');
    }
}

