import React, { useState, useEffect } from 'react';
import { StoreService } from '../services/store';
import styled from '@emotion/styled';

const SettingsContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SettingSection = styled.div`
  margin-bottom: 20px;
`;

const SettingTitle = styled.h3`
  margin-bottom: 10px;
  color: #1f2937;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const Label = styled.label`
  margin-right: 10px;
  min-width: 120px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-width: 200px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-width: 200px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #4338ca;
  }
`;

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    shortcuts: {
      toggleWindow: '',
      addSchedule: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const loadedSettings = StoreService.getSettings();
    setSettings(loadedSettings);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'light' | 'dark';
    StoreService.updateSettings({ theme: newTheme });
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  const handleShortcutChange = (key: 'toggleWindow' | 'addSchedule', value: string) => {
    StoreService.updateSettings({
      shortcuts: { ...settings.shortcuts, [key]: value }
    });
    setSettings(prev => ({
      ...prev,
      shortcuts: { ...prev.shortcuts, [key]: value }
    }));
  };

  return (
    <SettingsContainer>
      <h2>设置</h2>
      
      <SettingSection>
        <SettingTitle>主题设置</SettingTitle>
        <SettingItem>
          <Label>主题模式</Label>
          <Select value={settings.theme} onChange={handleThemeChange}>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </Select>
        </SettingItem>
      </SettingSection>

      <SettingSection>
        <SettingTitle>快捷键设置</SettingTitle>
        <SettingItem>
          <Label>切换窗口</Label>
          <Input
            value={settings.shortcuts.toggleWindow}
            onChange={e => handleShortcutChange('toggleWindow', e.target.value)}
            placeholder="例如: Ctrl+Shift+A"
          />
        </SettingItem>
        <SettingItem>
          <Label>添加日程</Label>
          <Input
            value={settings.shortcuts.addSchedule}
            onChange={e => handleShortcutChange('addSchedule', e.target.value)}
            placeholder="例如: Ctrl+Shift+S"
          />
        </SettingItem>
      </SettingSection>
    </SettingsContainer>
  );
}; 