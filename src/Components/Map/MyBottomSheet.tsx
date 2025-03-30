import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import MasonryList from 'reanimated-masonry-list';
import type { FC, ReactElement } from 'react';
import { typeTranslations } from '../../Utils/industryTranslations';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import haversine from 'haversine';
import { useNavigation } from '@react-navigation/native';
import { SpaceContext } from '../../Provider/SpaceContext';
import { GOOGLE_MAPS_API_KEY } from '../../Utils/config';

interface PlaceData {
  name?: string;
  address?: string;
  description?: string;
  [key: string]: any; // 여기에 없는 속성도 허용
}
interface MyBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  placeData: PlaceData;
}

interface Furniture {
  id: string;
  imgURL: string;
  text: string;
}

const FurnitureCard: FC<{ item: Furniture }> = ({ item }) => {
  const randomBool = useMemo(() => Math.random() < 0.5, []);

  return (
    <View key={item.id} style={{ marginTop: 12, flex: 1 }}>
      <Image
        source={{ uri: item.imgURL }}
        style={{
          height: 200,
          width: 200,
          alignSelf: 'stretch', marginHorizontal: 10, borderRadius: 15,
        }}
      />
      <Text
        style={{
          marginTop: 8,
        }}>
        {item.text}
      </Text>
    </View>
  );
};

// ref 타입을 BottomSheetModalMethods로 설정
export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
}

const MyBottomSheet = forwardRef<BottomSheetRef, { visible: boolean; onClose: () => void; placeData?: any, placeId?: any, userLocation?: any, }>(
  ({ visible, onClose, placeData, placeId, userLocation }, ref) => {
    const navigation = useNavigation();
    const sheetRef = useRef<BottomSheetModal>(null);
    const { spaceState, addSpace, updateSpace, removeSpace } = useContext(SpaceContext);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.present(),
      close: () => sheetRef.current?.dismiss(),
      snapToIndex: (index) => sheetRef.current?.snapToIndex(index),
      snapToPosition: (position) => sheetRef.current?.snapToPosition(position),
    }));

    const [isBookMark, setIsBookMark] = useState(false);
    const snapPoints = useMemo(() => ["15%", "50%", "85%"], []);

    // callbacks
    const handleSheetChange = useCallback((index) => {
      console.log("handleSheetChange", index);
      if(index === -1) {
        onClose();
      }
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

    // render
    const renderItem = useCallback(
      ({ item }) => (
        <View style={styles.itemContainer}>
          <Text>{item}</Text>
        </View>
      ),
      []
    );

    const getImageUri = (photo: any) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
    };


    const getTranslatedType = (types: any) => {
      if (!types || types.length === 0) { return '기타'; }
      let typeText = '';
      for (let type of types) {
        if (typeTranslations[type]) {
          typeText === '' ? typeText = `${typeTranslations[type]}` : typeText = `${typeText}, ${typeTranslations[type]}`;
        } else if (type.includes('point_of_interest')) {
          typeText === '' ? typeText = `관심 지점` : typeText = `${typeText}, 관심 지점`;
        } else {
          if (!typeText.includes('기타')) {
            typeText === '' ? typeText = `기타` : typeText = `${typeText}, 기타`;
          }
        }
      }
      return typeText === '' ? '기타' : typeText;
    };

    const mosonryListRenderItem = ({
      item,
    }: {
      item: Furniture;
      index?: number;
    }): ReactElement => {
      return <FurnitureCard item={item} />;
    };

    const distanceToText = (data: any) => {
      console.log('distanceToText', data);
      console.log('distanceToText', userLocation);
      if (!userLocation || !data) { return '? km'; }
      const distance = haversine(userLocation, { latitude: data.lat, longitude: data.lng }).toFixed(1);
      return `${distance}km`;
    };

    const bookmarkCheck = () => {
      setIsBookMark(spaceState?.spaces?.some((space: any) => space.lat === placeData?.geometry?.location?.lat &&
      space.lng === placeData?.geometry?.location?.lng));
    }

    const moveToAddScedule = () => {
      navigation.navigate('AddSpace', {selectPlaceDate: placeData, placeId: placeId});
    };

    const deleteSpace = () => {
      const foundItem = spaceState?.spaces?.find((space: any) => space.lat === placeData?.geometry?.location?.lat && space.lng === placeData?.geometry?.location?.lng);
      Alert.alert(
        '선택한 항목이 삭제됩니다.',
        '삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: () => removeSpace(foundItem.id) },
        ]
      );
    };

    useEffect(() => {
      bookmarkCheck();
    }, [placeData, spaceState]);

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
          handleIndicatorStyle={{ backgroundColor: '#DADADA', width: 50 }} >
          <BottomSheetFlatList
            data={[]}
            keyExtractor={(i) => i}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            ListEmptyComponent={
              <View>
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{placeData?.name}</Text>
                </View>

                <View style={styles.industryContainer}>
                  <Text style={styles.industryText}>{getTranslatedType(placeData?.types)}</Text>
                </View>

                {placeData?.photos && (
                  <View style={{ width: '100%', height: 220, paddingBottom: 10, }}>
                    <MasonryList
                      data={placeData?.photos.map((photo: any, index: number) => ({
                        imgURL: getImageUri(photo),
                        id: index.toString(),
                        // text: `번호 : ${index}`, // 랜덤한 크기 설정
                      }))}
                      keyExtractor={(item) => item.id}
                      horizontal={true}
                      alwaysBounceVertical={false}
                      ListHeaderComponent={<View />}
                      showsHorizontalScrollIndicator={false} // 스크롤 바 숨김
                      numColumns={1} // 2열로 정렬
                      nestedScrollEnabled={true}
                      bounces={false}
                      keyboardShouldPersistTaps="handled"

                      // contentContainerStyle={{
                      //   paddingHorizontal: 24,
                      //   alignSelf: 'stretch',
                      // }}
                      renderItem={mosonryListRenderItem} />
                  </View>
                )}

                <View style={styles.lineContainer}>
                  <View style={styles.lineIconContainer}>
                    <Ionicons name="location-sharp" size={25} color='#3E8EDE' />
                  </View>
                  <View style={styles.lineTextContainer}>
                    <Text style={styles.lineText}>{placeData?.formatted_address}</Text>
                  </View>
                </View>

                <View style={styles.lineContainer}>
                  <View style={styles.lineIconContainer}>
                    <Ionicons name="trending-up" size={25} color='#3E8EDE' />
                  </View>
                  <View style={styles.lineTextContainer}>
                    <Text style={styles.lineText}>{distanceToText(placeData?.geometry?.location)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.bookMarkButton}
                  onPress={isBookMark ? deleteSpace : moveToAddScedule} >
                  <FontAwesome name={isBookMark ? "bookmark" : "bookmark-o"} size={25} color="#3E8EDE" />
                </TouchableOpacity>

              </View>
            } />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
  titleContainer: {
    width: '100%',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 50,
    paddingBottom: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  industryContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  industryText: {
    fontSize: 13,
    color: 'gray',
  },
  lineContainer: {
    minHeight: 60,
    width: '100%',
    flexDirection: 'row',
    padding: 10,
  },
  lineIconContainer: {
    height: 40,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lineTextContainer: {
    flexDirection: 'row',
    width: '85%',
    paddingTop: 10
  },
  lineText: {
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
  bookMarkButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    padding: 0,
  },
});

export default MyBottomSheet;