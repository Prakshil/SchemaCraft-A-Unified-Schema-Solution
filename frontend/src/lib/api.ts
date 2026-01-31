/**
 * AI Schema Architect - API Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    primary_key: boolean;
    unique: boolean;
    default?: string;
    description?: string;
}

export interface Index {
    name: string;
    columns: string[];
    unique: boolean;
}

export interface Table {
    name: string;
    description?: string;
    columns: Column[];
    indexes: Index[];
}

export interface Relationship {
    from_table: string;
    from_column: string;
    to_table: string;
    to_column: string;
    type: string;
    on_delete?: string;
}

export interface Schema {
    name: string;
    description?: string;
    tables: Table[];
    relationships: Relationship[];
    suggestions: string[];
}

export interface GenerateResponse {
    status: 'success' | 'error';
    schema?: Schema;
    error?: string;
}

export interface ExportResponse {
    status: 'success' | 'error';
    code?: string;
    format: string;
    error?: string;
}

export interface Example {
    title: string;
    description: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async generateSchema(description: string, complexity: string = 'standard'): Promise<GenerateResponse> {
        return this.request<GenerateResponse>('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ description, complexity }),
        });
    }

    async exportSchema(schema: Schema, format: string): Promise<ExportResponse> {
        return this.request<ExportResponse>('/api/export', {
            method: 'POST',
            body: JSON.stringify({ schema, format }),
        });
    }

    async getExamples(): Promise<{ examples: Example[] }> {
        return this.request('/api/examples');
    }
}

export const api = new ApiClient();
export default api;
