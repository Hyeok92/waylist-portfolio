import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleReducer, initialSchedulesState } from '../Reducers/ScheduleReducer';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ScheduleReducer, initialSchedulesState);

  const loadSchedules = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('scheduleData');
      if (jsonData) {
        const schedules = JSON.parse(jsonData);
        dispatch({ type: 'SET_SCHEDULES', payload: schedules });
      }
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  const saveSchedules = async (schedules) => {
    try {
      await AsyncStorage.setItem('scheduleData', JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  };

  const addSchedule = async (newSchedule) => {
    const updatedSchedules = [...state.schedules, newSchedule];
    await saveSchedules(updatedSchedules);
    dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
  };

  const updateSchedule = async (updatedSchedule) => {
    const updatedSchedules = state.schedules.map((schedule) =>
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    );
    await saveSchedules(updatedSchedules);
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
  };

  const removeSchedule = async (id) => {
    const updatedSchedules = state.schedules.filter((item) => item.id !== id);
    await saveSchedules(updatedSchedules);
    dispatch({ type: 'REMOVE_SCHEDULE', payload: id });
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  return (
    <ScheduleContext.Provider value={{ state, addSchedule, updateSchedule, removeSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};
