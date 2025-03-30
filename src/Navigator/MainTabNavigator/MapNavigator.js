import * as React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import MapScreen from '../../Components/Map/MapScreen';

const MapStack = createStackNavigator();

const MapStackScreen = () => {
    return (
        <MapStack.Navigator screenOptions={{ headerShown: false }}>
            <MapStack.Screen name="MapScreen" component={MapScreen} />
        </MapStack.Navigator>
    );
};

export default MapStackScreen;
