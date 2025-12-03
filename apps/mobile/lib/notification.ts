// import { Platform } from 'react-native';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';
// import type { Notification, NotificationResponse } from 'expo-notifications';

// // Android 알림 채널 설정
// const NOTIFICATION_CHANNEL_ID = 'push_notifications';
// const NOTIFICATION_CHANNEL_NAME = '푸시 알림';

// // 채널 정보 확인 함수 (디버깅용)
// export async function getNotificationChannelInfo() {
//   if (Platform.OS === 'android') {
//     return {
//       channelId: NOTIFICATION_CHANNEL_ID,
//       name: NOTIFICATION_CHANNEL_NAME,
//       importance: 'MAX',
//     };
//   }
//   return null;
// }

// function handleRegistrationError(errorMessage: string) {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// }

// export async function registerForPushNotificationsAsync() {
//   if (Platform.OS === 'android') {
//     Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
//       name: NOTIFICATION_CHANNEL_NAME,
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       handleRegistrationError('푸시 알림 권한을 허용해주세요.');
//       return;
//     }
//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError('푸시 알림 프로젝트 ID를 찾을 수 없습니다.');
//     }
//     try {
//       const pushTokenString = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//           ...(Platform.OS === 'ios' ? { type: 'apns' } : { type: 'fcm' }),
//         })
//       ).data;

//       console.log(pushTokenString);
//       return pushTokenString;
//     } catch (e: unknown) {
//       handleRegistrationError(`푸시 알림 등록 오류: ${e}`);
//     }
//   } else {
//     handleRegistrationError('시뮬레이터에서는 푸시 알림을 사용할 수 없습니다.');
//   }
// }

// /**
//  * 알림 리스너 설정
//  * @returns cleanup 함수
//  */
// export function setupNotificationListeners() {
//   // 알림 수신 리스너 (디버깅용)
//   const receivedSubscription = Notifications.addNotificationReceivedListener((notification: Notification) => {
//     console.log('📬 알림 수신:', notification);
//     if (Platform.OS === 'android') {
//       const androidData = notification.request.content.data?.android;
//       console.log('📱 알림 전체 데이터:', JSON.stringify(notification.request, null, 2));
//       if (androidData) {
//         console.log('📱 Android 데이터:', androidData);
//       }
//     }
//   });

//   // 알림 클릭 리스너
//   const responseSubscription = Notifications.addNotificationResponseReceivedListener(
//     (response: NotificationResponse) => {
//       console.log('👆 알림 클릭:', response);
//     }
//   );

//   // cleanup 함수 반환
//   return () => {
//     receivedSubscription.remove();
//     responseSubscription.remove();
//   };
// }
