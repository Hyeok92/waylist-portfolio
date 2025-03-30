import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, Modal, TextInput, TouchableOpacity, FlatList, ScrollView, Switch, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SpaceContext } from '../../Provider/SpaceContext';
import BottomSheetModal from '../Calendar/BottomSheetModal';
import NotiEnableView from './NotiEnableView';
import Slider from '@react-native-community/slider';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddSpaceModal = ({
  navigation,
  route,
}) => {
  const { spaceState, addSpace, updateSpace } = useContext(SpaceContext);

  const { selectPlaceDate, placeId } = route.params;

  const isEditMode = route.params?.savedSpace ? true : false;
  const existingSpace = route.params?.savedSpace || {};

  const [title, setTitle] = useState(selectPlaceDate?.name);
  const [address, setAddress] = useState(selectPlaceDate?.formatted_address);
  const [memo, setMemo] = useState('');
  const [notiMode, setNotiMode] = useState('alway');
  const [lat, setLat] = useState(selectPlaceDate?.geometry?.location?.lat);
  const [lng, setLng] = useState(selectPlaceDate?.geometry?.location?.lng);
  const [radius, setRadius] = useState(1000);

  const [selectingNotiVisible, setSelectingNotiVisible] = useState(false);

  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const handleContentSizeChange = (width, height) => {
    if (height !== contentHeight) {
      setContentHeight(height);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const initialData = () => {
    setTitle('');
    setAddress('');
    setMemo('');
    setNotiMode('alway');
    setLat();
    setLng();
    setRadius(1000);
  };

  const saveInitialData = useRef(
    isEditMode ? {
      memo: existingSpace.memo,
      radius: existingSpace.radius,
      notiMode: existingSpace.notiMode,
    } : {
      memo: '',
      radius: 1000,
      notiMode: 'alway',
    });

  useEffect(() => {
    if (isEditMode) {
      setTitle(existingSpace.title);
      setAddress(existingSpace.address);
      setMemo(existingSpace.memo);
      setLat(existingSpace.lat);
      setLng(existingSpace.lng);
      setRadius(existingSpace.radius);
      setNotiMode(existingSpace.notiMode);
    }
  }, [isEditMode]);

  const isDataChanged = () => {
    return (
      memo !== saveInitialData.current.memo ||
      radius !== saveInitialData.current.radius ||
      notiMode !== saveInitialData.current.notiMode
    );
  };

  const showSelectingNoti = () => setSelectingNotiVisible(true);
  const hideSelectingNoti = () => setSelectingNotiVisible(false);

  const onSelectNoti = (value) => {
    setNotiMode(value);
    hideSelectingNoti();
  };

  const notiValueToText = (value) => {
    switch (value) {
      case 'alway':
        return '항상 알림';
      case 'once':
        return '한번 알림';
      case 'none':
      default:
        return '알림 없음';
    }
  }

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

  const onChangeMemo = (inputMemo) => setMemo(inputMemo);

  const saveSpace = async () => {
    try {
      const maxId = spaceState.spaces.length > 0
        ? Math.max(...spaceState.spaces.map(space => space.id)) + 1
        : 0;

      const newSpace = {
        id: isEditMode ? existingSpace.id : maxId,
        title: title,
        address: address,
        memo: memo,
        lat: lat,
        lng: lng,
        radius: radius,
        notiMode: notiMode,
        googlePlaceId: placeId,
      };

      if (isEditMode) {
        updateSpace(newSpace);
      } else {
        addSpace(newSpace);
      }
      navigation.pop();
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => back()}>
          <Ionicons name="close" size={25} color='#3E8EDE' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => saveSpace()}>
          <Text style={styles.saveButtonText}>{'저장'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <KeyboardAwareScrollView
        innerRef={(ref) => (scrollViewRef.current = ref)}
        scrollEnabled={true}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled" >
        <TouchableOpacity style={styles.scrollViewInnerContainer} onPress={showSelectingNoti}>
          <Ionicons name="notifications-outline" size={25} color='#3E8EDE' />
          <Text style={styles.scrollViewIconPlusText}>{notiValueToText(notiMode)}</Text>

          {/* BottomSheetModal 영역 */}
          <BottomSheetModal
            visible={selectingNotiVisible}
            onClose={hideSelectingNoti} >
            <NotiEnableView
              currentNoti={notiMode}
              notiEnableOnClose={(value) => onSelectNoti(value)} />
          </BottomSheetModal>

        </TouchableOpacity>

        <View style={styles.scrollViewInnerContainer} >
          <Ionicons name="navigate-circle-outline" size={25} color='#3E8EDE' />
          <Text style={styles.scrollViewIconPlusText}>알림 범위<Text style={styles.sliderLabel}>     {radius / 1000} km</Text></Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={100} // 최소 범위 500m
            maximumValue={5000} // 최대 범위 5km
            step={100} // 100m 단위로 증가
            value={radius}
            onValueChange={(value) => setRadius(value)}
            minimumTrackTintColor="#1E90FF"
            maximumTrackTintColor="#D3D3D3"
            thumbTintColor="#1E90FF"
          />
        </View>

        <View style={styles.scrollViewInnerContainer}>
          <Ionicons name="document-text-outline" size={25} color='#3E8EDE' />
          <Text style={styles.scrollViewIconPlusText}>메모</Text>
        </View>
        <View style={styles.memoTextInputOutLineContainer}>
          <View style={styles.scrollViewInnerTextInputContainer}>
            <TextInput style={styles.memoInput} multiline={true} onChangeText={onChangeMemo} value={memo}
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
        <View style={{ height: 50 }} />
      </KeyboardAwareScrollView>
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
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    height: 60,
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

  sliderContainer: {
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 13,
    marginBottom: 10
  },
});

export default AddSpaceModal;