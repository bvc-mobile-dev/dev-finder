import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';

import { LatLng } from 'react-native-maps';

export async function tryGetCurrentPosition(): Promise<LatLng> {
    const { status } = await requestForegroundPermissionsAsync();

    if (status === 'granted') {
        const { coords } = await getCurrentPositionAsync();
        const { latitude, longitude } = coords;
        return { latitude, longitude };
    } else {
        throw Error('Permission has not been granted.');
    }
}
