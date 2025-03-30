import React, { useState, useRef, useEffect, useContext } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScheduleContext } from '../../Provider/ScheduleContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ScheduleList = ({
  navigation,
  route,
}) => {
  const { state } = useContext(ScheduleContext);
  const {selectedDate} = route.params;
  const parseSelectedDate = new Date(selectedDate);
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  const getDateWithoutTime = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate.getTime();
  };

  useEffect(() => {
    setSelectedSchedules(state.schedules.filter((item) => {
      const startDate = getDateWithoutTime(item.selectedStartDate);
      const endDate = getDateWithoutTime(item.selectedEndDate);
      const selectedDate = getDateWithoutTime(parseSelectedDate);
      return selectedDate >= startDate && selectedDate <= endDate;
    }));
  }, [state]);

  const timeToString = (date) => {
    const timeDate = new Date(date);
    return `${String(timeDate.getHours()).padStart(2, '0')}:${String(timeDate.getMinutes()).padStart(2, '0')}`;
  };

  const dateToString = (date) => {
    const week = ['일', '월', '화', '수', '목', '금', '토', '일'];
    let dayOfWeek = week[date.getDay()];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${dayOfWeek}요일`;
  };

  const moveToAddSchedule = () => {
    navigation.navigate('AddSchedule', {selectDate: selectedDate});
  };

  const moveToDetailSchedule = (id) => {
    navigation.navigate('DetailSchedule', {id: id, selectedDate: selectedDate});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconContainer}>
        <View style={styles.topIcon} />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{dateToString(parseSelectedDate)}</Text>
        <TouchableOpacity style={styles.headerSideButton} onPress={() => moveToAddSchedule()}>
          <Ionicons name="add-circle-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        keyExtractor={item => item.id}
        data={selectedSchedules}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity style={styles.scheduleListContainer} onPress={() => moveToDetailSchedule(item.id)}>
              <View style={styles.scheduleTimeContainer}>
                <Text style={styles.scheduleTimeText}>{timeToString(item.selectedStartDate)}</Text>
                <Text style={styles.scheduleTimeText}>{timeToString(item.selectedEndDate)}</Text>
              </View>
              <View style={[styles.scheduleColorView, { backgroundColor: item.color }]} />
              <View style={styles.scheduleTitleContainer}>
                <Text style={styles.scheduleTitleText} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                {item.alarm.length === 0 ? null :
                <View style={styles.scheduleAlarmIcon}>
                  <Ionicons name="alarm-outline" size={15} color="gray" />
                </View>}
              </View>
              <View style={styles.shceduleRightButtonContainer}  />
            </TouchableOpacity>
            <View style={styles.blankView} />
          </View>
        )} />
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
    paddingLeft:10,
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
  scheduleListContainer: {
    height: 30,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scheduleTimeContainer: {
    height: 20,
    width: 30,
    justifyContent: 'center',
    margin: 5,
  },
  scheduleTimeText: {
    fontSize: 10,
  },
  scheduleColorView: {
    width: 3,
    height: 28,
    borderRadius: 15,
  },
  scheduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 10,
  },
  scheduleTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  scheduleAlarmIcon: {
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  shceduleRightButtonContainer: {
    width: 30,
  },
  blankView: {
    height: 10,
  },
});

export default ScheduleList;
