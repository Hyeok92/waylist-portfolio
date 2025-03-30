import * as React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import CalendarScreen from '../../Components/Calendar/CalendarScreen';

const CalendarStack = createStackNavigator();

const CalendarStackScreen = () => {
  return (
    <CalendarStack.Navigator screenOptions={{ headerShown: false }} >
      <CalendarStack.Screen name="CalendarScreen" component={CalendarScreen} />
    </CalendarStack.Navigator>
  );
};

export default CalendarStackScreen;
