import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Alert, Button, StyleSheet, Text, View, SafeAreaView, TouchableOpacity, } from 'react-native';
import { MemoContext } from '../../Provider/MemoContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MasonryList from 'reanimated-masonry-list';
import { Menu, Divider, IconButton } from 'react-native-paper';

const MemoScreen = ({
  navigation,
  route,
}) => {
  const { memoState, removeMemo } = useContext(MemoContext);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const sortedMemos = useMemo(() => {
    return [...memoState.memos].sort((a, b) =>
      new Date(b.modificationDate) - new Date(a.modificationDate)
    );
  }, [memoState.memos]);

  const moveToAddMemo = () => {
    navigation.navigate('AddMemo');
  };
  
  const moveToDetailMemo = (item) => {
    navigation.navigate('DetailMemo', {selectedMemo: item});
  };
  
  const moveToEditMemo = (item) => {
    setSelectedMenuId(null);
    navigation.navigate('AddMemo', {savedMemo: item});
  };
  
  const moveToLicenseScreen = () => {
    setSelectedMenuId(null);
    navigation.navigate('LicenseScreen');
  };

  const deleteMemo = (id) => {
    setSelectedMenuId(null);
    Alert.alert(
      '선택한 항목이 삭제됩니다.',
      '삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => removeMemo(id) },
      ]
    );
  };

  // render
  const renderItem = useCallback(({ item }) => {
    const isVisible = selectedMenuId === item.id;

    return (
      <View>
        <TouchableOpacity style={styles.memoContainer} onPress={() => moveToDetailMemo(item)}>
          <View style={styles.titleContainer}>
            <Text numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.titleText} >
              {item.memo.match(/^[^\n]+/)?.[0] || ""}
            </Text>
            <View style={styles.menuContainer}>
              <Menu
                visible={isVisible}
                onDismiss={() => setSelectedMenuId(null)}
                anchor={<IconButton icon="dots-vertical" size={20} onPress={() => setSelectedMenuId(item.id)} iconColor='#3E8EDE' />}
                contentStyle={styles.popupMenu} >
                <Menu.Item onPress={() => moveToEditMemo(item)} title="편집" leadingIcon="pencil" />
                <Divider />
                <Menu.Item onPress={() => deleteMemo(item.id)} title="삭제" leadingIcon="delete" titleStyle={{ color: 'red' }} />
              </Menu>
            </View>
          </View>
          <Text numberOfLines={15}
            ellipsizeMode="tail"
            style={styles.memoText}>
            {item.memo}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [selectedMenuId]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View />
        <TouchableOpacity style={styles.headerLeftButton} onPress={() => moveToLicenseScreen()}>
          <FontAwesome name="drivers-license-o" size={25} color="#3E8EDE" />
        </TouchableOpacity>
        <Text style={styles.headerText}>메모</Text>
        <TouchableOpacity style={styles.headerRightButton} onPress={() => moveToAddMemo()}>
          <Ionicons name="add-circle-outline" size={25} color="#3E8EDE" />
        </TouchableOpacity>
      </View>
      {sortedMemos.length > 0
        ? <MasonryList
          data={sortedMemos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // 화면을 반반 나누는 2열 그리드
          renderItem={renderItem}
        />
        : <View style={styles.noMemoContainer}>
          <MaterialCommunityIcons name="note-off-outline" size={35} color='gray' />
          <Text style={styles.noMemoText}>새로운 메모가 없습니다.</Text>
        </View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  noMemoText: {
    fontSize: 15,
    color: 'gray',
    paddingTop: 20,
  },
  headerContainer: {
    height: 50,
    width: '100%',
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerRightButton: {
    position: "absolute",
    right: 10, // 오른쪽 끝 정렬
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  headerLeftButton: {
    position: "absolute",
    left: 10, // 오른쪽 끝 정렬
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noMemoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15, // 모서리 둥글게
    padding: 15,
    margin: 5,
    elevation: 3, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 100,
  },
  memoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    minHeight: 100,
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  titleText: {
    flex: 1,
    marginRight: 10,
    fontSize: 18,
    fontWeight: 'bold'
  },
  menuContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MemoScreen;