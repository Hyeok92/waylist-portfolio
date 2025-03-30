#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

#import <GoogleMaps/GoogleMaps.h>
#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"구글맵키"];
  self.moduleName = @"SchedulerWithSpace";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = (id<UNUserNotificationCenterDelegate>)self; // 🔹 강제 캐스팅 추가 // 🔹 UNUserNotificationCenterDelegate 설정
  
  [super application:application didFinishLaunchingWithOptions:launchOptions];
  [RNSplashScreen show];
  return YES;
}

// 🔹 iOS에서 받은 푸시 알림을 React Native로 전달하는 코드 추가
- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
       willPresentNotification:(UNNotification *)notification 
       withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler 
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:notification.request.content.userInfo];
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound);
}

// 🔹 사용자가 알림을 클릭했을 때 호출되는 메서드
- (void)userNotificationCenter:(UNUserNotificationCenter *)center 
       didReceiveNotificationResponse:(UNNotificationResponse *)response 
       withCompletionHandler:(void (^)(void))completionHandler 
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}

// 🔹 iOS 10 이상에서 알림을 등록하는 메서드
- (void)application:(UIApplication *)application 
       didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings 
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}

// 🔹 APNs 토큰 등록 (FCM과 연결 시 필요)
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken 
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// 🔹 알림 수신 실패 처리
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error 
{
  NSLog(@"📌 Failed to register for remote notifications: %@", error);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
