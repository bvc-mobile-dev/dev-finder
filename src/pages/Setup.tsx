import * as api from '../services/api';

import MapView, { LatLng, MapPressEvent, Marker, Region } from 'react-native-maps';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';

import { AuthenticationContext } from '../context/AuthenticationContext';
import BigButton from '../components/BigButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

export default function Setup({ navigation }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const [username, setUsername] = useState('');
    const [usernameIsInvalid, setUsernameIsInvalid] = useState<boolean>(false);

    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string>();

    const defaultLocation = { latitude: 51.03, longitude: -114.093 };

    const [markerLocation, setMarkerLocation] = useState<LatLng>();
    const [currentRegion, setCurrentRegion] = useState<Region>({
        ...defaultLocation,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
    });

    // useEffect(() => {
    //     getFromCache('userInfo').then(
    //         (cachedUserInfo) => authenticationContext?.setValue(cachedUserInfo as User),
    //         (error: any) => console.log(error)
    //     );

    //     if (authError)
    //         Alert.alert('Authentication Error', authError, [{ text: 'Ok', onPress: () => setAuthError(undefined) }]);
    // }, [authError]);

    // useEffect(() => {
    //     if (authenticationContext?.value) navigation.navigate('Main');
    // }, []);

    useEffect(() => {
        loadInitialPosition();
    }, []);

    async function loadInitialPosition() {
        const { status } = await requestForegroundPermissionsAsync();

        if (status === 'granted') {
            const { coords } = await getCurrentPositionAsync();
            setMarkerLocation(coords);
            setCurrentRegion({ ...currentRegion, ...coords });
        }
    }

    const handleMapPress = (event: MapPressEvent) => {
        setMarkerLocation(event.nativeEvent.coordinate);
    };

    const handleAuthentication = () => {
        setIsAuthenticating(true);
        api.getUserInfo(username)
            .then((response) => {
                // setInCache('currentUser', response.data.user);
                // authenticationContext?.setValue(response.data.user);
                // setIsAuthenticating(false);
                // navigation.navigate('EventsMap');

                setIsAuthenticating(false);
                navigation.replace('Main');
            })
            .catch((error) => {
                if (error.response) {
                    setAuthError(error.response.data);
                } else {
                    setAuthError('Something went wrong.');
                }
                setIsAuthenticating(false);
            });
    };

    return (
        <>
            <StatusBar style="dark" />
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={{
                    padding: 24,
                    flexGrow: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'stretch',
                }}
            >
                <MapView
                    onPress={handleMapPress}
                    region={currentRegion}
                    style={styles.map}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    provider="google"
                    mapPadding={{ top: 64, right: 24, bottom: 128, left: 24 }}
                >
                    {markerLocation && <Marker coordinate={markerLocation} />}
                </MapView>
                <TextInput
                    style={[styles.input, usernameIsInvalid && { borderColor: 'red' }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Insert your github username..."
                    onChangeText={(value) => setUsername(value)}
                    onEndEditing={() => {
                        // TODO setUsernameIsInvalid
                    }}
                />
                <BigButton onPress={handleAuthentication} label="Next" color="#031A62" />
                <Spinner
                    visible={isAuthenticating}
                    textContent={'Authenticating...'}
                    overlayColor="#031A62BF"
                    textStyle={styles.spinnerText}
                />
            </KeyboardAwareScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    spinnerText: {
        fontSize: 16,
        color: '#fff',
    },

    input: {
        backgroundColor: '#fff',
        borderColor: '#031b6233',
        borderRadius: 4,
        borderWidth: 1,
        height: 56,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 16,
        color: '#333',
        fontSize: 16,
    },

    error: {
        color: '#fff',
        fontSize: 12,
    },
});
