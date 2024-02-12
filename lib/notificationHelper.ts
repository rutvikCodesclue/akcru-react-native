import notifee, {AndroidImportance} from '@notifee/react-native';

export async function displayLocalNotification(title: string, body: string) {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
        id: 'user-interactions',
        name: 'User Interactions',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title,
        body,
        android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
                id: 'default',
            },
        },
    });
}
