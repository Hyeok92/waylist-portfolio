import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpaceReducer, initialSpacesState } from '../Reducers/SpaceReducer';

export const SpaceContext = createContext();

export const SpaceProvider = ({ children }) => {
  const [spaceState, dispatch] = useReducer(SpaceReducer, initialSpacesState);

  const loadSpaces = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('spaceData');
      if (jsonData) {
        const spaces = JSON.parse(jsonData);
        dispatch({ type: 'SET_SPACES', payload: spaces });
      }
    } catch (error) {
      console.error('Error loading palce data', error);
    }
  };

  const saveSpaces = async (spaces) => {
    try {
      await AsyncStorage.setItem('spaceData', JSON.stringify(spaces));
    } catch (error) {
      console.error('Error saving spaces:', error);
    }
  };

  const addSpace = async (newSpace) => {
    const updatedSpaces = [...spaceState.spaces, newSpace];
    await saveSpaces(updatedSpaces);
    dispatch({ type: 'ADD_SPACE', payload: newSpace });
    console.log('addSpace function : ', spaceState.spaces);
  };

  const updateSpace = async (updatedSpace) => {
    const updatedSpaces = spaceState.spaces.map((space) =>
      space.id === updatedSpace.id ? updatedSpace : space
    );
    await saveSpaces(updatedSpaces);
    dispatch({ type: 'UPDATE_SPACE', payload: updatedSpace });
  };

  const removeSpace = async (id) => {
    const updatedSpaces = spaceState.spaces.filter((item) => item.id !== id);
    await saveSpaces(updatedSpaces);
    dispatch({ type: 'REMOVE_SPACE', payload: id });
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  return (
    <SpaceContext.Provider value={{ spaceState, addSpace, updateSpace, removeSpace }}>
      {children}
    </SpaceContext.Provider>
  );
};
