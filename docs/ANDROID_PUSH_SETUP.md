# Android push notification setup

The Profile switch schedules the 7 pm study reminder locally. Forum reply alerts also need a Firebase Android app, an FCM V1 sending credential in EAS, and a newly installed native build. The Firebase and EAS credentials are separate JSON files.

Current Firebase project: `ucatgenius-70e35`. Its Android app is registered as `com.qhz123.ucatgeniusai`. The `GOOGLE_SERVICES_JSON` file variable is configured for the EAS `production`, `preview`, and `development` environments. EAS has an FCM V1 key for the dedicated `expo-push-sender` service account, which has the Firebase Cloud Messaging API Admin role. The FCM API is enabled. Use the steps below when replacing or rotating these credentials.

## 1. Register the Android app in Firebase

1. Open [Firebase Console](https://console.firebase.google.com/) and create or select the project that will send this app's notifications.
2. In **Project settings > General > Your apps**, add an **Android** app with package name **`com.qhz123.ucatgeniusai`**. The package name must match exactly.
3. Download that app's **`google-services.json`**. This is the Android app config file, not the private service account key.
4. For local builds, put it at the repository root as `google-services.json`. This path is git ignored. For EAS cloud builds, upload it as a **file** environment variable named `GOOGLE_SERVICES_JSON` for every environment used to build Android (at least `production`, plus `preview`/`development` if used). Use [EAS environment variables](https://docs.expo.dev/eas/environment-variables/manage/) or the EAS project dashboard. `app.config.js` reads this variable and configures `android.googleServicesFile`. A production Android EAS worker will stop the build with a clear error if the file is absent.

## 2. Configure FCM V1 sending in EAS

1. In Firebase **Project settings > Service accounts**, generate a new private key JSON for the service account used for FCM, following the [Expo FCM V1 guide](https://docs.expo.dev/push-notifications/fcm-credentials/). Keep this key out of the repository and do not paste it into chat.
2. Run `eas credentials -p android` from this project. Select the `production` profile, **Google Service Account**, **Manage your Google Service Account Key for Push Notifications (FCM V1)**, then **Set up a Google Service Account Key** and upload the private key JSON. This credential belongs to the same Firebase project as `google-services.json`.
3. Reopen `eas credentials -p android` to confirm an FCM V1 key is assigned. The Android app config file in step 1 does not replace this sending credential.

## 3. Build and test

1. Run `eas build -p android --profile preview` for an internal test (after setting `GOOGLE_SERVICES_JSON` in the `preview` environment), or `eas build -p android --profile production` for release. Install that **new** build on a physical Android device. An existing APK cannot gain Firebase initialization from a JavaScript update.
2. Sign in, turn on **Notifications** in Profile, and allow the Android notification permission. The 7 pm reminders should be scheduled locally. Check that the user's `notification_devices` row appears in Supabase; it should hold an `ExpoPushToken[...]` token after registration.
3. Reply to a different user's forum post and check that the author receives an alert. A user does not receive an alert for their own reply. If the token is present but delivery fails, check the `send-forum-reply-notification` Edge Function logs and the [Expo push receipts](https://docs.expo.dev/push-notifications/sending-notifications/). `MismatchSenderId` indicates that the Firebase project in the Android config and the FCM sending credential differ.
4. Turn the Profile switch off and verify that the device token is removed and the 7 pm reminders are cancelled. Android system notification settings can also block all delivery regardless of the in-app switch.

The iOS push key is already assigned in this EAS project. iOS builds do not use `google-services.json`.
