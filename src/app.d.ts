declare global {
  interface Env {
    DB: D1Database;
    MAPS_API_KEY?: string;
    GOOGLE_CLIENT_EMAIL?: string;
    GOOGLE_PRIVATE_KEY?: string;
    GOOGLE_DRIVE_FOLDER_ID?: string;
  }

  namespace App {
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
  }
}

export {};
