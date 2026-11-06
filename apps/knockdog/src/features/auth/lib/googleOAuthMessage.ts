const GOOGLE_OAUTH_CALLBACK_PATH = '/auth/google/callback';
const GOOGLE_OAUTH_MESSAGE_TYPE = 'knockdog:google-oauth' as const;

interface GoogleOAuthSuccessMessage {
  type: typeof GOOGLE_OAUTH_MESSAGE_TYPE;
  status: 'success';
  idToken: string;
  state: string;
}

interface GoogleOAuthErrorMessage {
  type: typeof GOOGLE_OAUTH_MESSAGE_TYPE;
  status: 'error';
  error: string;
  state?: string;
}

type GoogleOAuthMessage = GoogleOAuthSuccessMessage | GoogleOAuthErrorMessage;

export { GOOGLE_OAUTH_CALLBACK_PATH, GOOGLE_OAUTH_MESSAGE_TYPE };
export type { GoogleOAuthMessage, GoogleOAuthSuccessMessage, GoogleOAuthErrorMessage };
