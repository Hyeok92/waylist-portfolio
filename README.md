# WayList - 위치 기반 알림 앱

<p align="center">
  <img src="https://raw.githubusercontent.com/Hyeok92/waylist-portfolio/main/assets/images/Frame_798.png" width="150" height="auto" />
  <img src="https://raw.githubusercontent.com/Hyeok92/waylist-portfolio/main/assets/images/Frame_799.png" width="150" height="auto" />
  <img src="https://raw.githubusercontent.com/Hyeok92/waylist-portfolio/main/assets/images/Frame_800.png" width="150" height="auto" />
  <img src="https://raw.githubusercontent.com/Hyeok92/waylist-portfolio/main/assets/images/Frame_801.png" width="150" height="auto" />
  <img src="https://raw.githubusercontent.com/Hyeok92/waylist-portfolio/main/assets/images/Frame_802.png" width="150" height="auto" />
</p>

 <!-- 앱 대표 이미지 또는 스크린샷 배너 -->

WayList는 사용자가 저장한 위치에 도착했을 때 알림을 제공하는 위치 기반 개인 스케줄러 앱입니다.  
React Native로 개발되었으며, Android 및 iOS 모두 지원합니다.

<br/>

## ✅ 주요 기능

- 장소 검색 (Google Places API)
- 지도에서 위치 선택 및 저장
- 위치 기반 도착 알림
- 알림 거리 설정 (예: 100m, 500m 등)
- 저장한 장소에 대한 메모 기능
- 사이드 메뉴를 통한 장소 리스트 관리
- 백그라운드 위치 추적 및 도착 알림 유지
- Android, iOS 대응

<br/>

## 🧑‍💻 기술 스택

- **Frontend**: React Native, React Navigation, Bottom Sheet, React Native Maps, Context API
- **API**: Google Maps API (Places, Geocoding)
- **Notification**: react-native-push-notification (Android), iOS Notification
- **Storage**: AsyncStorage
- **Background Tracking**: react-native-background-geolocation (iOS 한정 무료 기능)

<br/>

## 📱 앱 다운로드

- [App Store에서 보기](https://apps.apple.com/app/6742695436) <!-- 실제 앱스토어 링크로 교체 -->

> 🚧 Android 버전은 심사 중입니다.

<br/>

## 🔒 민감 정보 관리

이 저장소에서는 API 키, `google-services.json`, `GoogleService-Info.plist` 등 민감 정보는 제외되어 있습니다.  
`config.js` 파일을 통해 API 키를 통합 관리하며, 해당 파일은 `.gitignore`에 포함되어 있습니다.

<br/>

## 📷 스크린샷

| 메인 화면 | 장소 저장 | 도착 알림 |
|-----------|-----------|------------|
| ![screenshot1](https://your-screenshot-url1) | ![screenshot2](https://your-screenshot-url2) | ![screenshot3](https://your-screenshot-url3) |
