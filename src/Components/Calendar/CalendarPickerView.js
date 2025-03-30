import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

const CalendarPickerView = ({
  visible,
  onSelected,
  selectedDate,
}) => {
  const [selectingDate, setSelectingDate] = useState(new Date(selectedDate));
  const [allDayEnable, setAllDayEnable] = useState(false);

  useEffect(() => {
    if(!visible)
      {setSelectingDate(new Date(selectedDate));}
  }, [visible, selectedDate]);

  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const today = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const dateString = year + '-' + month + '-' + today;
    return dateString;
  };

  const stringToDate = (date, dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    return date;
  };

  if (!visible) {return null;}
  return (
    <View>
      <CalendarList
        style={styles.calendar}
        // theme={{
        //   backgroundColor: '#ffffff',
        //   calendarBackground: '#ffffff',
        //   textSectionTitleColor: '#b6c1cd',
        //   selectedDayBackgroundColor: '#00adf5',
        //   selectedDayTextColor: '#ffffff',
        //   todayTextColor: '#00adf5',
        //   dayTextColor: '#2d4150',
        //   textDisabledColor: '#dd99ee'
        // }}
        monthFormat={'yyyy년 MM월'}
        horizontal={true}
        pagingEnabled={true}
        current={dateToString(selectingDate)}
        // minDate={this.dateToString(new Date())}
        // maxDate={'2100-12-31'}
        onDayPress={day => {
          setSelectingDate(stringToDate(selectingDate, day.dateString));
          onSelected(day.dateString);
        }}
        markedDates={{
          [dateToString(selectingDate)]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' },
        }}
        hideArrows={false}
        hideExtraDays={false}
        disableMonthChange={false}
        firstDay={7}
        hideDayNames={false}
        showWeekNumbers={false}
        disableArrowLeft={false}
        disableArrowRight={false}
        disableAllTouchEventsForDisabledDays={false}
      />
    </View>
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
    width: 60,
    // borderWidth: 1,
    // borderColor: 'yellow',
    // borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 15,
  },
  titleInput: {
    height: 60,
    paddingLeft: 50,
    fontSize: 20,
  },
  scrollViewInnerContainer: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
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
});

export default CalendarPickerView;
