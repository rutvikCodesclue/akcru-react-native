import React, {useRef, useCallback, useState} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';

type NavProp = StackNavigationProp<NoBottomTabStackParams, 'StripeWebCheckout'>;

export default function StripeWebCheckout() {
    const webViewRef = useRef<WebView>(null);
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const {checkoutUrl} = route.params as {checkoutUrl: string};

    const [loading, setLoading] = useState(true);

    const handleNavChange = useCallback(
        (navState: WebViewNavigation) => {
            const {url} = navState;

            if (url.startsWith('http://10.0.2.2:3000/ad-purchase/success')) {
                const sessionId = new URL(url).searchParams.get('session_id');
                if (sessionId) {
                    navigation.replace('AdPurchaseSuccessScreen', {session_id: sessionId});
                }
                return false;
            }

            if (url.startsWith('http://10.0.2.2:3000/ad-purchase/cancel')) {
                navigation.goBack();
                return false;
            }

            return true;
        },
        [navigation],
    );

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" />
                </View>
            )}
            <WebView
                ref={webViewRef}
                source={{uri: checkoutUrl}}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={handleNavChange}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1,
    },
});
