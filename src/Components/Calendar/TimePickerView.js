import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { getLocales } from 'react-native-localize';

const TimePickerView = ({
  visible,
  onTimeSelected,
  selectedTime,
}) => {
  const [date, setDate] = useState(new Date(selectedTime));

  const getCurrentDeviceLanguage = () => {
    const locales = getLocales();
    return locales[0].languageCode; // id
  };
  const [languageCode, setLanguageCode] = useState(getCurrentDeviceLanguage);

  useEffect(() => {
    onTimeSelected(date);
  }, [date]);

  if (!visible) {return null;}
  return (
    <View style={styles.pickerContainer}>
      <DatePicker
        date={date}
        onDateChange={setDate}
        locale={languageCode}
        mode={'time'} />
    </View>
  );
};


const styles = StyleSheet.create({
  pickerContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TimePickerView;
