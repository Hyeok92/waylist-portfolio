import { useContext, useEffect, useRef, } from "react";
import BackgroundGeolocation from "react-native-background-geolocation";
import PushNotification from "react-native-push-notification";
import { SpaceContext } from "../Provider/SpaceContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "notifiedSpaces";

const useGeofenceAlerts = () => {
  const { spaceState, updateSpace } = useContext(SpaceContext);
  const notifiedSpacesRef = useRef(new Set());

  // ✅ 앱이 시작될 때 저장된 알림 기록 불러오기
  useEffect(() => {
    const loadNotifiedSpaces = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          notifiedSpacesRef.current = new Set(JSON.parse(storedData));
          console.log('Is notified? : ', notifiedSpacesRef.current);
        }
      } catch (error) {
        console.error("Failed to load notifiedSpaces:", error);
      }
    };
    loadNotifiedSpaces();
  }, []);

  useEffect(() => {
    // ✅ 현재 spaceState의 ID 목록 가져오기
    const currentSpaceIds = new Set(spaceState.spaces.map((space) => space.id));

    // ✅ notifiedSpacesRef.current에서 현재 존재하지 않는 ID 삭제
    notifiedSpacesRef.current.forEach((_, id) => {
      if (!currentSpaceIds.has(id)) {
        notifiedSpacesRef.current.delete(id);
        console.log(`🗑️ notifiedSpacesRef에서 제거: ${id}`);
      }
    });

    // ✅ AsyncStorage 업데이트
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...notifiedSpacesRef.current]));

    console.log('geo event 실행준비');

    BackgroundGeolocation.removeListeners();

    BackgroundGeolocation.ready({
      persistMode: BackgroundGeolocation.PERSIST_MODE_GEOFENCE, // ✅ 지오펜스 유지
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50, // 50m 이동 시 감지
      stopOnTerminate: false, // 앱 종료 후에도 백그라운드에서 실행 유지
      startOnBoot: true, // 기기 재부팅 후에도 실행
      enableHeadless: true, // 앱이 종료된 상태에서도 백그라운드 실행 허용
      allowIdenticalLocations: false, // 동일한 위치 중복 감지 방지
    }, (state) => {
      if (!state.enabled) {
        BackgroundGeolocation.start(); // ✅ 앱이 종료되어도 계속 실행되도록 설정
      }
    });

    BackgroundGeolocation.getGeofences().then(geofences => {
      const currentGeofenceIds = spaceState.spaces.map((space) => space.id.toString());
      console.log('등록된 지오펜스 : ', geofences);

      // 1️⃣ ✅ 기존에 있던 지오펜스가 삭제되었는지 확인하고 제거
      geofences.forEach((geofence) => {
        if (!currentGeofenceIds.includes(geofence.identifier)) {
          BackgroundGeolocation.removeGeofence(geofence.identifier, () => {
            console.log(`❌ 지오펜스 삭제: ${geofence.identifier}`);
          });
        }
      });

      BackgroundGeolocation.getGeofences().then(geo => { console.log('삭제 후 지오펜스 : ', geo) })
      spaceState.spaces.forEach((space) => {
        if (space.notiMode === 'none') return;

        const existingGeofence = geofences.find((g) => g.identifier === space.id.toString());

        if (!existingGeofence) {
          BackgroundGeolocation.addGeofence({
            identifier: space.id.toString(),
            radius: space.radius,
            latitude: space.lat,
            longitude: space.lng,
            notifyOnEntry: true,
            notifyOnExit: true,
          });
          console.log(`🆕 새 지오펜스 등록: ${space.title}`);
        } else if (
          existingGeofence.radius !== space.radius ||
          existingGeofence.latitude !== space.lat ||
          existingGeofence.longitude !== space.lng
        ) {
          // ✅ 기존 지오펜스 업데이트 (삭제 후 추가)
          BackgroundGeolocation.removeGeofence(space.id.toString(), () => {
            BackgroundGeolocation.addGeofence({
              identifier: space.id.toString(),
              radius: space.radius,
              latitude: space.lat,
              longitude: space.lng,
              notifyOnEntry: true,
              notifyOnExit: true,
            });
            console.log(`🔄 지오펜스 업데이트: ${space.title}`);
          });
          notifiedSpacesRef.current.delete(space.id);
        }
      })
    });

    // BackgroundGeolocation.onGeofence((event) => {
    //   const targetSpace = spaceState.spaces.find((s) => s.id.toString() === event.identifier);
    //   if (!targetSpace || targetSpace.notiMode === "none") return;

    //   PushNotification.localNotification({
    //     channelId: "space-channel",
    //     title: `📍 ${targetSpace.title} 접근!`,
    //     message: targetSpace.memo || "설정한 위치에 도착했습니다.",
    //     allowWhileIdle: true, // ✅ 절전 모드에서도 알림 동작
    //     ignoreInForeground: false, // ✅ 앱이 실행 중이어도 알림 표시
    //     playSound: true,
    //     soundName: "default", // ✅ 알림 소리 활성화
    //     vibrate: true,
    //     visibility: "public", // ✅ 잠금 화면에서도 알림 보이기
    //     priority: "high", // ✅ 알림 중요도 높게 설정
    //   });

    //   if (targetSpace.notiMode === "once") {
    //     updateSpace({ ...targetSpace, notiMode: "none" });
    //   }
    // });

    // ✅ 지오펜스 이벤트 리스너 등록
    const onGeofenceEvent = async (event) => {
      const targetSpace = spaceState.spaces.find(s => s.id.toString() === event.identifier);
      if (!targetSpace || targetSpace.notiMode === "none") return;

      if (event.action === "ENTER") {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        const notifiedSet = storedData ? new Set(JSON.parse(storedData)) : new Set();

        if (notifiedSet.has(targetSpace.id)) return; // ✅ 중복 방지

        PushNotification.localNotification({
          channelId: "space-channel",
          title: `📍 ${targetSpace.title} 접근!`,
          message: targetSpace.memo || "설정한 위치에 도착했습니다.",
          allowWhileIdle: true, // ✅ 절전 모드에서도 알림 동작
          ignoreInForeground: false, // ✅ 앱이 실행 중이어도 알림 표시
          playSound: true,
          soundName: "default", // ✅ 알림 소리 활성화
          vibrate: true,
          visibility: "public", // ✅ 잠금 화면에서도 알림 보이기
          priority: "high", // ✅ 알림 중요도 높게 설정
        });

        if (targetSpace.notiMode === "once") {
          updateSpace({ ...targetSpace, notiMode: "none" });
          BackgroundGeolocation.removeGeofence(targetSpace.id.toString());
        } else {
          // ✅ 알림 기록 업데이트 (AsyncStorage에 저장)
          notifiedSpacesRef.current.add(targetSpace.id);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...notifiedSpacesRef.current]));
        }
      } else if (event.action === "EXIT") {
        // 🚀 사용자가 영역을 나가면 기록 삭제
        notifiedSpacesRef.current.delete(targetSpace.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...notifiedSpacesRef.current]));
      }
    };
    BackgroundGeolocation.onGeofence(onGeofenceEvent);

  }, [spaceState]);

  return null;
};

export default useGeofenceAlerts;
