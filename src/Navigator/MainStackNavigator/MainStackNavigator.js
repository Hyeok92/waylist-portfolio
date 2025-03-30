import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { ScheduleProvider } from '../../Provider/ScheduleContext';
import { MemoProvider } from '../../Provider/MemoContext';

import MainTabNavigator from '../MainTabNavigator/MainTabNavigator';
import ScheduleListScreen from '../../Components/Calendar/ScheduleList';
import AddScheduleModal from '../../Components/Calendar/AddScheduleModal';
import DetailSchedule from '../../Components/Calendar/DetailSchedule';
import AddSpaceModal from '../../Components/Map/AddSpaceModal';
import AddMemoModal from '../../Components/Memo/AddMemoModal'
import DetailMemoModal from '../../Components/Memo/DetailMemoModal';
import LicenseScreen from '../../Components/Memo/LicenseScreen';

const MainStack = createStackNavigator();

const MainNavigator = ({ navigation, route }) => {
  return (
    <ScheduleProvider>
      <MemoProvider>
        <PaperProvider>
          <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="MainTabNavigator" component={MainTabNavigator} />
            <MainStack.Screen name="ScheduleListScreen" component={ScheduleListScreen} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="AddSchedule" component={AddScheduleModal} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="DetailSchedule" component={DetailSchedule} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="AddSpace" component={AddSpaceModal} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="AddMemo" component={AddMemoModal} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="DetailMemo" component={DetailMemoModal} options={{ presentation: 'modal' }} />
            <MainStack.Screen name="LicenseScreen" component={LicenseScreen} options={{ presentation: 'modal' }} />
          </MainStack.Navigator>
        </PaperProvider>
      </MemoProvider>
    </ScheduleProvider>
  );
};

export default MainNavigator;
