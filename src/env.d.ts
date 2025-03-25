declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    TEST_DATABASE_URL: string;
    COOKIE_SECRET: string;
    JWT_SECRET: string;
    PIGEON_SERVER: string;
    NODE_ENV: "prod" | "dev" | "test";
    PIGEON_DATABASE_URL: string;
    SESSION_SECRET: string;
  }
}
