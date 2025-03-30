import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MemoContext } from '../../Provider/MemoContext';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AddMemoModal = ({
  navigation,
  route,
}) => {
  const { memoState, addMemo, updateMemo } = useContext(MemoContext);

  const isEditMode = route.params?.savedMemo ? true : false;
  const existingMemo = route.params?.savedMemo || {};

  const [memo, setMemo] = useState('');

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
    setMemo('');
  };

  const saveInitialData = useRef(
    isEditMode ? {
      memo: existingMemo.memo,
    } : {
      memo: '',
    });

  useEffect(() => {
    if (isEditMode)
      setMemo(existingMemo.memo);
  }, [isEditMode]);

  const isDataChanged = () => {
    return memo !== saveInitialData.current.memo;
  };

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

  const saveMemo = async () => {
    if (!memo.trim()) {
      Alert.alert('⚠️ 경고', '메모를 입력해주세요.');
      return;
    }

    try {
      const maxId = memoState.memos.length > 0
        ? Math.max(...memoState.memos.map(memo => memo.id)) + 1
        : 0;

      const newMemo = {
        id: isEditMode ? existingMemo.id : maxId,
        memo: memo,
        firstAddedDate: isEditMode ? existingMemo.firstAddedDate : new Date().toISOString(),
        modificationDate: new Date().toISOString(),
      };

      if (isEditMode) {
        updateMemo(newMemo);
      } else {
        addMemo(newMemo);
      }

      navigation.pop();
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => back()}>
          <Ionicons name="close" size={25} color='#3E8EDE' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => saveMemo()}>
          <Text style={styles.saveButtonText}>{'저장'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        innerRef={(ref) => (scrollViewRef.current = ref)}
        scrollEnabled={true}
        enableAutomaticScroll={true}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled" >
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

export default AddMemoModal;