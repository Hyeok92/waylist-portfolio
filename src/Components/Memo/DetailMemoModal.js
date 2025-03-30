import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, TextInput, Keyboard } from 'react-native';
import { MemoContext } from '../../Provider/MemoContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Menu, Divider, IconButton } from 'react-native-paper';
import _ from 'lodash'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const DetailMemoModal = ({
  navigation,
  route,
}) => {
  const { memoState, updateMemo, removeMemo } = useContext(MemoContext);
  const { selectedMemo } = route.params;
  const [popupMenuVisible, setPopupMenuVisible] = useState(false);
  const [memo, setMemo] = useState(selectedMemo.memo);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
    const scrollViewRef = useRef(null);
    const inputRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);
  
    const handleContentSizeChange = (width, height) => {
      if (height !== contentHeight) {
        setContentHeight(height);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    };

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
  
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const openPopupMenu = () => setPopupMenuVisible(true);
  const closePopupMenu = () => setPopupMenuVisible(false);

  const back = () => {
    navigation.pop();
  };

  useEffect(() => {
    setMemo(selectedMemo.memo); // selectedMemo가 바뀔 때만 적용
  }, [selectedMemo]);

  const deleteMemo = (id) => {
    closePopupMenu();
    Alert.alert(
      '선택한 항목이 삭제됩니다.',
      '삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          removeMemo(id);
          back();
        }},
      ]
    );
  };

  const saveMemo = async (newText) => {
    try {
      const editMemo = {
        id: selectedMemo.id,
        memo: newText,
        firstAddedDate: selectedMemo.firstAddedDate,
        modificationDate: new Date().toISOString(),
      };
      updateMemo(editMemo);
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  // ✅ 1. 1초 동안 입력이 멈추면 저장
  const saveNote = useCallback(
    _.debounce(async (newText) => {
      saveMemo(newText);
    }, 1000), // 1초 대기
    []
  );

  // ✅ 2. 텍스트가 변경될 때만 saveNote 호출
  const handleTextChange = (newText) => {
    setMemo(newText);
    if(newText !== selectedMemo.memo)
      saveNote(newText);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12; // 12시간제로 변환 (0시 -> 12시)
  
    return `${year}년 ${month}월 ${day}일 ${ampm} ${formattedHours}:${minutes}`;
  };

  if (!selectedMemo) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIconContainer}>
        <View style={styles.topIcon} />
      </View>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerSideButton} onPress={() => back()} >
          <Ionicons name="arrow-back" size={25} color='#3E8EDE' />
        </TouchableOpacity>
        <Text numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.headerText}>
          {selectedMemo.memo.match(/^[^\n]+/)?.[0] || ""}
        </Text>
        <View style={styles.headerSideButton} >
        {isKeyboardVisible ? (
          <TouchableOpacity onPress={Keyboard.dismiss}>
            <MaterialIcons name="keyboard-hide" size={25} color="#3E8EDE" />
          </TouchableOpacity>
        ) : (
          <Menu
            visible={popupMenuVisible}
            onDismiss={closePopupMenu}
            anchor={<IconButton icon="dots-vertical" size={24} onPress={openPopupMenu} iconColor='#3E8EDE' />}
            contentStyle={styles.popupMenu} >
            <Menu.Item onPress={() => deleteMemo(selectedMemo.id)} title="삭제" leadingIcon="delete" titleStyle={{ color: 'red' }} />
          </Menu>
        )}
        </View>
      </View>

      <KeyboardAwareScrollView
        innerRef={(ref) => (scrollViewRef.current = ref)}
        scrollEnabled={true}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled" >
        <View style={styles.modificationDateTextContainer}>
          <Text style={styles.modificationDateText}>{formatDate(selectedMemo.modificationDate)}</Text>
        </View>
        <View style={styles.memoTextInputOutLineContainer}>
          <View style={styles.scrollViewInnerTextInputContainer}>
            <TextInput style={styles.memoInput} multiline={true} onChangeText={handleTextChange} value={memo}
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
      </KeyboardAwareScrollView>
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
    paddingLeft: 10,
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E8EDE',
  },
  popupMenu: {
    backgroundColor: 'white',
    borderRadius: 12, // iOS처럼 둥글게
    shadowColor: '#000', // iOS 스타일의 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Android 그림자
    paddingVertical: 0, // 아이템 간격 조정
  },
  modificationDateTextContainer: {
    height: 40,
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
  memoTextInputOutLineContainer: {
    paddingRight: 20,
    paddingLeft: 20,
    width: '100%',
  },
  modificationDateText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 12,
    paddingLeft: 10,
    color: 'gray'
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
});

export default DetailMemoModal;