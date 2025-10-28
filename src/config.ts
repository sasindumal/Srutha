// Central place for runtime configuration
// NOTE: Do not commit real secrets in production. For local development only.

// Using react-native-dotenv via Babel to inject values from .env at build time
import { YOUTUBE_API_KEY as ENV_YOUTUBE_API_KEY } from '@env';

// Provide a safe fallback to empty string if undefined at runtime
export const YOUTUBE_API_KEY: string = ENV_YOUTUBE_API_KEY ?? '';
