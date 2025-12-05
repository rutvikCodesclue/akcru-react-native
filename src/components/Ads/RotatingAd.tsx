import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, Linking, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {IAd} from '../../../types'; // keep this import

interface Props {
    ads: IAd[];
    height: number; // should match your carousel height
    pause?: boolean; // pause when screen not focused or offscreen
    rotationMinMs?: number; // default 8000
    rotationMaxMs?: number; // default 10000
    onImpression?: (adId: string) => void;
    onClick?: (adId: string) => void;
    borderRadius?: number;
}

const RotatingAd: React.FC<Props> = ({
    ads,
    height,
    pause = false,
    rotationMinMs = 8000,
    rotationMaxMs = 10000,
    onImpression,
    onClick,
    borderRadius = 5,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [index, setIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const seenImpressions = useRef<Set<string>>(new Set());

    // allow image-only, do nothing on press if no target/route
    const playableAds = useMemo(() => (ads ?? []).filter(a => !!a?.imageUrl), [ads]);

    // ✅ guard for empty lists
    if (!playableAds.length) return null;

    const current = playableAds[index];

    useEffect(() => {
        if (!current) return;
        if (!seenImpressions.current.has(current.id)) {
            seenImpressions.current.add(current.id);
            onImpression?.(current.id);
        }
    }, [current, onImpression]);

    useEffect(() => {
        if (pause || playableAds.length <= 1) return;
        const nextDelay = Math.floor(Math.random() * (rotationMaxMs - rotationMinMs + 1)) + rotationMinMs;

        timerRef.current = setTimeout(() => {
            setIndex(prev => (prev + 1) % playableAds.length);
        }, nextDelay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [pause, index, playableAds.length, rotationMinMs, rotationMaxMs]);

    const handlePress = async () => {
        if (!current) return;

        // track click in backend
        onClick?.(current.id);

        // INTERNAL route
        if (current.clickType === 'INTERNAL' && current.routeName) {
            // @ts-ignore: routeParams can be generic
            navigation.navigate(current.routeName as any, current.routeParams ?? {});
            return;
        }

        // EXTERNAL url
        if (current.clickType === 'EXTERNAL') {
            const raw = current.targetUrl ?? '';
            const url = raw.trim();

            console.log('Ad click – raw targetUrl:', raw, 'trimmed:', url);

            if (!url) {
                console.log('No URL set for this EXTERNAL ad, nothing to open.');
                return;
            }

            try {
                const supported = await Linking.canOpenURL(url);
                console.log('canOpenURL ->', supported);

                if (supported) {
                    await Linking.openURL(url);
                } else {
                    // fallback: try anyway and log error if it fails
                    console.log('canOpenURL returned false, trying openURL directly');
                    await Linking.openURL(url);
                }
            } catch (e) {
                console.log('Linking.openURL failed:', e);
            }
        }
    };


    return (
        <Pressable onPress={handlePress} style={{width: '100%', height}}>
            <View style={{width: '100%', height: '100%', overflow: 'hidden', borderRadius}}>
                <Image source={{uri: current.imageUrl}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
            </View>
        </Pressable>
    );
};

export default RotatingAd;
