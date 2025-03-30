import BackgroundFetch from "react-native-background-fetch";
import Geolocation from "react-native-geolocation-service";
import { useContext, useEffect, useState, useRef } from "react";
import { SpaceContext } from "../Provider/SpaceContext";
import PushNotification from "react-native-push-notification";
import { PermissionsAndroid, Platform } from "react-native";
import haversine from "haversine"; // ✅ Haversine 라이브러리 사용
import AsyncStorage from "@react-native-async-storage/async-storage";

const geofenceNotification = () => {
  const { spaceState, updateSpace } = useContext(SpaceContext);
  const wasInsideRef = useRef({}); // ✅ 최신 wasInside 상태 저장

  useEffect(() => {
    // 앱 실행 시 저장된 데이터를 불러오기
    const loadWasInside = async () => {
      const storedData = await AsyncStorage.getItem("wasInside");
      if (storedData) {
        wasInsideRef.current = (JSON.parse(storedData));
      }
    };

    loadWasInside();
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };


    // const initBackgroundServices = async () => {
    //   const hasPermission = await requestLocationPermission();
    //   if (!hasPermission) {
    //     console.log("❌ 위치 권한이 없으므로 백그라운드 서비스를 실행하지 않습니다.");
    //     return;
    //   }
    //   console.log("✅ 위치 권한이 허용됨, 백그라운드 서비스 시작");

    //   // ✅ BackgroundGeolocation 설정
    //   BackgroundGeolocation.onLocation((location) => {
    //     console.log("📍 백그라운드 위치 업데이트:", location);
    //     checkGeofence(location.coords.latitude, location.coords.longitude);
    //   });

    //   BackgroundGeolocation.onMotionChange((event) => {
    //     console.log("📡 움직임 감지:", event);
    //     if (event.isMoving) {
    //       BackgroundGeolocation.start(); // ✅ 움직이면 백그라운드 위치 추적 시작
    //     }
    //   });

    //   BackgroundGeolocation.ready({
    //     desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    //     distanceFilter: 50, // ✅ 50m 이동 시 위치 업데이트
    //     stopOnTerminate: false, // ✅ 앱 종료 후에도 동작
    //     startOnBoot: true, // ✅ 기기 부팅 후 자동 실행
    //   });

    //   BackgroundGeolocation.start(); // ✅ 백그라운드 위치 추적 시작


    //   // ✅ BackgroundFetch 설정 (앱 종료 후에도 실행)
    //   BackgroundFetch.registerHeadlessTask(async () => {
    //     console.log("⏳ [Headless Task] 실행됨");
    //     BackgroundGeolocation.getCurrentPosition((position) => {
    //       console.log("📍 Headless Task 위치:", position);
    //       checkGeofence(position.coords.latitude, position.coords.longitude);
    //     });
    //   });
      
    //   // ✅ BackgroundFetch 등록 (🚨 한 번만 실행)
    //   if (!BackgroundFetch.status || BackgroundFetch.status !== BackgroundFetch.STATUS_AVAILABLE) {
    //     console.log("⏳ BackgroundFetch 등록...");
    //     BackgroundFetch.configure(
    //       {
    //         minimumFetchInterval: 15, // 15분마다 실행
    //         stopOnTerminate: false,
    //         startOnBoot: true,
    //       },
    //       async () => {
    //         console.log("⏳ 백그라운드 위치 체크 실행");
    //         BackgroundGeolocation.getCurrentPosition((position) => {
    //           checkGeofence(position.coords.latitude, position.coords.longitude);
    //         });
    //         BackgroundFetch.finish();
    //       },
    //       (error) => {
    //         console.log("❌ 백그라운드 페치 등록 실패:", error);
    //       }
    //     );
    //   }

    //   // BackgroundFetch.start();

    //   // const checkGeofence = async () => {
    //   //   const hasPermission = await requestLocationPermission();
    //   //   if (!hasPermission) return;

    //   //   Geolocation.getCurrentPosition(
    //   //     (position) => {
    //   //       console.log("📍 현재 위치:", position.coords);

    //   //       spaceState?.spaces?.forEach((space) => {
    //   //         if(!space || space.notiMode === 'none') return;
    //   //         const start = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    //   //         const end = { latitude: space.lat, longitude: space.lng };

    //   //         const distance = haversine(start, end, { unit: "meter" }); // ✅ Haversine 사용하여 거리 계산

    //   //         if (distance <= space.radius) {
    //   //           PushNotification.localNotification({
    //   //             channelId: "space-channel",
    //   //             title: `📍 ${space.title} 도착!`,
    //   //             message: space.memo || "설정한 위치에 도착했습니다.",
    //   //             allowWhileIdle: true, // ✅ 절전 모드에서도 알림 동작
    //   //             ignoreInForeground: false, // ✅ 앱이 실행 중이어도 알림 표시
    //   //             playSound: true,
    //   //             soundName: "default", // ✅ 알림 소리 활성화
    //   //             vibrate: true,
    //   //             visibility: "public", // ✅ 잠금 화면에서도 알림 보이기
    //   //             priority: "high", // ✅ 알림 중요도 높게 설정
    //   //           });

    //   //           if (space.notiMode === "once") {
    //   //             const updatedSpace = { ...targetSpace, notiMode: "none" };
    //   //             updateSpace(updatedSpace);
    //   //           }
    //   //         }
    //   //       });
    //   //     },
    //   //     (error) => {
    //   //       console.error("⚠️ 위치 가져오기 실패:", error.message);
    //   //     },
    //   //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    //   //   );
    //   // };

    //   // BackgroundFetch.configure(
    //   //   {
    //   //     minimumFetchInterval: 15, // 15분마다 실행
    //   //     stopOnTerminate: false,
    //   //     startOnBoot: true,
    //   //   },
    //   //   async () => {
    //   //     console.log("⏳ 백그라운드 위치 체크 실행");
    //   //     await checkGeofence();
    //   //     BackgroundFetch.finish();
    //   //   },
    //   //   (error) => {
    //   //     console.log("❌ 백그라운드 페치 등록 실패:", error);
    //   //   }
    //   // );

    //   // ✅ 백그라운드 태스크 예약 (선택)
    //   BackgroundFetch.scheduleTask({
    //     taskId: "com.SchedulerWithSpace.backgroundtask",
    //     delay: 60000, // 60초 후 실행
    //     periodic: true,
    //     forceAlarmManager: true,
    //     stopOnTerminate: false,
    //     enableHeadless: true,
    //   });
    // };

    // initBackgroundServices();

    return () => {
      BackgroundFetch.stop();
      // BackgroundGeolocation.stop();
    };
  }, [spaceState]);

  // ✅ Geofence 체크 함수 (거리 계산)
  const checkGeofence = async (latitude, longitude) => {
    spaceState?.spaces?.forEach(async (space) => {
      if (!space || space.notiMode === "none") return;

      const start = { latitude, longitude };
      const end = { latitude: space.lat, longitude: space.lng };
      const distance = haversine(start, end, { unit: "meter" });

      const isInside = distance <= space.radius;
      const previouslyInside = wasInsideRef.current[space.id] || false;

      if (isInside && !previouslyInside) {
        // ✅ 처음 들어왔을 때 알림 울리기
        PushNotification.localNotification({
          channelId: "space-channel",
          title: `📍 ${space.title} 도착!`,
          message: space.memo || "설정한 위치에 도착했습니다.",
          allowWhileIdle: true,
          ignoreInForeground: false,
          playSound: true,
          soundName: "default",
          vibrate: true,
          visibility: "public",
          priority: "high",
        });

        if (space.notiMode === "once") {
          updateSpace({ ...space, notiMode: "none" });
        }
      }

      // ✅ 상태를 AsyncStorage에 저장
      const updatedWasInside = { ...wasInsideRef.current, [space.id]: isInside };
      wasInsideRef.current = updatedWasInside;
      await AsyncStorage.setItem("wasInside", JSON.stringify(updatedWasInside));
    });
  };

  return null;
};

export default geofenceNotification;