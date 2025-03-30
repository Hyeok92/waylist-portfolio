import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemoReducer, initialMemosState } from '../Reducers/MemoReducer';

export const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memoState, dispatch] = useReducer(MemoReducer, initialMemosState);

  const loadMemos = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('memoData');
      if (jsonData) {
        const memos = JSON.parse(jsonData);
        dispatch({ type: 'SET_MEMOS', payload: memos });
      }
    } catch (error) {
      console.error('Error loading memo data', error);
    }
  };

  const saveMemos = async (memos) => {
    try {
      await AsyncStorage.setItem('memoData', JSON.stringify(memos));
    } catch (error) {
      console.error('Error saving memos:', error);
    }
  };

  const addMemo = async (newMemo) => {
    const updatedMemos = [...memoState.memos, newMemo];
    await saveMemos(updatedMemos);
    dispatch({ type: 'ADD_MEMO', payload: newMemo });
  };

  const updateMemo = async (updatedMemo) => {
    const updatedMemos = memoState.memos.map((memo) =>
        memo.id === updatedMemo.id ? updatedMemo : memo
    );
    await saveMemos(updatedMemos);
    dispatch({ type: 'UPDATE_MEMO', payload: updatedMemo });
  };

  const removeMemo = async (id) => {
    const updatedMemos = memoState.memos.filter((item) => item.id !== id);
    await saveMemos(updatedMemos);
    dispatch({ type: 'REMOVE_MEMO', payload: id });
  };

  useEffect(() => {
    loadMemos();
  }, []);

  return (
    <MemoContext.Provider value={{ memoState, addMemo, updateMemo, removeMemo }}>
      {children}
    </MemoContext.Provider>
  );
};
