// lib/db/utils.ts
import dbConnect from '../dbConnect';

export async function withDB<T>(operation: () => Promise<T>): Promise<T> {
    await dbConnect();
    return operation();
}

export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

export function sanitizeQuery(query: any) {
    // Remove any keys that start with $ to prevent NoSQL injection
    const sanitized = { ...query };
    Object.keys(sanitized).forEach(key => {
        if (key.startsWith('$')) {
            delete sanitized[key];
        }
    });
    return sanitized;
}
