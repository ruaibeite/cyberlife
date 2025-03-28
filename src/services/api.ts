import { StoreService } from './store';

export const ApiService = {
  async chat(prompt: string) {
    try {
      const response = await fetch('https://cyberlife.love/index.php/api/Ali/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${StoreService.getAuthToken()}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  }
};