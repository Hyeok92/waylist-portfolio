import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { pastelColors } from '../../Utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AlarmTimeListView = ({
  currentColor,
  selectedAlarm,
  allDayEvent,
  testSelectedAlarm,
}) => {
  const dayAlarm = [
    { id: 0, name: '당일', value: 0},
    { id: 1, name: '1일 전', value: 1},
    { id: 2, name: '2일 전', value: 2},
  ];
  const minAlarm = [
    { id: 0, name: '시작 시간', value : 0},
    { id: 1, name: '10분 전', value: 10},
    { id: 2, name: '1시간 전', value: 60},
  ];

  const [currentAllDayEventDate, setCurrentAllDayEventDate] = useState(allDayEvent ? dayAlarm : minAlarm);
  const [selectAlarm, setSelectAlarm] = useState(testSelectedAlarm.map(item => item.id));

  useEffect(() => {
    if(allDayEvent)
      {setCurrentAllDayEventDate(dayAlarm);}
    else
      {setCurrentAllDayEventDate(minAlarm);}
  }, [allDayEvent]);

  useEffect(() => {
    console.log('test alarm data', testSelectedAlarm);
  });

  useEffect(() => {
    console.log('check log', testSelectedAlarm);
    console.log('check log2', selectAlarm);
    console.log('check log2', currentAllDayEventDate.filter((item) => selectAlarm.includes(item.id)));
    selectedAlarm(currentAllDayEventDate.filter((item) => selectAlarm.includes(item.id)));
  }, [selectAlarm]);

  const toggleSelect = (id) => {
    console.log(selectAlarm);
    if(selectAlarm.includes(id)) {
      setSelectAlarm(selectAlarm.filter((itemId) => itemId !== id));
    } else {
      setSelectAlarm([...selectAlarm, id].sort((a, b) => a - b));
    }
  };

  const selectedAlarmText = () => {
    if(allDayEvent) {
      const selectedNames = selectAlarm.map((id) => dayAlarm.find((item) => item.id === id)?.name).filter((name) => name);
      if (selectedNames.length === 0) {return '알림이 설정되어 있지 않습니다.';}
      return `${selectedNames.join(', ')}에 알림이 도착합니다.`;
    } else {
      const selectedNames = selectAlarm.map((id) => minAlarm.find((item) => item.id === id)?.name).filter((name) => name);
      if (selectedNames.length === 0) {return '알림이 설정되어 있지 않습니다.';}
      return `${selectedNames.join(', ')}에 알림이 도착합니다.`;
    }
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.titleContainer}>
        <Text style={{color: 'gray'}}>{selectedAlarmText()}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={{color: 'gray'}}>일정알림</Text>
      </View>
      {allDayEvent
      ?
      currentAllDayEventDate.map((alarm) => (
        <TouchableOpacity key={alarm.id} style={[styles.colorListContainer, selectAlarm.includes(alarm.id) && {backgroundColor: pastelColors[currentColor].lowSaturation}]} onPress={() => toggleSelect(alarm.id)}>
          <Text style={styles.colorListText}>{alarm.name}</Text>
          <View style={styles.radioButtonContainer}>
            {selectAlarm.includes(alarm.id) ?
            <Ionicons name="checkbox" size={20} color={pastelColors[currentColor].hex}/> :
            <Ionicons name="square-outline" size={20} color={pastelColors[currentColor].hex}/> }
          </View>
        </TouchableOpacity>
      ))
      :
      currentAllDayEventDate.map((alarm) => (
        <TouchableOpacity key={alarm.id} style={[styles.colorListContainer, selectAlarm.includes(alarm.id) && {backgroundColor: pastelColors[currentColor].lowSaturation}]} onPress={() => toggleSelect(alarm.id)}>
          <Text style={styles.colorListText}>{alarm.name}</Text>
          <View style={styles.radioButtonContainer}>
            {selectAlarm.includes(alarm.id) ?
            <Ionicons name="checkbox" size={20} color={pastelColors[currentColor].hex}/> :
            <Ionicons name="square-outline" size={20} color={pastelColors[currentColor].hex}/> }
          </View>
        </TouchableOpacity>
      ))
      }

      <View style={{height: 50}} />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorListContainer: {
    width: '100%',
    height: 50,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  showColorView: {
    borderRadius: 10,
    width: 10,
    height: 30,
    marginLeft: 10,
  },
  selectedBackground: {
    backgroundColor: '#E6E6FA88', // 선택된 항목 배경색
  },
  selectedCheckboxView: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'balck',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInRadioView: {
    color: 'white',
    fontSize: '5',
  },
  unSelectedRadioView: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorListText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingLeft: 10,
    color: 'gray',
  },
  radioButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default AlarmTimeListView;
