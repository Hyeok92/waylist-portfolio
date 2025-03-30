import PushNotification from 'react-native-push-notification';

export const initNotifications = () => {
  PushNotification.createChannel(
    {
      channelId: 'schedule-channel',
      channelName: 'Schedule Notifications',
      name: '일정 알림',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`알림 채널 생성됨: ${created}`)
  );

  // ✅ 새롭게 Space Notifications 채널 추가
  PushNotification.createChannel(
    {
      channelId: 'space-channel',
      channelName: 'Space Notifications',
      name: '위치 알림',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`위치 알림 채널 생성됨: ${created}`)
  );
  
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('🔔 푸시 알림 수신:', notification);
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios', // ✅ iOS에서만 권한 요청
  });
};
