import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator, Alert } from 'react-native';
import haversine from 'haversine';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { typeTranslations } from '../../Utils/industryTranslations';
import { GOOGLE_MAPS_API_KEY } from '../../Utils/config';

const GooglePlacesSearch = ({ userLocation, onFocused, backgroundPress, onSelectPlace }) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef(null);

  // 📝 검색어 입력 시 자동완성 + 위치 가져오기
  useEffect(() => {
    if (query.length > 1) {
      setLoading(true);
      fetch(
        userLocation ?
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_MAPS_API_KEY}&language=ko&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`
          : `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_MAPS_API_KEY}&language=ko`
      )
        .then((res) => res.json())
        .then(async (data) => {
          console.log('🔍 검색 결과:', data);

          // place_id를 이용해 위도/경도를 가져오는 추가 요청
          const enrichedPlaces = await Promise.all(
            data.predictions.slice(0, 10).map(async (item) => {
              const details = await fetchPlaceLocation(item.place_id);
              return { ...item, details };
            })
          );

          setPlaces(enrichedPlaces);
          setLoading(false);
        })
        .catch((err) => {
          console.error('❌ 검색 오류:', err);
          setLoading(false);
        });
    } else {
      setPlaces([]);
    }
  }, [query]);
  
  const fetchPlaceLocation = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=ko&key=${GOOGLE_MAPS_API_KEY}&fields=name,geometry,formatted_address,types,photos,editorial_summary`
      );
      const data = await response.json();
      console.log('🔍 상세 검색 결과:', data);
      return data.result;
    } catch (error) {
      console.error('❌ 장소 세부정보 가져오기 실패:', error);
      return null;
    }
  };

  const distanceToText = (data) => {
    if (!userLocation || !data?.details?.geometry?.location) { return ''; }
    const distance = haversine(userLocation, { latitude: data.details.geometry.location.lat, longitude: data.details.geometry.location.lng }).toFixed(1);
    return distance < 1000 ? `${distance}km` : '';

    // distanceText = filterPlaceDistance.length!=0 ? ` • ${filterPlaceDistance.distance} km` : "";
  };

  const getTranslatedType = (types) => {
    if (!types || types.length === 0) { return ' • 기타'; }

    for (let type of types) {
      if (typeTranslations[type]) {
        return ` • ${typeTranslations[type]}`; // 가장 먼저 일치하는 한글 타입 반환
      }
    }

    return ' • 기타'; // 매칭되는 값이 없으면 "기타" 반환
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          placeholder="장소를 검색해보세요!"
          value={query}
          onChangeText={(text) => setQuery(text)}
          style={styles.searchInput}
          onFocus={() => {
            console.log('onFocus 실행됨');
            setSearchFocused(true);
            onFocused(true);
          }}
          onBlur={() => {
            console.log('onBlur 실행됨');
            setSearchFocused(false);
            onFocused(false);
            Keyboard.dismiss();
          }}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => searchFocused ? inputRef.current.blur() : inputRef.current.focus()}
          pointerEvents={searchFocused ? 'auto' : 'none'} >
          <Ionicons name={searchFocused ? 'arrow-back' : 'location-sharp'} size={20} color="#3E8EDE" />
        </TouchableOpacity>

        {query.length > 0 && searchFocused && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {searchFocused &&
        <View style={{ flex: 1 }}>
          <FlatList data={places}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            style={styles.searchList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.placeButton} onPress={() => {
                if (!item.details) {
                  console.warn("🚨 장소 정보를 찾을 수 없음:", item.place_id);
                  Alert.alert("위치 정보 없음", "해당 장소의 정보를 찾을 수 없습니다.\n주소로 입렵해보세요.");
                  return null;
                }
                onSelectPlace(item);
                inputRef.current?.blur();
                setSearchFocused(false);
              }}>
                <View style={styles.placeViewIconContainer}>
                  <View style={styles.placeViewIcon}>
                    <Ionicons name="location" size={20} color="#DADADA" />
                  </View>
                  <Text style={styles.placeViewIconText}>
                    {distanceToText(item)}
                  </Text>
                </View>
                <View style={styles.placeViewTextContainer}>
                  <Text style={styles.placeTitle}>{item.structured_formatting.main_text}<Text style={styles.placeIndustry}>{getTranslatedType(item.types)}</Text></Text>
                  <Text style={styles.placeSubtitle}>{item.structured_formatting.secondary_text}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3E8EDE" />
            </View>
          )}
        </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  placeButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  placeViewIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  placeViewIcon: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeViewIconText: {
    fontSize: 9,
    color: 'gray',
  },
  placeViewTextContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flex: 1,
    paddingRight: 10,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  placeIndustry: {
    fontSize: 10,
    color: '#777',
  },
  placeSubtitle: {
    fontSize: 12,
    color: '#777',
    textBreakStrategy: 'simple',
  },
  inputContainer: {
    position: 'relative', // 내부 요소를 절대 위치로 배치할 수 있도록 설정
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 40, // 왼쪽 아이콘 여백 고려
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  clearButton: {
    position: 'absolute',
    right: 10, // 오른쪽 끝 정렬
    top: 22.5,
    transform: [{ translateY: -10 }], // 버튼을 정확히 중앙 정렬
  },
  backButton: {
    position: 'absolute',
    left: 10, // 오른쪽 끝 정렬
    top: 22.5,
    transform: [{ translateY: -10 }], // 버튼을 정확히 중앙 정렬
  },
  searchList: {
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000', // iOS 스타일의 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Android 그림자
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // 🔹 전체 화면 덮기
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 🔹 투명한 배경
  },
});

export default GooglePlacesSearch;
