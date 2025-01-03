import axios from 'axios';

export interface DailymotionToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
}

export class DailymotionAuth {
  private static readonly TOKEN_URL = 'https://api.dailymotion.com/oauth/token';
  private static readonly AUTH_URL = 'https://www.dailymotion.com/oauth/authorize';
  
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {}

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'read' // Add more scopes if needed
    });

    return `${DailymotionAuth.AUTH_URL}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<DailymotionToken> {
    try {
      const response = await axios.post(DailymotionAuth.TOKEN_URL, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code
      });

      return response.data;
    } catch (error) {
      console.error('Error getting Dailymotion token:', error);
      throw new Error('Failed to authenticate with Dailymotion');
    }
  }

  async refreshToken(refreshToken: string): Promise<DailymotionToken> {
    try {
      const response = await axios.post(DailymotionAuth.TOKEN_URL, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing Dailymotion token:', error);
      throw new Error('Failed to refresh Dailymotion token');
    }
  }
}
