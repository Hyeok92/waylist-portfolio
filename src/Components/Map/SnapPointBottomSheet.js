import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, Dimensions, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const screenHeight = Dimensions.get('screen').height;
const SNAP_POINTS = [screenHeight * 0.85, screenHeight * 0.5, screenHeight * 0.2];

const SnapPointBottomSheet = ({
  visible,
  onClose,
  children,
  placeData,
}) => {
  const panY = useRef(new Animated.Value(SNAP_POINTS[1])).current;
  // https://reactnative.dev/docs/0.65/animations#interpolation <-- interpolate 설명 공식 문서
  // https://coding-w00se.tistory.com/54 <-- interpolate의 extrapolate에 대해 정리한 블로그 글

  const currentSnap = useRef(1); // 현재 Snap 위치 저장

  const moveToSnapPoint = (index) => {
    console.log('인덱스:',index);
    if (index < 0) {
      closeBottomSheet();
      return;
    }

    Animated.timing(panY, {
      toValue: SNAP_POINTS[index],
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      currentSnap.current = index; // 현재 위치 업데이트
    });
  };

  const closeBottomSheet = () => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const getClosestSnapIndex = (currentY, direction) => {
    console.log('closer::', currentY);
    if (direction === 'up') {
      // 🔥 80% 이상이면 강제로 80%로 설정 (넘어가지 않도록)
      if (currentY > SNAP_POINTS[0]) {
        return 0;
      }
      // 현재 위치보다 위에 있는 SNAP_POINT 중 가장 가까운 것 찾기
    let closestUp = SNAP_POINTS.findIndex(point => point < currentY);
    console.log('UP::', closestUp);
    return closestUp !== -1 ? closestUp : 2; // 🔥 없으면 80% 유지
      // return SNAP_POINTS.findIndex(point => point < currentY);
    } else {
      // 현재 위치보다 아래에 있는 SNAP_POINT 중 가장 가까운 것 찾기
      for (let i = SNAP_POINTS.length - 1; i >= 0; i--) {
        if (SNAP_POINTS[i] > currentY) {
          return i;
        }
      }
      return -1;
    }
  };

  const panResponders = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderMove: (event, gestureState) => { // BottomSheet에 터치 또는 드래그 이벤트가 발생할 때 실행됩니다.
      let newY = SNAP_POINTS[currentSnap.current] + gestureState.dy;

        // 🔥 80% 이상으로 드래그 안되도록 제한
      console.log('🔍 onPanResponderMove EVENT');
      console.log('👉 newY:', newY);
      console.log('👉 Math.min(newY, Math.max(newY, SNAP_POINTS[2])):', Math.min(newY, Math.max(newY, SNAP_POINTS[2])));
      console.log('👉 Math.min(screenHeight, Math.max(newY, SNAP_POINTS[2])):', Math.min(screenHeight, Math.max(newY, SNAP_POINTS[2])));
      newY = Math.max(newY, SNAP_POINTS[2]);
      panY.setValue(newY);
      console.log(gestureState.dy);
    },
    onPanResponderRelease: (event, gestureState) => {
      const currentY = SNAP_POINTS[currentSnap.current] + gestureState.dy;
      const direction = gestureState.dy > 0 ? 'down' : 'up';

      let newIndex = getClosestSnapIndex(currentY, direction);

      console.log('🔍 RELEASE EVENT');
      console.log('👉 드래그 방향:', direction);
      console.log('👉 드래그 거리 (gestureState.dy):', gestureState.dy);
      console.log('👉 현재 위치 (currentY):', currentY);
      console.log('👉 선택된 스냅 인덱스 (newIndex):', newIndex);
      console.log('👉 screen height ', screenHeight);
      console.log('👉 screen height* 0.15 ', screenHeight * 0.15);

      moveToSnapPoint(newIndex);
    },
  })).current;

  useEffect(() => {
    console.log('흠::', SNAP_POINTS[0], SNAP_POINTS[1], SNAP_POINTS[2]);
    if (visible) {
      moveToSnapPoint(1);
    } else {
      closeBottomSheet();
    }
  }, [visible]);

  return (
    <Modal
      animationType={'fade'} // 자연스럽게 흐려짐
      transparent // 뒷배경 투명 효과
      statusBarTranslucent  // 안드로이드 statusbar 효과 적용을 위한
      visible={visible} >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback
          onPress={closeBottomSheet} >
          <View style={styles.background} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{ ...styles.bottomSheetContainer, transform: [{ translateY: panY }]}}
          {...panResponders.panHandlers} >
            <View style={styles.topIconContainer} />
          <View style={{
            width: '100%',
          }}>
            <FlatList
              data={placeData?.details?.photos || []}
              keyExtractor={(item, index) => index.toString()}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{placeData?.details?.name}</Text>
                  <Text style={{ fontSize: 16, color: 'gray' }}>{placeData?.details?.types}</Text>
                  <Text style={{ fontSize: 14, marginTop: 5 }}>{placeData?.details?.formatted_address}</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={{ padding: 10, borderBottomWidth: 1 }}>
                  <Text>{item.photo_reference}</Text>
                </View>
              )}
            />
          {children}
          </View>
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
    width: '100%',
    height: screenHeight,
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  topIconContainer: {
    height: 3,
    width: 50,
    borderRadius: 10,
    backgroundColor: '#DADADA',
    marginTop: 8,
  },
});

export default SnapPointBottomSheet;
