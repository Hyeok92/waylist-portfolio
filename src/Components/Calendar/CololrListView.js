import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { pastelColors } from '../../Utils/colors';

const ColorListView = ({
  currentColor,
  colorListOnClose,
}) => {
  const [selectedColorId, setSelectedColorId] = useState(currentColor);

  const onSelected = (color) => {
    setSelectedColorId(color);
    colorListOnClose(color);
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.titleContainer}>
        <Text style={{color: 'gray'}}>라벨 색상 리스트</Text>
      </View>
      {pastelColors.map((color) => (
        <TouchableOpacity key={color.id} style={[styles.colorListContainer, selectedColorId === color.id && styles.selectedBackground]} onPress={() => onSelected(color.id)}>
          <View style={[styles.showColorView, {backgroundColor: color.hex}]} />
          <Text style={styles.colorListText}>{color.name}</Text>
          <View style={styles.radioButtonContainer}>
            {selectedColorId === color.id ?
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

export default ColorListView;
