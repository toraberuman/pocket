declare global {
  interface Env {
    DB: D1Database;
    ADMIN_PASSWORD?: string;
    MAPS_API_KEY?: string;
    AERODATABOX_API_KEY?: string;
    AERODATABOX_API_HOST?: string;
    AERODATABOX_API_BASE_URL?: string;
    AERODATABOX_API_KEY_HEADER?: string;
    AERODATABOX_API_HOST_HEADER?: string;
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
