import { app, net } from 'electron';
import { API_CONFIG } from '../../shared/constants.js';
import { getAccessToken } from './credentials.js';

let cachedData = null;

export async function fetchUsage() {
  let token;
  try {
    token = getAccessToken();
  } catch (error) {
    if (error.message === 'Token expired') {
      cachedData = { error: 'Token expired, run the Claude CLI to refresh the token' };
      return cachedData;
    }
    cachedData = { error: 'Error getting token' };
    return cachedData;
  }

  if (!token) {
    cachedData = { error: 'No token found' };
    return cachedData;
  }

  try {
    const response = await net.fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USAGE_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'anthropic-beta': API_CONFIG.BETA_HEADER,
        'User-Agent': `claude-usage-widget/${app.getVersion()}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error('UsageApiService: Failed to fetch:', error.message);
    cachedData = { error: error.message };
    return cachedData;
  }
}

export function getCachedData() {
  return cachedData;
}
