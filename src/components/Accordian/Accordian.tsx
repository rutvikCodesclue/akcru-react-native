import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {helpData} from '../../../assets/constants/helpData';
import {COLORS, FONTS} from '../../../assets/constants';
import Chevron from './Chevron';
import Animated, {
    Extrapolation,
    interpolate,
    measure,
    runOnUI,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type Props = {
    value: helpData;
};

const Accordian = ({value}: Props) => {
    const listRef = useAnimatedRef<Animated.View>();
    const heightValue = useSharedValue(0);
    const open = useSharedValue(false);
    const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)));
    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: interpolate(progress.value, [0, 1], [0, heightValue.value], Extrapolation.CLAMP),
    }));
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.titlecontainer}
                onPress={() => {
                    if (heightValue.value === 0 && listRef.current !== null) {
                        runOnUI(() => {
                            'worklet';
                            heightValue.value = measure(listRef!).height;
                        })();
                    }
                    open.value = !open.value;
                }}>
                <Text style={styles.faqtitle}>{value.faqsTitle}</Text>
                <Chevron progress={progress} />
            </Pressable>
            <Animated.View style={heightAnimationStyle}>
                <Animated.View ref={listRef} style={styles.contentContainer}>
                    {value.faqs.map((v, i) => {
                        return (
                            <View key={i} style={styles.paragraphcontainer}>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>{v.question}</Text>
                                <Text style={{...FONTS.paragraph1}}>{v.answer}</Text>
                            </View>
                        );
                    })}
                </Animated.View>
            </Animated.View>
        </View>
    );
};

export default Accordian;

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.BLACK,
        marginHorizontal: '4%',
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    contentContainer: {
        position: 'absolute',
        width: '100%',
        top: 0,
    },
    faqtitle: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
    },
    titlecontainer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paragraphcontainer: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
