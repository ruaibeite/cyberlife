import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { StoreService } from '../services/store';
import styled from '@emotion/styled';

const ScheduleContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ScheduleList = styled.div`
  margin-top: 20px;
`;

const ScheduleItem = styled.div<{ isCompleted: boolean }>`
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 10px;
  background: ${props => props.isCompleted ? '#f3f4f6' : 'white'};
  opacity: ${props => props.isCompleted ? 0.7 : 1};
`;

const AddScheduleForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
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

interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  isCompleted: boolean;
}

export const Schedule: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'personal' as 'work' | 'personal' | 'learning'
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = () => {
    const loadedSchedules = StoreService.getSchedules();
    setSchedules(loadedSchedules);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = {
      title: newSchedule.title,
      description: newSchedule.description,
      startTime: new Date(newSchedule.startTime).getTime(),
      endTime: new Date(newSchedule.endTime).getTime(),
      isCompleted: false,
      category: newSchedule.category
    };

    StoreService.addSchedule(schedule);
    loadSchedules();
    setNewSchedule({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      category: 'personal'
    });
  };

  const toggleComplete = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      StoreService.updateSchedule(id, { isCompleted: !schedule.isCompleted });
      loadSchedules();
    }
  };

  const deleteSchedule = (id: string) => {
    StoreService.deleteSchedule(id);
    loadSchedules();
  };

  return (
    <ScheduleContainer>
      <h2>日程管理</h2>
      <AddScheduleForm onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="标题"
          value={newSchedule.title}
          onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
        />
        <Input
          type="text"
          placeholder="描述"
          value={newSchedule.description}
          onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
        />
        <Input
          type="datetime-local"
          value={newSchedule.startTime}
          onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
        />
        <Input
          type="datetime-local"
          value={newSchedule.endTime}
          onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
        />
        <select
          value={newSchedule.category}
          onChange={e => setNewSchedule({ ...newSchedule, category: e.target.value as 'work' | 'personal' | 'learning' })}
        >
          <option value="personal">个人</option>
          <option value="work">工作</option>
          <option value="learning">学习</option>
        </select>
        <Button type="submit">添加日程</Button>
      </AddScheduleForm>

      <ScheduleList>
        {schedules.map(schedule => (
          <ScheduleItem key={schedule.id} isCompleted={schedule.isCompleted}>
            <h3>{schedule.title}</h3>
            <p>{schedule.description}</p>
            <p>开始时间: {moment(schedule.startTime).format('YYYY-MM-DD HH:mm')}</p>
            <p>结束时间: {moment(schedule.endTime).format('YYYY-MM-DD HH:mm')}</p>
            <div>
              <Button onClick={() => toggleComplete(schedule.id)}>
                {schedule.isCompleted ? '取消完成' : '标记完成'}
              </Button>
              <Button onClick={() => deleteSchedule(schedule.id)} style={{ marginLeft: '10px', background: '#ef4444' }}>
                删除
              </Button>
            </div>
          </ScheduleItem>
        ))}
      </ScheduleList>
    </ScheduleContainer>
  );
}; 