import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {COLORS, FONTS} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';
import Svg, {Path, Polygon} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import imageindex from '../../../../assets/images/imageindex';
import {navigate} from '../../../util/RootNavigation';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import AkcruButtons from '../../../components/akcruButtons';

type Props = NativeStackScreenProps<UserProfileStackParams, 'UserMatchModesScreen'>;

const HEX_PATH = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
const HEX_POINTS_ROTATED = '135,0 270,58.5 270,175.5 135,234 0,175.5 0,58.5';

const floatingDots = [
    {top: '9%', left: '10%'},
    {top: '17%', right: '12%'},
    {top: '42%', left: '7%'},
    {top: '50%', right: '10%'},
    {top: '75%', left: '15%'},
    {top: '84%', right: '12%'},
] as const;

const orbitSources = [
    imageindex.Action,
    imageindex.Adventure,
    imageindex.Animation,
    imageindex.Comedy,
    imageindex.Crime,
    imageindex.Drama,
    imageindex.Family,
    imageindex.Thriller,
];

function HexMaskedImage({source, size}: {source: any; size: number}) {
    return (
        <MaskedView
            style={{width: size, height: size}}
            maskElement={
                <Svg height={size} width={size} viewBox="0 0 270 234">
                    <Path d={HEX_PATH} fill="black" transform="rotate(90 135 117)" />
                </Svg>
            }>
            <Image source={source} style={{width: size, height: size}} resizeMode="cover" />
        </MaskedView>
    );
}

function HexCluster({centerImage, clusterWidth}: {centerImage: any; clusterWidth: number}) {
    const ringW = clusterWidth;
    const ringH = (ringW * 234) / 270;
    const centerSize = ringW * 0.58;
    const miniSize = ringW * 0.14;

    const responsiveOrbitPositions = [
        {top: -miniSize * 0.18, left: ringW * 0.5 - miniSize * 0.5},
        {top: ringH * 0.39, right: -miniSize * 0.5},
        {bottom: -miniSize * 0.18, left: ringW * 0.5 - miniSize * 0.5},
        {top: ringH * 0.39, left: -miniSize * 0.5},
    ];

    return (
        <View style={[styles.clusterWrap, {width: ringW, height: ringH}]}>
            <Svg width={ringW} height={ringH} viewBox="0 0 270 234" style={StyleSheet.absoluteFillObject}>
                <Polygon
                    points={HEX_POINTS_ROTATED}
                    fill="none"
                    stroke="rgba(240, 225, 255, 0.72)"
                    strokeWidth={2}
                    strokeDasharray="8 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>

            <View style={styles.centerHex}>
                <HexMaskedImage source={centerImage} size={centerSize} />
            </View>

            {responsiveOrbitPositions.map((pos, idx) => (
                <View key={idx} style={[styles.orbitHex, pos]}>
                    <HexMaskedImage source={orbitSources[idx % orbitSources.length]} size={miniSize} />
                </View>
            ))}
        </View>
    );
}

function ModeCard({
    title,
    subtitle,
    centerImage,
    clusterWidth,
    onPress,
}: {
    title: string;
    subtitle: string;
    centerImage: any;
    clusterWidth: number;
    onPress: () => void;
}) {
    return (
        <View style={[styles.cardWrap, {width: clusterWidth + 24}]}>
            <View style={styles.cardContainer}>
                <HexCluster centerImage={centerImage} clusterWidth={clusterWidth} />

                <View style={{paddingTop: 10}}>
                    <AkcruButtons.LrgButton
                        variant="auth"
                        color={COLORS.PURPLE}
                        btnname={title}
                        onPress={onPress}
                        disabled={false}
                    />
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

export default function UserMatchModesScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation as any);

    const {width, height} = useWindowDimensions();
    const maxByHeight = height * 0.26;
    const clusterWidth = Math.min(Math.max(width * 0.74, 220), isTablet() ? 360 : 320, maxByHeight);
    const openFindMyMatch = () => {
        navigation.popToTop();
        navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'FlickFlirtScreen'},
        });
    };

    const openJustAVibe = () => {
        navigation.popToTop();
        navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'CrummunityStack'},
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#04103D', '#1C1666', '#0B2A7A', '#1B0E4E']} style={styles.container}>
                {floatingDots.map((dot, i) => (
                    <View key={i} style={[styles.dot, dot]} />
                ))}

                <View style={styles.body}>
                    <View style={styles.sectionBlock}>
                        <ModeCard
                            title="Find My Match"
                            subtitle="Connect Through Film"
                            centerImage={imageindex.Trinity}
                            clusterWidth={clusterWidth}
                            onPress={openFindMyMatch}
                        />
                    </View>
                    <View style={styles.sectionBlock}>
                        <ModeCard
                            title="Just A Vibe"
                            subtitle="Watch. Explore. Join The Crummunity"
                            centerImage={imageindex.EatingPopcorn}
                            clusterWidth={clusterWidth}
                            onPress={openJustAVibe}
                        />
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#04103D',
    },
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 12,
    },
    sectionBlock: {
        width: '100%',
        alignItems: 'center',
    },
    cardWrap: {
        alignItems: 'center',
        marginBottom: 18,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
        borderRadius: 18,
    },
    clusterWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerHex: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbitHex: {
        position: 'absolute',
    },
    subtitle: {
        marginTop: 10,
        ...FONTS.paragraph1,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
    dot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(194,134,255,0.7)',
    },
});
