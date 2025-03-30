import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Text, TouchableWithoutFeedback, Dimensions, BackHandler} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const { height, width } = Dimensions.get('window'); // 기기의 화면 크기 가져오기

const YearMonthPickerModal = ({
    visible,
    onClose,
    initialYear,
    initialMonth,
}) => {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth); // 1~12

    // 년도 및 월 데이터 생성
    const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1970 ~ 2019
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1 ~ 12

    useEffect(() => {
        if (visible) {
            setSelectedYear(initialYear);
            setSelectedMonth(initialMonth);
        }
    }, [visible, initialYear, initialMonth]);

    if (!visible) {return null;}
    return (
      <TouchableWithoutFeedback onPress={() => onClose(null, null)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.pickerModal}>
              <View style={styles.pickerRow}>
                {/* 년도 Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(value) => setSelectedYear(value)}
                    style={styles.picker} >
                      {years.map((year) => (
                        <Picker.Item key={year} label={`${year}년`} value={year} />
                        ))}
                  </Picker>
                </View>

                {/* 월 Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                    style={styles.picker}>
                      {months.map((month) => (
                        <Picker.Item key={month} label={`${month}월`} value={month} />
                      ))}
                  </Picker>
                </View>
            </View>
              <View style={styles.pickerButtonRow}>
                <TouchableOpacity style={styles.pickerButton} onPress={() => onClose(null, null)}>
                  <Text style={styles.pickerButtonText}>{'취소'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={() => onClose(selectedYear, selectedMonth)}>
                  <Text style={styles.pickerButtonText}>{'확인'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    overlay: {
      width: width, // 기기 너비에 맞춤
      height: height, // 기기 높이에 맞춤
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'translate', // 투명한 배경
      alignItems: 'center',
    },
    pickerModal: {
        top: 50, // 헤더 바로 아래에 배치
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        zIndex: 20,
        padding: 10,
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    picker: {
        width: '100%',
    },
    pickerButtonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerButton: {
        width: '30%',
        alignItems: 'center',
        padding: 10,
        margin: 20,
        borderRadius: 15,
        backgroundColor: '#3E8EDE',
    },
    pickerButtonText: {
        fontSize: 15,
        color: 'white',
    },
});

export default YearMonthPickerModal;
