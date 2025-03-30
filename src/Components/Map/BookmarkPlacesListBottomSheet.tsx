import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import type { FC, ReactElement } from 'react';
import { typeTranslations } from '../../Utils/industryTranslations';
import Ionicons from 'react-native-vector-icons/Ionicons';
import haversine from 'haversine';
import { useNavigation } from '@react-navigation/native';
import { SpaceContext } from '../../Provider/SpaceContext';
import { Menu, Divider, IconButton } from 'react-native-paper';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
}

const BookmarkPlacesListBottomSheet = forwardRef<BottomSheetRef, { placeData?: any, userLocation?: any, onPlacePress?: (space: any) => void }>(
  ({ placeData, userLocation, onPlacePress }, ref) => {
    const navigation = useNavigation();
    const sheetRef = useRef<BottomSheetModal>(null);
    const { spaceState, addSpace, updateSpace, removeSpace } = useContext(SpaceContext);
    const [addDistancePlaceData, setAddDistancePlaceData] = useState([]);

    const [selectedMenuId, setSelectedMenuId] = useState(null);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.present(),
      close: () => sheetRef.current?.dismiss(),
      snapToIndex: (index) => sheetRef.current?.snapToIndex(index),
      snapToPosition: (position) => sheetRef.current?.snapToPosition(position),
    }));

    useEffect(() => {
      setAddDistancePlaceData(spaceState.spaces.map((space: any) => ({
        ...space,
        distance: userLocation
        ? `${haversine(userLocation, { latitude: space.lat, longitude: space.lng }).toFixed(1)}km`
        : '? km',
      })));
    }, [spaceState.spaces, userLocation]);
    
    const snapPoints = useMemo(() => ["15%", "50%", "85%"], []);

    // callbacks
    const handleSheetChange = useCallback((index) => {
      console.log("handleSheetChange", index);
    }, []);
    const handleSnapPress = useCallback((index) => {
      sheetRef.current?.snapToIndex(index);
    }, []);
    const handleClosePress = useCallback(() => {
      sheetRef.current?.close();
    }, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1} />),
      [],
    );

    const moveToEditSpace = (item: any) => {
      setSelectedMenuId(null);
      navigation.navigate('AddSpace', {selectPlaceDate: placeData, savedSpace: item, placeId: item.placeId});
    };

    const deleteSpace = (item: any) => {
      setSelectedMenuId(null);
      Alert.alert(
        '선택한 항목이 삭제됩니다.',
        '삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: () => removeSpace(item.id) },
        ]
      );
    };

    // render
    const renderItem = useCallback(({ item }) => {
      const isVisible = selectedMenuId === item.id;

      return (
        <TouchableOpacity style={styles.lineContainer} onPress={() => onPlacePress(item)}>
          <View style={styles.lineIconContainer}>
            <View style={styles.lineIconBackground}>
              <Ionicons name="paw" size={20} color='#3E8EDE' />
            </View>
          </View>
          <View style={styles.lineTextContainer}>
            <Text style={styles.lineTitleText} numberOfLines={1} ellipsizeMode='tail'>{item.title}</Text>
            <Text style={styles.lineAddressText} numberOfLines={1} ellipsizeMode='tail'>{item.distance} | {item.address}</Text>
            <Text style={styles.lineMemoText} numberOfLines={1} ellipsizeMode='tail'>{item.memo}</Text>
          </View>
          <TouchableOpacity style={styles.lineIconContainer}>
            <Menu
              visible={isVisible}
              onDismiss={() => setSelectedMenuId(null)}
              anchor={<IconButton icon="dots-vertical" size={24} onPress={() => setSelectedMenuId(item.id)} iconColor='#3E8EDE' />}
              contentStyle={styles.popupMenu} >
              <Menu.Item onPress={() => moveToEditSpace(item)} title="편집" leadingIcon="pencil" />
              <Divider />
              <Menu.Item onPress={() => deleteSpace(item)} title="삭제" leadingIcon="delete" titleStyle={{ color: 'red' }} />
            </Menu>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },[selectedMenuId]);

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          onChange={handleSheetChange}
          backdropComponent={() => <View />} // ✅ 배경 제거 (반투명 X)
          enableOverDrag={false} // ✅ 외부 터치 무시
          index={1}
          handleIndicatorStyle={{ backgroundColor: '#DADADA', width: 50 }}
        >
          <BottomSheetFlatList
            data={addDistancePlaceData}
            keyExtractor={(data) => data.id}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            ListEmptyComponent={ <View /> }
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  });

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
  },
  lineContainer: {
    minHeight: 60,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
  },
  lineIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineIconBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 30,
    borderColor: '#3E8EDE',
    borderWidth: 1,
  },
  lineTextContainer: {
    flex: 1,
    paddingTop: 10
  },
  lineTitleText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 15,
    lineHeight: 18,
    textAlignVertical: 'top',
    padding: 5,
    paddingTop: 0,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
  lineAddressText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'top',
    padding: 5,
    paddingTop: 0,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
  lineMemoText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 12,
    color: 'gray',
    lineHeight: 18,
    textAlignVertical: 'top',
    padding: 5,
    paddingTop: 0,
    paddingLeft: 10,
    flexWrap: 'wrap',
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
});

export default BookmarkPlacesListBottomSheet;