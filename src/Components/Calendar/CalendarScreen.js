import React, {useCallback, useState, useEffect, useContext, useMemo} from 'react';
import {SafeAreaView, StyleSheet, View, Dimensions, TouchableOpacity, Text, BackHandler, Modal} from 'react-native';
import {Calendar} from 'react-native-big-calendar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YearMonthPickerModal from './YearMonthPickerModal';
import AddScheduleModal from './AddScheduleModal';
import { ScheduleContext } from '../../Provider/ScheduleContext';

const { height, width } = Dimensions.get('window'); // 기기의 화면 크기 가져오기

const CalendarScreen = ({navigation}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 날짜 정보를 가져와 초기 상태로 설정
  const [selectedDate, setSelectedDate] = useState(currentMonth); // 선택된 날짜

  const [isPickerVisible, setPickerVisible] = useState(false);

  const { state } = useContext(ScheduleContext);

  const sortedEvents = useMemo(() => {
    return [...state.events].sort((a, b) =>
      (b.end - b.start) - (a.end - a.start) || a.start - b.start
    );
  }, [state.events]);

  // 년도 및 월 데이터 생성
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1970 ~ 2019
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1 ~ 12
  // years.map((year) => `${year}년`)
  // const data = years.map((year) => ({
  //   value: year,
  //   label: `${year}년`,
  // }));

  // 이벤트 등록
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [isPickerVisible, handleBackButton]);

  // 이벤트 동작
  const handleBackButton = () => {
    if(isPickerVisible) {
      closePicker(null, null);
      return true;
    }
    return false;
  };
  const handleDateChange = (date) => {
    setCurrentMonth(date);
    setSelectedDate(date);
  };
  // 날짜 터치 핸들러
  const handleDatePress = (date) => {
    if(date.getFullYear() == selectedDate.getFullYear() && date.getMonth() + 1 == selectedDate.getMonth() + 1 && date.getDate() == selectedDate.getDate())
      {navigation.navigate('ScheduleListScreen', { selectedDate: date.toISOString()});}
    else
      {setSelectedDate(date);}
  };

  const moveToAddScedule = () => {
    navigation.navigate('AddSchedule', {selectDate: selectedDate.toISOString()});
  };

  const closePicker = (year, month) => {
    setPickerVisible(false);
    if(year != null || month != null) {
      const newDate = new Date(year, month - 1, 1); // 선택된 연/월의 첫 번째 날
      setCurrentMonth(newDate); // Big Calendar의 현재 날짜 업데이트
      setSelectedDate(newDate);
    }
  };

  const moveToday = () => {
    if(!isPickerVisible) {
      setCurrentMonth(new Date());
      setSelectedDate(new Date());
    }
  };

  // 현재 날짜인지 확인하는 함수
  const isToday = (date) => {
    const todayDate = new Date();
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  // 날짜 셀 스타일 동적 설정
  const getDateCellStyle = (date) => {
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isNotCurrentMonth = date.getMonth() !== currentMonth.getMonth();
    const isTodayDate = isToday(date);

    return {
      ...styles.calendarCellStyle,
      backgroundColor: isSelected ? '#e0e0e0' : '#fff',
      opacity: isNotCurrentMonth ? 0.2 : 1, // 현재 월이 아닌 경우 반투명 적용
      borderColor: isTodayDate ? '#3E8EDE' : '#DADADA',
      borderBottomWidth: isTodayDate ? 1 : 0,
      borderTopWidth: isTodayDate ? 1 : 0.2,
      borderRightWidth: isTodayDate ? 1 : 0,
      borderLeftWidth: isTodayDate ? 1 : 0,
      borderRadius: isTodayDate || isSelected ? 10 : 0,
    };
  };
  // 날짜 텍스트 스타일 동적 설정
  const getDateTextStyle = (date) => {
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isSaturday = date.getDay() === 6;
    const isSunday = date.getDay() === 0;
    const isNotCurrentMonth = date.getMonth() !== currentMonth.getMonth();

    return {
      color: isSaturday ? '#1E90FF' : isSunday ? '#ff0000' : isNotCurrentMonth ? '#aaa' : '#000', // 주말 텍스트 색상
      fontWeight: isSelected ? 'bold' : 'normal', // 선택된 날짜 텍스트 굵게
    };
  };

  // 커스텀 헤더 컴포넌트
  const CustomHeader = () => {
    const currentDateText = `${new Date(currentMonth).getFullYear()}년 ${new Date(currentMonth).getMonth() + 1}월`;

    return (
      <View>
        <View style={styles.headerContainer}>
          <View style={{flex: 1}}>
            <TouchableOpacity style={styles.headerSideButton} onPress={() => moveToday()}>
              <Ionicons name="today-outline" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{flex: 2}}>
            <TouchableOpacity style={styles.headerButton} onPress={isPickerVisible ? () => closePicker(null, null) : () => setPickerVisible(true)}>
              <Text style={styles.headerText}>{isPickerVisible ? `${currentDateText} ▲` : `${currentDateText} ▼`}</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent:'flex-end'}}>
            {/* <TouchableOpacity style={styles.headerSideButton}>
              <Ionicons name="search-outline" size={25} color="black" />
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.headerSideButton} onPress={isAddScheduleModalVisible?() => setAddScheduleModalVisible(false) :() => setAddScheduleModalVisible(true) }> */}
            <TouchableOpacity style={styles.headerSideButton} onPress={ () => moveToAddScedule() }>
              <Ionicons name="documents-outline" size={25} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.dayOfTheWeekContainer}>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>일</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>월</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>화</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>수</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>목</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>금</Text>
          </View>
          <View style={styles.dayOfTheWeekView}>
            <Text style={styles.dayOfTheWeekText}>토</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>

      {/* <Modal animationType='slide' visible={true} presentationStyle='pageSheet' /> */}
        <Calendar
          events={sortedEvents}
          mode="month" // 월간 보기 설정
          eventCellStyle={(event) => ({ backgroundColor: event.color })} // 일정 배경색 설정
          date={currentMonth} // 캘린더의 날짜 설정
          renderHeaderForMonthView={(props) => <CustomHeader {...props}/>}
          onSwipeEnd={handleDateChange}
          onPressCell={(date)=>handleDatePress(date)}
          calendarCellStyle={(date) => getDateCellStyle(date)} // 날짜 셀 스타일
          calendarCellTextStyle={(date) => getDateTextStyle(date)} // 날짜 텍스트 스타일
          maxVisibleEventCount={4}
          moreLabel=""
        />

        {/* Picker 영역 */}
        <YearMonthPickerModal
          visible={isPickerVisible}
          onClose={closePicker}
          initialYear={selectedDate.getFullYear()}
          initialMonth={selectedDate.getMonth() + 1}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: width, // 기기 너비에 맞춤
    height: height, // 기기 높이에 맞춤
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: 'white',
    zIndex: 10,
  },
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  headerSideButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dayOfTheWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: 'white',
    borderBottomWidth: 0.2,
    borderColor: '#DADADA',
  },
  dayOfTheWeekView: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayOfTheWeekText: {
    fontSize: 15,
  },
  calendarCellStyle: {
    borderColor: '#DADADA',
    borderBottomWidth: 0,
    borderTopWidth: 0.2,
    borderRightWidth: 0,
    borderLeftWidth: 0,
  },
});

export default CalendarScreen;
