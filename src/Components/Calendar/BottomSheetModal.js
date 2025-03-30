import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, Dimensions, Animated, PanResponder, TouchableOpacity } from 'react-native';

const bottomSheetContainer = ({
    visible,
    onClose,
    children,
}) => {
  const screenHeight = Dimensions.get('screen').height;
  const viewHeight = useRef(0);
  const panY = useRef(new Animated.Value(screenHeight)).current;
  // https://reactnative.dev/docs/0.65/animations#interpolation <-- interpolate 설명 공식 문서
  // https://coding-w00se.tistory.com/54 <-- interpolate의 extrapolate에 대해 정리한 블로그 글
  const translateY = panY.interpolate({ // panY에 따라 BottomSheet의 y축 위치를 결정합니다.
      inputRange: [-1, 0, 1], // inputRange의 -1을 outputRange의 0으로 치환하기 때문에 panY의 값이 0보다 작아져도 BottomSheet의 y축 위치에는 변화가 없습니다.
      outputRange: [0, 0, 1],
  });

  const resetBottomSheet = Animated.timing(panY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
  });

  const closeBottomSheet = Animated.timing(panY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
  });

  const panResponders = useRef(PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (event, gestureState) => { // BottomSheet에 터치 또는 드래그 이벤트가 발생할 때 실행됩니다.
          panY.setValue(gestureState.dy); // 처음 터치 영역을 기준으로 y축으로 드래그한 거리를 panY에 저장합니다.
          console.log(gestureState.dy);
      },
      onPanResponderRelease: (event, gestureState) => { // 유저가 BottomSheet에서 손을 뗐을 때 실행됩니다.
        console.log(gestureState.dy);
          if(gestureState.dy > viewHeight.current * 0.3 || gestureState.vy > 1.5) { // 유저가 y축으로 1.5 이상의 속도로 드래그 했을 때 BottomSheet가 닫히도록 조건 지정. (빠르게 밑으로 드래그했을 때 닫히도록)
              closeModal();
          }
          else { // 위 조건에 맞지 않으면 BottomSheet의 위치 초기화.
              resetBottomSheet.start();
          }
      },
  })).current;

  useEffect(()=>{
      if(visible) {
        resetBottomSheet.start();
      } else {
        closeBottomSheet.start();
      }
  }, [visible]);

  const closeModal = () => {
      closeBottomSheet.start(()=>{
        onClose(); // BottomSheet가 닫힌 후 Modal이 사라지도록.
      });
  };

  const onLayout = event => {
    const {height} = event.nativeEvent.layout;
    viewHeight.current = height;
    console.log(height);
    console.log(viewHeight.current);
  };

  return (
    <Modal
      animationType={'fade'} // 자연스럽게 흐려짐
      transparent // 뒷배경 투명 효과
      statusBarTranslucent  // 안드로이드 statusbar 효과 적용을 위한
      visible={visible} >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={closeModal} >
            <View style={styles.background}/>
          </TouchableWithoutFeedback>
          <Animated.View
            style={{...styles.bottomSheetContainer, transform: [{ translateY: translateY }]}}
            onLayout={onLayout}
            {...panResponders.panHandlers} >
            <View style={styles.topIconContainer} />
            {children}
          </Animated.View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  background: {
      flex: 1,
  },
  bottomSheetContainer: {
      minHeight: 150,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
  },
  topIconContainer: {
    height: 3,
    width: 50,
    borderRadius: 10,
    backgroundColor: '#DADADA',
    marginTop: 8,
  },
});

export default bottomSheetContainer;
