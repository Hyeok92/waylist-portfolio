import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, TextInput, TouchableOpacity, FlatList, ScrollView, Switch, Alert, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterIonicons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPickerView from './CalendarPickerView';
import TimePickerView from './TimePickerView';
import BottomSheetModal from './BottomSheetModal';
import ColorListView from './CololrListView';
import AlarmTimeListView from './AlarmTimeListView';
import { pastelColors } from '../../Utils/colors';
import { ScheduleContext } from '../../Provider/ScheduleContext';
import { scheduleNotification } from '../../Utils/notification';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddScheduleModal = ({
  navigation,
  route,
}) => {
  const { state, addSchedule, updateSchedule } = useContext(ScheduleContext);

  const { selectDate } = route.params;
  const selectedDate = new Date(selectDate);

  const isEditMode = route.params?.schedule ? true : false;
  const existingSchedule = route.params?.schedule || {};

  const setNewDate = (isStartDate) => {
    const setDate = new Date(selectedDate);
    isStartDate ? setDate.setHours(setDate.getHours() + 1) : setDate.setHours(setDate.getHours() + 2);
    setDate.setMinutes(0);
    setDate.setSeconds(0);

    return setDate;
  };

  const [title, setTitle] = useState('');
  const [allDayEnable, setAllDayEnable] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(setNewDate(true));
  const [selectedEndDate, setSelectedEndDate] = useState(setNewDate(false));
  const [color, setColor] = useState(0);
  const [dayAlarm, setDayAlarm] = useState([]);
  const [minAlarm, setMinAlarm] = useState([]);
  const [memo, setMemo] = useState('');

  const [selectingDate, setSelectingDate] = useState([false, false, false, false]);
  const [selectingColorVisible, setSelectingColorVisible] = useState(false);
  const [selectingAlarmVisible, setSelectingAlarmVisible] = useState(false);

  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const handleContentSizeChange = (width, height) => {
    if (height !== contentHeight) {
      setContentHeight(height);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  // const handleFocus = () => {
  //   setTimeout(() => {
  //     console.log('handle focus');
  //     inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
  //       console.log('handle measure', pageY);
  //       scrollViewRef.current?.scrollTo({ x: 0, y: pageY, animated: true });
  //     });
  //   }, 300); // 키보드 애니메이션 시간을 고려해서 delay 줌
  // };

  const saveInitialData = useRef(
    isEditMode ? {
      title: existingSchedule.title,
      allDayEnable: existingSchedule.allDayEnable,
      selectedStartDate: new Date(existingSchedule.selectedStartDate),
      selectedEndDate: new Date(existingSchedule.selectedEndDate),
      color: pastelColors.find((item) => item.hex === existingSchedule.color).id,
      dayAlarm: existingSchedule.allDayEnable ? existingSchedule.alarm : [],
      minAlarm: existingSchedule.allDayEnable ? [] : existingSchedule.alarm,
      memo: existingSchedule.memo,
    } : {
      title: '',
      allDayEnable: false,
      selectedStartDate: setNewDate(true),
      selectedEndDate: setNewDate(false),
      color: 0,
      dayAlarm: [],
      minAlarm: [],
      memo: '',
    });

  useEffect(() => {
    if (isEditMode) {
      setTitle(existingSchedule.title);
      setAllDayEnable(existingSchedule.allDayEnable);
      setSelectedStartDate(new Date(existingSchedule.selectedStartDate));
      setSelectedEndDate(new Date(existingSchedule.selectedEndDate));
      setColor(pastelColors.find((item) => item.hex === existingSchedule.color).id);
      existingSchedule.allDayEnable ? setDayAlarm(existingSchedule.alarm) : setMinAlarm(existingSchedule.alarm);
      setMemo(existingSchedule.memo);
    }
  }, [isEditMode]);

  const isDataChanged = () => {
    return (
      title !== saveInitialData.current.title ||
      allDayEnable !== saveInitialData.current.allDayEnable ||
      selectedStartDate.getTime() !== saveInitialData.current.selectedStartDate.getTime() ||
      selectedEndDate.getTime() !== saveInitialData.current.selectedEndDate.getTime() ||
      color !== saveInitialData.current.color ||
      JSON.stringify(dayAlarm) !== JSON.stringify(saveInitialData.current.dayAlarm) ||
      JSON.stringify(minAlarm) !== JSON.stringify(saveInitialData.current.minAlarm) ||
      memo !== saveInitialData.current.memo
    );
  };

  const allDayEnableToggleSwitch = () => setAllDayEnable(previousState => !previousState);

  const dateToString = (date) => {
    const week = ['일', '월', '화', '수', '목', '금', '토', '일'];
    let dayOfWeek = week[date.getDay()];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayOfWeek})`;
  };

  const formatToKoreanTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // 12시간제 사용
    }).format(date);
  };

  const changeSelectingView = (index) => {
    setSelectingDate((previousState) => {
      const newStates = [...previousState];
      if (newStates[index]) {
        newStates[index] = false;
      } else {
        newStates.fill(false);
        newStates[index] = true;
      }
      return newStates;
    });
  };

  const selectedStartDateChange = (dateString) => setSelectedStartDate(stringToDate(dateString));
  const selectedEndDateChange = (dateString) => setSelectedEndDate(stringToDate(dateString));
  const selectedStartTimeChange = (date) => setSelectedStartDate(date);
  const selectedEndTimeChange = (date) => setSelectedEndDate(date);

  const stringToDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(selectedStartDate.getHours());
    date.setMinutes(selectedStartDate.getMinutes());
    date.setSeconds(selectedStartDate.getSeconds());
    return date;
  };

  const showSelectingColor = () => setSelectingColorVisible(true);
  const hideSelectingColor = () => setSelectingColorVisible(false);

  const showSelectingAlarm = () => setSelectingAlarmVisible(true);
  const hideSelectingAlarm = () => setSelectingAlarmVisible(false);

  const onSelectColor = (color) => {
    setColor(color);
    hideSelectingColor();
  };

  const onSelectAlarm = (selectAlarm) => {
    if (allDayEnable) {
      setDayAlarm(selectAlarm);
    } else {
      setMinAlarm(selectAlarm);
    }
  };

  useEffect(() => {
    if (allDayEnable) {
      if (selectingDate[1] || selectingDate[3]) {
        setSelectingDate((previousState) => {
          const newStates = [...previousState];
          newStates.fill(false);
          return newStates;
        });
      }
    }
  }, [allDayEnable]);

  useEffect(() => {
    if (allDayEnable) {
      setAlarmText(selectedAlarmText(dayAlarm));
    } else {
      setAlarmText(selectedAlarmText(minAlarm));
    }
  }, [dayAlarm, minAlarm, allDayEnable]);

  const selectedAlarmText = (alarm) => {
    if (alarm.length === 0) { return '알림 없음'; }
    return alarm.map((item) => item.name).join(', ');
  };

  const [alarmText, setAlarmText] = useState('');

  const back = () => {
    if (isDataChanged()) {
      Alert.alert(
        '입력한 내용이 삭제됩니다.',
        '취소하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: () => navigation.pop() },
        ]
      );
    } else {
      navigation.pop();
      initialData();
    }
  };

  const initialData = () => {
    setTitle('');
    setAllDayEnable(false);
    setColor(0);
    setDayAlarm([]);
    setMinAlarm([]);
    setMemo('');
    setSelectingDate([false, false, false, false]);
    setSelectingColorVisible(false);
    setSelectingAlarmVisible(false);
  };

  const onChangeTitle = (inputTitle) => setTitle(inputTitle);
  const onChangeMemo = (inputMemo) => setMemo(inputMemo);

  const saveSchedul = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('⚠️ 경고', '제목을 입력해주세요.');
        return;
      }
      if (selectedStartDate > selectedEndDate) {
        Alert.alert('⛔ 오류', '시작 시간이 종료 시간보다 늦을 수 없습니다.');
        return;
      }

      const maxId = state.schedules.length > 0
        ? Math.max(...state.schedules.map(schedule => schedule.id)) + 1
        : 0;

      const newSchedul = {
        id: isEditMode ? existingSchedule.id : maxId,
        title: title,
        allDayEnable: allDayEnable,
        selectedStartDate: selectedStartDate.toISOString(),
        selectedEndDate: selectedEndDate.toISOString(),
        color: pastelColors[color].hex,
        alarm: allDayEnable ? dayAlarm : minAlarm,
        memo: memo,
        event: {
          title: title,
          start: selectedStartDate.toISOString(),
          end: selectedEndDate.toISOString(),
          color: pastelColors[color].hex,
        },
      };

      if (isEditMode) {
        updateSchedule(newSchedul);
      } else {
        addSchedule(newSchedul);
      }
      scheduleNotification(newSchedul);
      navigation.pop();
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => back()}>
          <Ionicons name="close" size={25} color={pastelColors[color].hex} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={() => saveSchedul()}>
          <Text style={styles.saveButtonText}>{'저장'}</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput style={styles.titleInput} onChangeText={onChangeTitle} value={title} placeholder="제목" />
      <View style={{ borderBottomWidth: 1, borderColor: '#DADADA' }} />

      <KeyboardAwareScrollView
        innerRef={(ref) => (scrollViewRef.current = ref)}
        scrollEnabled={true}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        extraScrollHeight={20} // 키보드와 입력창 간격 확보
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled" >
        <View style={styles.scrollViewInnerContainer}>
          <MaterIonicons name="hours-24" size={25} color={pastelColors[color].hex} />
          <Text style={styles.scrollViewIconPlusText}>종일</Text>
          <View style={styles.rightView}>
            <Switch
              trackColor={{ false: 'gray', true: pastelColors[color].hex }}
              thumbColor={'white'}
              onValueChange={allDayEnableToggleSwitch}
              value={allDayEnable} />
          </View>
        </View>
        <View style={styles.scrollViewInnerContainer}>
          <Text style={styles.scrollViewText}>시작</Text>
          <View style={styles.rightView}>
            <TouchableOpacity style={[styles.dateButton, selectingDate[0] === true && { backgroundColor: pastelColors[color].hex }]} onPress={() => changeSelectingView(0)}>
              <Text style={[styles.dateButtonText, selectingDate[0] === true && styles.dateTimeSelectButtonText]}>{dateToString(selectedStartDate)}</Text>
            </TouchableOpacity>
            {allDayEnable
              ? null
              : <TouchableOpacity style={[styles.timeButton, selectingDate[1] === true && { backgroundColor: pastelColors[color].hex }]} onPress={() => changeSelectingView(1)}>
                <Text style={[styles.dateButtonText, selectingDate[1] === true && styles.dateTimeSelectButtonText]}>{formatToKoreanTime(selectedStartDate)}</Text>
              </TouchableOpacity>}
          </View>
        </View>

        {/* Modal 영역 */}
        <CalendarPickerView
          visible={selectingDate[0]}
          onSelected={selectedStartDateChange}
          selectedDate={selectedStartDate} />

        <TimePickerView
          visible={selectingDate[1]}
          onTimeSelected={selectedStartTimeChange}
          selectedTime={selectedStartDate} />

        <View style={styles.scrollViewInnerContainer}>
          <Text style={styles.scrollViewText}>종료</Text>
          <View style={styles.rightView}>
            <TouchableOpacity style={[styles.dateButton, selectingDate[2] === true && { backgroundColor: pastelColors[color].hex }]} onPress={() => changeSelectingView(2)}>
              <Text style={[styles.dateButtonText, selectingDate[2] === true && styles.dateTimeSelectButtonText]}>{dateToString(selectedEndDate)}</Text>
            </TouchableOpacity>
            {allDayEnable
              ? null
              : <TouchableOpacity style={[styles.timeButton, selectingDate[3] === true && { backgroundColor: pastelColors[color].hex }]} onPress={() => changeSelectingView(3)}>
                <Text style={[styles.dateButtonText, selectingDate[3] === true && styles.dateTimeSelectButtonText]}>{formatToKoreanTime(selectedEndDate)}</Text>
              </TouchableOpacity>}
          </View>
        </View>

        {/* Modal 영역 */}
        <CalendarPickerView
          visible={selectingDate[2]}
          onSelected={selectedEndDateChange}
          selectedDate={selectedEndDate} />

        <TimePickerView
          visible={selectingDate[3]}
          onTimeSelected={selectedEndTimeChange}
          selectedTime={selectedEndDate} />

        <TouchableOpacity style={styles.scrollViewInnerContainer} onPress={showSelectingColor}>
          <Ionicons name="color-palette-outline" size={25} color={pastelColors[color].hex} />
          <Text style={styles.scrollViewIconPlusText}>{pastelColors[color].name}</Text>

          {/* BottomSheetModal 영역 */}
          <BottomSheetModal
            visible={selectingColorVisible}
            onClose={hideSelectingColor} >
            <ColorListView
              colorListOnClose={(color) => onSelectColor(color)}
              currentColor={color} />
          </BottomSheetModal>

        </TouchableOpacity>

        <TouchableOpacity style={styles.scrollViewInnerContainer} onPress={showSelectingAlarm}>
          <Ionicons name="alarm-outline" size={25} color={pastelColors[color].hex} />
          <Text style={styles.scrollViewIconPlusText}>{alarmText}</Text>

          {/* BottomSheetModal 영역 */}
          <BottomSheetModal
            visible={selectingAlarmVisible}
            onClose={hideSelectingAlarm} >
            <AlarmTimeListView
              selectedAlarm={(selectAlarm) => onSelectAlarm(selectAlarm)}
              currentColor={color}
              allDayEvent={allDayEnable}
              testSelectedAlarm={allDayEnable ? dayAlarm : minAlarm} />
          </BottomSheetModal>

        </TouchableOpacity>

        <View style={styles.scrollViewInnerContainer}>
          <Ionicons name="document-text-outline" size={25} color={pastelColors[color].hex} />
          <Text style={styles.scrollViewIconPlusText}>메모</Text>
        </View>
        <View style={styles.memoTextInputOutLineContainer}>
          <View style={styles.scrollViewInnerTextInputContainer}>
            <TextInput
              ref={inputRef} style={styles.memoInput} multiline={true} onChangeText={onChangeMemo} value={memo}
              onContentSizeChange={(event) => {
                handleContentSizeChange(event.nativeEvent.contentSize.width, event.nativeEvent.contentSize.height);
              }}
              onFocus={() => {
                inputRef.current?.measureLayout(scrollViewRef.current, (x, y, width, height) => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: y - 40, animated: true });
                  }, 150);
                });
              }} />
          </View>
        </View>
        <View style={{ height: 20 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  headerContainer: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    justifyContent: 'flex-start',
  },
  saveButton: {
    height: 30,
    width: 70,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  titleInput: {
    height: 60,
    paddingLeft: 50,
    fontSize: 20,
  },
  rightView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  scrollViewInnerContainer: {
    height: 60,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  scrollViewInnerTextInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    width: '100%',
    borderColor: '#DADADA',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  scrollViewIconPlusText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 10,
  },
  scrollViewText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: 35,
  },
  dateButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#DADADA',
    marginLeft: 10,
    padding: 7,
    paddingLeft: 10,
    paddingRight: 10,
  },
  timeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#DADADA',
    marginLeft: 10,
    padding: 7,
    paddingLeft: 10,
    paddingRight: 10,
  },
  dateButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 13,
  },
  memoInput: {
    width: '100%',
    textAlign: 'left',
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'top',
    padding: 5,
    paddingTop: 0,
  },
  dateTimeSelectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memoTextInputOutLineContainer: {
    paddingRight: 20,
    paddingLeft: 20,
    width: '100%',
  },
});

export default AddScheduleModal;