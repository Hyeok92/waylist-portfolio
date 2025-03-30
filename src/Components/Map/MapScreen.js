import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Alert, Button, StyleSheet, Text, View, SafeAreaView, TouchableOpacity, PermissionsAndroid, Platform, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import GooglePlacesSearch from './GooglePlacesSearch';
import MyBottomSheet from './MyBottomSheet';
import { SpaceContext } from '../../Provider/SpaceContext';
import BookmarkPlacesListBottomSheet from './BookmarkPlacesListBottomSheet'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import MapView from 'react-native-map-clustering'
import { GOOGLE_MAPS_API_KEY } from '../../Utils/config';

const INITIAL_REGION = {
  latitude: 37.5665,  // 서울 기본값
  longitude: 126.9780,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const statusBarHeight = Platform.OS === 'ios' ? getStatusBarHeight(true) : StatusBar.currentHeight;

const MapScreen = ({
  navigation,
  route,
}) => {
  const { spaceState, } = useContext(SpaceContext);

  const spacesData = useMemo(() => {
    return Array.isArray(spaceState.spaces) ? [...spaceState.spaces] : [];
  }, [spaceState.spaces]);

  const mapRef = useRef(null); // 🗺 MapView 참조
  const [selectedLocation, setSelectedLocation] = useState(null); // 📍 선택된 위치 저장
  const [placeId, setPlaceId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [userLocation, setUserLocation] = useState(INITIAL_REGION);

  const [backgroundPress, setBackgroundPress] = useState(null);
  const [detailPlaceData, setDetailPlaceData] = useState(null);

  const bottomSheetRef = useRef(null);
  const placeListBottomSheetRef = useRef(null);

  const [locationPermission, setLocationPermission] = useState(false);

  // 📌 위치 권한 요청
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('📍 위치 권한 허용됨');
          setLocationPermission(true);
        } else {
          Alert.alert('⛔ 위치 권한이 필요합니다!', '앱 설정에서 위치 권한을 허용해주세요.');
          console.log('⛔ 위치 권한 거부됨');
          setLocationPermission(false);
        }
      } catch (err) {
        console.warn(err);
        setLocationPermission(false);
      }
    } else {
      setLocationPermission(true);
    }
  };

  useEffect(() => {
    requestLocationPermission();
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    goToCurrentLocation();
  }, [locationPermission]);

  // 현재 위치로 이동하는 함수
  // 이동하면서 다니면 갱신해야되므로..
  const goToCurrentLocation = () => {
    if (!locationPermission) return;

    Geolocation.getCurrentPosition(
      position => {
        const newRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current.animateToRegion(newRegion, 1000);
        setUserLocation(newRegion);
      },
      error => console.log('현재 위치 이동 실패:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const setFocus = (data) => {
    setSearchFocused(data);
    if(data) {
      bottomSheetRef.current?.snapToIndex(0);
      placeListBottomSheetRef.current?.snapToIndex(0);
    }
  };

  // 검색된 장소 선택 시 마커 업데이트
  const handlePlaceSelect = (place) => {
    if (place.details?.geometry?.location) {
      const newLocation = {
        latitude: place.details.geometry.location.lat,
        longitude: place.details.geometry.location.lng,
      };
      setSelectedLocation(newLocation);
      setSelectedMarker(newLocation);
      setPlaceId(place?.place_id);
      setDetailPlaceData(place?.details);
      moveMapToPosition(newLocation.latitude, newLocation.longitude);
      detailPlaceSheetOpen();
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=ko&key=${GOOGLE_MAPS_API_KEY}&fields=name,geometry,formatted_address,types,photos,editorial_summary`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('❌ 장소 세부정보 가져오기 실패:', error);
      return null;
    }
  };

  const moveMapToPosition = (latitude, longitude) => {
    if (!mapRef.current) return;

    mapRef.current.getMapBoundaries().then((bounds) => {
      const { northEast, southWest } = bounds;

      // 현재 화면의 latitudeDelta 계산
      const currentLatitudeDelta = northEast.latitude - southWest.latitude;

      // 50% → 25% 위치로 이동 (latitude를 위로 조금 올리기)
      const adjustedLatitude = latitude - currentLatitudeDelta * 0.2;

      mapRef.current.animateToRegion({
        latitude: adjustedLatitude,
        longitude,
        latitudeDelta: currentLatitudeDelta,  // 기존 delta 유지
        longitudeDelta: 0.01,  // 기존 값 사용
      });
    });
  };

  const myPlaceSheetOpen = () => {
    bottomSheetRef.current?.close();
    placeListBottomSheetRef.current?.open()
    placeListBottomSheetRef.current?.snapToIndex(1);
  }

  const detailPlaceSheetOpen = () => {
    placeListBottomSheetRef.current?.close()
    bottomSheetRef.current?.open();
    bottomSheetRef.current?.snapToIndex(1);
  }

  const handleBookmarkPlacePress = (space) => {
    if (!space) return;
    setSelectedLocation({
      name: space.title,
      address: space.address || '주소 없음',
      latitude: space.lat,
      longitude: space.lng,
    });
    if (space.googlePlaceId) {
      setPlaceId(space.googlePlaceId);
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${space.googlePlaceId}&language=ko&key=${GOOGLE_MAPS_API_KEY}&fields=name,geometry,formatted_address,types,photos,editorial_summary`)
        .then((res) => res.json())
        .then(async (data) => {
          setPlaceId(placeId);
          setDetailPlaceData(data.result);
          moveMapToPosition(space.lat, space.lng);
          detailPlaceSheetOpen();
        })
        .catch((err) => {
          console.error('❌ 검색 오류:', err);
          return null
        });
    } else {
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${space.lat},${space.lng}&key=${GOOGLE_MAPS_API_KEY}`)
        .then((res) => res.json())
        .then(async (data) => {
          const details = await fetchPlaceDetails(data?.results[0]?.place_id);
          setPlaceId(data?.results[0]?.place_id);
          setDetailPlaceData(details);
          moveMapToPosition(space.lat, space.lng);
          detailPlaceSheetOpen();
        })
        .catch((err) => {
          console.error('❌ 검색 오류:', err);
          return null
        });
    }
    setSelectedMarker(null);
  }

  const bookmarkPlacesMarker = () => {
    return spacesData?.map((space => (
      <Marker
        key={space.id}
        coordinate={{ latitude: space.lat, longitude: space.lng }}
        title={space.title}
        description={space.memo}
        zIndex={-999}
        onPress={() => handleBookmarkPlacePress(space)} >
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#3E8EDE',
          padding: 6,
          borderRadius: 30,
          borderColor: 'white',
          borderWidth: 3,
        }} >
          <Ionicons name="paw" size={20} color="white" />
        </View>
      </Marker>
    )))
  }
  
  const onClusterPress = async (cluster) => {
    if (!mapRef.current) return;
  
    try {
      const { geometry } = cluster;
      console.log(cluster);
  
    // 📍 현재 화면의 경계를 가져와서 delta 계산
    const bounds = await mapRef.current.getMapBoundaries();
    const { northEast, southWest } = bounds;
    const currentLatitudeDelta = Math.max(northEast.latitude - southWest.latitude, 0.02);
    const currentLongitudeDelta = Math.max(northEast.longitude - southWest.longitude, 0.02);
  
      // 지도 이동 및 확대
      mapRef.current.animateToRegion({
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
        latitudeDelta: currentLatitudeDelta / 2,
        longitudeDelta: currentLongitudeDelta / 2,
      });
    } catch (error) {
      console.error('❌ onClusterPress 에러:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      setBackgroundPress((prev) => !prev);
    }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={userLocation}
          followsUserLocation={true}
          showsUserLocation={true} // 사용자의 현재 위치 표시
          showsMyLocationButton={false} // ✅ 오른쪽 상단 버튼 숨기기
          clusterColor="#3E8EDE"
          clusterTextColor="white"
          onClusterPress={(cluster) => onClusterPress(cluster)} 
          onPoiClick={(event) => {
            const { placeId, name, coordinate } = event.nativeEvent;

            fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=ko&key=${GOOGLE_MAPS_API_KEY}&fields=name,geometry,formatted_address,types,photos,editorial_summary`)
              .then((res) => res.json())
              .then(async (data) => {
                console.log(data.result.name)
                console.log(data.result.formatted_address)
                setSelectedLocation({
                  name: data.result.name || '사용자 선택 위치',
                  address: data.result.formatted_address || '주소 없음',
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
                setSelectedMarker({
                  name: data.result.name || '사용자 선택 위치',
                  address: data.result.formatted_address || '주소 없음',
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
                moveMapToPosition(coordinate.latitude, coordinate.longitude);
                setPlaceId(placeId);
                setDetailPlaceData(data.result);
                // bottomSheetRef.current?.open();
                detailPlaceSheetOpen();
              })
              .catch((err) => {
                console.error('❌ 검색 오류:', err);
                return null
              });
          }}
          onLongPress={(event) => {
            const { coordinate } = event.nativeEvent;

            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`)
              .then((res) => res.json())
              .then(async (data) => {
                const details = await fetchPlaceDetails(data?.results[0]?.place_id);

                if (!details) {
                  console.warn("🚨 장소 정보를 찾을 수 없음:", item.place_id);
                  Alert.alert("위치 정보 없음", "해당 장소의 정보를 찾을 수 없습니다.\n주소로 입렵해보세요.");
                  return null;
                }
                setSelectedLocation({
                  name: details.name || '사용자 선택 위치',
                  address: details.formatted_address || '주소 없음',
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
                setSelectedMarker({
                  name: details.name || '사용자 선택 위치',
                  address: details.formatted_address || '주소 없음',
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                })
                moveMapToPosition(coordinate.latitude, coordinate.longitude);
                setPlaceId(data?.results[0]?.place_id);
                setDetailPlaceData(details);
                // bottomSheetRef.current?.open();
                detailPlaceSheetOpen();
              })
              .catch((err) => {
                console.error('❌ 검색 오류:', err);
                return null
              });
          }} >

          {bookmarkPlacesMarker()}
           
          {selectedMarker && (
            <Marker
              coordinate={{
                latitude: selectedMarker.latitude,
                longitude: selectedMarker.longitude,
              }}
              title={selectedMarker.name}
              description={selectedMarker.address}
              zIndex={1}
              cluster={false} // ✅ 클러스터링 제외
            />
          )}
        </MapView>

        <SafeAreaView style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <GooglePlacesSearch
              userLocation={userLocation}
              onFocused={(data) => setFocus(data)}
              backgroundPress={backgroundPress}
              onSelectPlace={handlePlaceSelect} />
          </View>

          {/* 오른쪽 버튼 */}
          {!searchFocused && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => myPlaceSheetOpen()}
            >
              <Ionicons name="bookmarks" size={20} color="#3E8EDE" />
            </TouchableOpacity>
          )}
        </SafeAreaView>

        {/* 현재 위치 버튼 */}
        <TouchableOpacity style={styles.currentLocationButton} onPress={goToCurrentLocation}>
          <Ionicons name="locate" size={28} color="white" />
        </TouchableOpacity>

        {/* BottomSheetModal 영역 */}
        <MyBottomSheet
          ref={bottomSheetRef}
          placeData={detailPlaceData}
          userLocation={userLocation}
          placeId={placeId}
          onClose={() => setSelectedMarker(null)} />

        <BookmarkPlacesListBottomSheet
          ref={placeListBottomSheetRef}
          userLocation={userLocation}
          onPlacePress={handleBookmarkPlacePress} />

      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
  },
  searchBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios'? statusBarHeight + 20 : 0,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  leftIcon: {
    padding: 10,
  },
  rightIcon: {
    position: 'absolute',
    top: Platform.OS === 'ios'? statusBarHeight + 22.5: 2.5,
    right: 0,  // 오른쪽 여백 설정
    padding: 10,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3E8EDE',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000', // iOS 스타일의 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default MapScreen;
