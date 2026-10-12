declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_URI: string;
            NEXTAUTH_SECRET: string;
            NEXTAUTH_URL: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            NODE_ENV: 'development' | 'production' | 'test';
        }
    }
}

export {};
