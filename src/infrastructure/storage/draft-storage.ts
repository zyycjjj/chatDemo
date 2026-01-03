export class DraftStorage {
  private static readonly STORAGE_KEY = 'chat-draft';

  static save(draft: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, draft);
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  }

  static load(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || '';
    } catch (error) {
      console.warn('Failed to load draft from localStorage:', error);
      return '';
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error);
    }
  }
}