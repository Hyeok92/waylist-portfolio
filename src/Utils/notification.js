import PushNotification from 'react-native-push-notification';

export const scheduleNotification = (schedule) => {
  cancelNotification(`${schedule.id}`);
  
  if (!schedule.alarm || schedule.alarm.length === 0) {return;}


  schedule.alarm.forEach((alarm) => {
    let notificationDate = new Date(schedule.selectedStartDate);

    if (schedule.allDayEnable) {
      notificationDate.setDate(notificationDate.getDate() - alarm.value);
      notificationDate.setHours(9, 0, 0, 0); // 오전 9시 고정
    } else {
      notificationDate.setMinutes(notificationDate.getMinutes() - alarm.value);
    }

    if (notificationDate > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `${schedule.id}`,
        channelId: 'schedule-channel',
        title: schedule.title,
        message: formatMemo(schedule.memo),
        date: notificationDate,
        allowWhileIdle: true, // ✅ 기기가 절전 모드일 때도 알람이 동작하도록 설정
        ignoreInForeground: false, // ✅ Foreground에서도 알림이 울리도록 설정
        playSound: true,
        soundName: 'default', // ✅ 알림 소리 활성화
        vibrate: true,
        visibility: 'public', // ✅ 잠금 화면에서도 알림이 보이도록 설정
        priority: 'high', // ✅ 알림 중요도를 높게 설정
      });

    }
  });
};

const formatMemo = (memo) => {
  if (!memo) {return '일정 메모 없음';} // 메모가 없을 경우 기본 메시지
  const maxLength = 30;
  return `일정 메모: ${memo.length > maxLength ? memo.substring(0, maxLength) + '...' : memo}`;
};

const cancelNotification = (id) => {
  PushNotification.cancelLocalNotification(`${id}`);
};
