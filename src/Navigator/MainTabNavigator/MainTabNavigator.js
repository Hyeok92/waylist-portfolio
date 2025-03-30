import React, { useState, useContext, useEffect } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CalendarStack from './CalendarNavigator';
import MeomoStack from './MemoNavigator';
import MapStack from './MapNavigator';

import { ScheduleContext } from '../../Provider/ScheduleContext';

const MainTab = createBottomTabNavigator();

const MainTabNavigator = ({ navigation, route }) => {
  const { state } = useContext(ScheduleContext);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [calendarBadge, setCalendarBadge] = useState(0);

  const getDateWithoutTime = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate.getTime();
  };

  useEffect(() => {
    setTodaySchedules(state.schedules.filter((item) => {
      const startDate = getDateWithoutTime(item.selectedStartDate);
      const endDate = getDateWithoutTime(item.selectedEndDate);
      const selectedDate = getDateWithoutTime(new Date());
      return selectedDate >= startDate && selectedDate <= endDate;
    }));
  }, [state]);

  useEffect(() => {
    setCalendarBadge(todaySchedules.length);
  }, [todaySchedules]);

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Calendar') {
            iconName = focused
              ? 'calendar'
              : 'calendar-outline';
          } else if (route.name === 'Memo') {
            iconName = focused
              ? 'reader'
              : 'reader-outline';
          } else if (route.name === 'Map') {
            iconName = focused
              ? 'map'
              : 'map-outline';
          } else if (route.name === 'Search') {
            iconName = focused
              ? 'search'
              : 'search-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#3E8EDE',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
      })}
    >
      <MainTab.Screen name="Calendar" component={CalendarStack} options={{ tabBarBadge: calendarBadge > 0 ? calendarBadge : undefined }} />
      <MainTab.Screen name="Map" component={MapStack} />
      <MainTab.Screen name="Memo" component={MeomoStack} />
    </MainTab.Navigator>
  );
};

export default MainTabNavigator;
