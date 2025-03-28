import Store from 'electron-store';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  isCompleted: boolean;
  category: 'work' | 'personal' | 'learning';
}

interface Settings {
  theme: 'light' | 'dark';
  shortcuts: {
    toggleWindow: string;
    addSchedule: string;
  };
}

interface StoreSchema {
  chatHistory: ChatMessage[];
  schedules: Schedule[];
  settings: Settings;
  authToken?: string;
}

// 创建类型化的 Store 实例
const store = new Store<StoreSchema>({
  defaults: {
    chatHistory: [],
    schedules: [],
    settings: {
      theme: 'light',
      shortcuts: {
        toggleWindow: 'Ctrl+Shift+A',
        addSchedule: 'Ctrl+Shift+S'
      }
    }
  }
}) as Store<StoreSchema> & {
  get<K extends keyof StoreSchema>(key: K): StoreSchema[K];
  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void;
};

export const StoreService = {
  // Auth related
  getAuthToken: () => store.get('authToken'),
  setAuthToken: (token: string) => store.set('authToken', token),

  // 聊天历史相关
  getChatHistory: () => store.get('chatHistory'),
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const messages = store.get('chatHistory');
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    store.set('chatHistory', [...messages, newMessage]);
    return newMessage;
  },
  clearChatHistory: () => store.set('chatHistory', []),

  // 日程相关
  getSchedules: () => store.get('schedules'),
  addSchedule: (schedule: Omit<Schedule, 'id'>) => {
    if (schedule.startTime >= schedule.endTime) {
      throw new Error('开始时间不能晚于或等于结束时间');
    }
    const schedules = store.get('schedules') || [];
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString()
    };
    store.set('schedules', [...schedules, newSchedule]);
    return newSchedule;
  },
  updateSchedule: (id: string, updates: Partial<Schedule>) => {
    const schedules = store.get('schedules');
    const updatedSchedules = schedules.map((schedule: Schedule) => 
      schedule.id === id ? { ...schedule, ...updates } : schedule
    );
    store.set('schedules', updatedSchedules);
  },
  deleteSchedule: (id: string) => {
    const schedules = store.get('schedules') || [];
    store.set('schedules', schedules.filter((schedule: Schedule) => schedule.id !== id));
  },

  // 设置相关
  getSettings: () => store.get('settings'),
  updateSettings: (updates: Partial<Settings>) => {
    const settings = store.get('settings');
    store.set('settings', { ...settings, ...updates });
  }
};