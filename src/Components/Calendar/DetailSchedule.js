import React, { useState, useRef, useEffect, useContext } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScheduleContext } from '../../Provider/ScheduleContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pastelColors } from '../../Utils/colors';
import { Menu, Divider, IconButton } from 'react-native-paper';
import PushNotification from 'react-native-push-notification';

const DetailSchedule = ({
  navigation,
  route,
}) => {
  const { state, removeSchedule } = useContext(ScheduleContext);
  const { id, selectedDate } = route.params;
  const [popupMenuVisible, setPopupMenuVisible] = useState(false);

  const openPopupMenu = () => setPopupMenuVisible(true);
  const closePopupMenu = () => setPopupMenuVisible(false);

  const findScheduleById = (id) => {
    return state.schedules.find(item => item.id === id);
  };
  const schedule = findScheduleById(id);

  const timeToString = (date) => {
    const timeDate = new Date(date);
    return `${String(timeDate.getHours()).padStart(2, '0')}:${String(timeDate.getMinutes()).padStart(2, '0')}`;
  };

  const dateToString = (date) => {
    const week = ['일', '월', '화', '수', '목', '금', '토', '일'];
    let dayOfWeek = week[date.getDay()];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${dayOfWeek}요일`;
  };

  const timeToAmPm = (date) => {
    return date.getHours() >= 12 ? '오후  ' : '오전  ';
  };

  const selectedAlarmText = (alarm) => {
    if (alarm.length === 0) {return '알림 없음';}
    return alarm.map((item) => item.name).join(', ');
  };

  const selectedColorText = (color) => {
    const findColor = pastelColors.find((item) => item.hex === color);
    return findColor ? findColor.name : '색상 없음';
  };

  const back = () => {
    navigation.pop();
  };

  const deleteSchedule = () => {
    setPopupMenuVisible(false);
    Alert.alert(
      '선택한 항목이 삭제됩니다.',
      '삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
            removeSchedule(id);
            PushNotification.cancelLocalNotification(`${schedule.id}`);
            navigation.pop();
         }},
      ]
    );
  };

  const moveToEditSchedule = () => {
    setPopupMenuVisible(false);
    navigation.navigate('AddSchedule', {selectDate: selectedDate, schedule: schedule});
  };

  if (!schedule) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconContainer}>
        <View style={styles.topIcon} />
      </View>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerSideButton} onPress={() => back()} >
          <Ionicons name="arrow-back" size={25} color={schedule.color} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: schedule.color }]}>{schedule.title}</Text>
        <View style={styles.headerSideButton} >
          <Menu
            visible={popupMenuVisible}
            onDismiss={closePopupMenu}
            anchor={<IconButton icon="dots-vertical" size={24} onPress={openPopupMenu} iconColor={schedule.color} />}
            contentStyle={styles.popupMenu} >
            <Menu.Item onPress={() => moveToEditSchedule()} title="편집" leadingIcon="pencil" />
            {/* <Divider />
            <Menu.Item onPress={() => console.log("공유")} title="공유" leadingIcon="share" /> */}
            <Divider />
            <Menu.Item onPress={() => deleteSchedule()} title="삭제" leadingIcon="delete" titleStyle={{ color: 'red' }} />
          </Menu>
        </View>
      </View>
      <View style={styles.scheduleDateContainer}>
        <View style={styles.scehduleDateTextContainer}>
          <Text style={styles.scheduleDateText}>{dateToString(new Date(schedule.selectedStartDate))}{'\n'}
            {timeToAmPm(new Date(schedule.selectedStartDate))}
            <Text style={styles.scheduleTimeText}>{timeToString(new Date(schedule.selectedStartDate))}</Text>
          </Text>
        </View>
        <View style={styles.angleIconContainer}>
          <Ionicons name="chevron-forward-outline" size={25} color={schedule.color} />
        </View>
        <View style={styles.scehduleDateTextContainer}>
          <Text fontWeight={'center'} style={styles.scheduleDateText}>{dateToString(new Date(schedule.selectedEndDate))}{'\n'}
            {timeToAmPm(new Date(schedule.selectedEndDate))}
            <Text style={styles.scheduleTimeText}>{timeToString(new Date(schedule.selectedEndDate))}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.lineView} />

      <ScrollView>
        <View style={styles.memoLineContainer}>
          <View style={{height: 40, justifyContent: 'center', alignItems: 'center'}}>
            <Ionicons name="document-text-outline" size={25} color={schedule.color} />
          </View>
          <View style={{flexDirection: 'row', width: '85%', paddingTop: 10}}>
            <Text style={styles.memoText}>{schedule.memo}</Text>
          </View>
        </View>

        <View style={styles.lineView} />


        <View style={styles.iconLineContainer}>
          <Ionicons name="alarm-outline" size={25} color={schedule.color} />
          <Text style={styles.iconLineText}>{selectedAlarmText(schedule.alarm)}</Text>
        </View>

        <View style={styles.lineView} />

        <View style={styles.iconLineContainer}>
          <Ionicons name="color-palette-outline" size={25} color={schedule.color} />
          <Text style={styles.iconLineText}>{selectedColorText(schedule.color)}</Text>
        </View>

        <View style={styles.lineView} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topIconContainer: {
    height: 15,
    alignItems: 'center',
  },
  topIcon: {
    height: 3,
    width: 50,
    borderRadius: 10,
    backgroundColor: '#DADADA',
    marginTop: 8,
  },
  headerContainer: {
    height: 50,
    width: '100%',
    paddingLeft: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerSideButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scheduleDateContainer: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
  },
  scehduleDateTextContainer: {
    height: 50,
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleDateText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleTimeText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  angleIconContainer: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineView: {
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  iconLineContainer: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  iconLineText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 10,
  },
  memoTextOutLineContainer: {
    paddingRight: 20,
    paddingLeft: 20,
    width: '100%',
  },
  popupMenu: {
    backgroundColor: 'white',
    borderRadius: 12, // iOS처럼 둥글게
    shadowColor: '#000', // iOS 스타일의 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Android 그림자
    paddingVertical: 0, // 아이템 간격 조정
  },
  memoLineContainer: {
    minHeight: 60,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
  },
  memoText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 15,
    lineHeight: 18,
    textAlignVertical: 'top',
    padding: 5,
    paddingTop: 0,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
});

export default DetailSchedule;
