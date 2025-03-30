import * as React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import MemoScreen from '../../Components/Memo/MemoScreen';

const MemoStack = createStackNavigator();

const MemoStackScreen = () => {
    return (
        <MemoStack.Navigator screenOptions={{ headerShown: false }}>
            <MemoStack.Screen name="MemoScreen" component={MemoScreen} />
        </MemoStack.Navigator>
    );
};

export default MemoStackScreen;
