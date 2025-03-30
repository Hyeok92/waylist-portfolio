/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from "react";
import { Alert, Platform, PermissionsAndroid, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './src/Navigator/MainStackNavigator/MainStackNavigator';

import { legacy_createStore as createStore } from 'redux';
import { Provider } from 'react-redux';
import reducers from './src/Reducers';
import { initNotifications } from "./src/Utils/initNotifications";
import PushNotification from 'react-native-push-notification';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import geofenceNotification from "./src/hooks/geofenceNotification";
import { SpaceProvider } from "./src/Provider/SpaceContext";
import useGeofenceAlerts from "./src/hooks/useGeofenceAlerts";
import SplashScreen from 'react-native-splash-screen';

const requestNotificationPermission = async () => {
  if (Platform.OS === "ios") {
    try {
      const granted = await PushNotification.requestPermissions();
      if (granted.alert || granted.sound || granted.badge) {
        console.log("알림 권한 허용됨 ✅");
      } else {
        Alert.alert("알림 권한 거부됨 ❌", "설정에서 알림을 활성화해주세요.");
      }
    } catch (error) {
      console.error("알림 권한 요청 실패", error);
    }
  } else if (Platform.OS === "android" && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("알림 권한 허용됨 ✅");
      } else {
        Alert.alert("알림 권한 거부됨 ❌", "설정에서 알림을 활성화해주세요.");
      }
    } catch (error) {
      console.error("알림 권한 요청 실패", error);
    }
  } else {
    console.log("Android 12 이하에서는 권한 요청이 필요하지 않습니다.");
  }
};

  // 📌 위치 권한 요청
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('📍 위치 권한 허용됨');

          
            const backgroundLocation = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            );
            if (backgroundLocation === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('📍 COARSE 위치 권한 허용됨');
            } else {
              console.log('⛔ 백그라운드 위치 권한 거부됨');
            }
          

          if (Platform.Version >= 29) { // ✅ Android 10 이상에서 백그라운드 권한 요청
            const backgroundLocation = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
            if (backgroundLocation === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('📍 백그라운드 위치 권한 허용됨');
            } else {
              console.log('⛔ 백그라운드 위치 권한 거부됨');
            }
          }
          return true;
        } else {
          Alert.alert('⛔ 위치 권한이 필요합니다!', '앱 설정에서 위치 권한을 허용해주세요.');
          console.log('⛔ 위치 권한 거부됨');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };


const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      await requestNotificationPermission();
      initNotifications(); // ✅ 푸시 알림 초기화
    };
    initializeApp();
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000); //스플래시 활성화 시간
  }, []);

  return (
    <SpaceProvider>
      <GeofenceHandler />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <MainStackNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SpaceProvider>
  )
}

// ✅ Provider 내부에서 실행되도록 별도 컴포넌트로 분리
const GeofenceHandler = () => {
  if (Platform.OS === "ios") {
    useGeofenceAlerts()
  } else {
    geofenceNotification();
  }
  return null;
};

export default App;