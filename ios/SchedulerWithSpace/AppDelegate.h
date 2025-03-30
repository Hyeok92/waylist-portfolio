#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h> // 🔹 알림 관련 헤더 추가

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate> // 🔹 UNUserNotificationCenterDelegate 추가

@end
