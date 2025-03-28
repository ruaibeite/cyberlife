import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { StoreService } from '../services/store';
import styled from '@emotion/styled';
import moment from 'moment';

const ChatContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 600px;
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
`;

const MessageItem = styled.div<{ isAI: boolean }>`
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.isAI ? '#f3f4f6' : '#4f46e5'};
  color: ${props => props.isAI ? '#1f2937' : 'white'};
  align-self: ${props => props.isAI ? 'flex-start' : 'flex-end'};
  max-width: 70%;
`;

const InputForm = styled.form`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: number;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const history = StoreService.getMessages();
      setMessages(history);
    };
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        isAI: false,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      StoreService.addMessage(userMessage);

      // 调用AI接口
      const response = await ApiService.chat(input);
      
      // 添加AI回复
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.data,
        isAI: true,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      StoreService.addMessage(aiMessage);
      
      setInput('');
    } catch (error) {
      console.error('聊天失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <MessageList>
        {messages.map(message => (
          <MessageItem key={message.id} isAI={message.isAI}>
            <div>{message.content}</div>
            <div style={{ fontSize: '0.8em', marginTop: '8px', color: message.isAI ? '#6b7280' : '#e5e7eb' }}>
              {moment(message.timestamp).format('HH:mm:ss')}
            </div>
          </MessageItem>
        ))}
      </MessageList>
      
      <InputForm onSubmit={handleSubmit}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </Button>
      </InputForm>
    </ChatContainer>
  );
};