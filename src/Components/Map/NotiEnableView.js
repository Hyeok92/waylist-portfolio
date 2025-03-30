import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

const NotiEnableView = ({
  currentNoti,
  notiEnableOnClose,
}) => {
  const [selectedNoti, setSelectedNoti] = useState(currentNoti);
  
  const spaceNoti = [
    { id: 0, name: '항상', value: 'alway'},
    { id: 1, name: '한번', value: 'once'},
    { id: 2, name: '없음', value: 'none'},
  ];

  const onSelected = (value) => {
    setSelectedNoti(value);
    notiEnableOnClose(value);
  };

  useEffect(() => {
    console.log('test noti data', currentNoti);
  });

  return (
    <View style={styles.listContainer}>
      <View style={styles.titleContainer}>
        <Text style={{color: 'gray'}}>위치 알림 설정 리스트</Text>
      </View>
      {spaceNoti.map((noti) => (
        <TouchableOpacity key={noti.id} style={[styles.colorListContainer, selectedNoti === noti.value && styles.selectedBackground]} onPress={() => onSelected(noti.value)}>
          <View style={styles.showColorView} />
          <Text style={styles.colorListText}>{noti.name}</Text>
          <View style={styles.radioButtonContainer}>
            {selectedNoti === noti.value ?
            <View style={styles.selectedOutRadioView} >
              <View style={styles.selectedInRadioView} />
            </View> :
            <View style={styles.unSelectedRadioView} /> }
          </View>
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#E0E0E0', // 선택된 항목 배경색
  },
  selectedOutRadioView: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'balck',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInRadioView: {
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'balck',
    backgroundColor: 'black',
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

export default NotiEnableView;