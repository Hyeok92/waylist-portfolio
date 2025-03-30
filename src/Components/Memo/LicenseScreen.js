import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Ionicons from 'react-native-vector-icons/Ionicons';

const LicenseScreen = ({
  navigation,
  route,
}) => {
  const [licenses, setLicenses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../../../licenses.json")
      .then((data) => {
        setLicenses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("라이선스 데이터를 불러오는 중 오류 발생:", error);
        setLoading(false);
      });
  }, []);

  const back = () => {
    navigation.pop();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.indicatorStyle}>
        <ActivityIndicator size="large" color="#3E8EDE" style={styles.indicatorStyle} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerLeftButton} onPress={() => back()}>
          <Ionicons name="close" size={25} color={'#3E8EDE'} />
        </TouchableOpacity>
        <Text style={styles.header}>오픈소스 라이센스</Text>
      </View>
      <FlatList
        style={styles.container}
        data={licenses ? Object.keys(licenses) : []}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.licenseContainer}>
            <Text style={styles.title}>{item}</Text>
            <Text style={styles.license}>License: {licenses[item].licenses}</Text>
            <Text style={styles.text}>
              {licenses[item].repository?.substring(0, 300) || "라이선스 정보를 불러올 수 없습니다."}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: { flex: 1, backgroundColor: 'white' },
  container: { padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", },
  licenseContainer: { marginBottom: 20 },
  title: { fontSize: 15, fontWeight: "bold" },
  license: { fontSize: 12, color: "#666" },
  text: { fontSize: 10, color: "#888" },
  indicatorStyle: { justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'white' },
  headerContainer: {
    height: 50,
    width: '100%',
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerLeftButton: {
    position: "absolute",
    left: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
});

export default LicenseScreen;