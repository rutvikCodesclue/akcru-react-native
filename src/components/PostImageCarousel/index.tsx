import React, {useCallback, useMemo, useState} from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageStyle,
    ViewStyle,
    StyleProp,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import {COLORS} from '../../../assets/constants';

type PostImageCarouselProps = {
    imageUrls: string[];
    onImagePress: (url: string) => void;
    imageStyle?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
};

const PostImageCarousel = ({imageUrls, onImagePress, imageStyle, containerStyle}: PostImageCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [layoutWidth, setLayoutWidth] = useState(0);

    const flattenedImageStyle = useMemo(() => StyleSheet.flatten(imageStyle) ?? {}, [imageStyle]);
    const aspectRatio =
        typeof flattenedImageStyle.aspectRatio === 'number' && flattenedImageStyle.aspectRatio > 0
            ? flattenedImageStyle.aspectRatio
            : 4 / 5;
    const pagerHeight = layoutWidth > 0 ? layoutWidth / aspectRatio : undefined;

    const onPageSelected = useCallback((event: {nativeEvent: {position: number}}) => {
        setActiveIndex(event.nativeEvent.position);
    }, []);

    if (imageUrls.length === 0) {
        return null;
    }

    if (imageUrls.length === 1) {
        return (
            <View style={containerStyle}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(imageUrls[0])}>
                    <Image source={{uri: imageUrls[0]}} style={imageStyle} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View
            style={containerStyle}
            onLayout={event => {
                const width = Math.round(event.nativeEvent.layout.width);
                if (width > 0 && width !== layoutWidth) {
                    setLayoutWidth(width);
                }
            }}>
            {layoutWidth > 0 && pagerHeight ? (
                <PagerView
                    style={[styles.pager, {width: layoutWidth, height: pagerHeight}]}
                    initialPage={0}
                    onPageSelected={onPageSelected}
                    overdrag={false}
                    offscreenPageLimit={1}
                    scrollEnabled>
                    {imageUrls.map((url, index) => (
                        <View key={`${url}-${index}`} style={[styles.page, {width: layoutWidth, height: pagerHeight}]}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => onImagePress(url)}
                                style={styles.pageTouchable}>
                                <Image source={{uri: url}} style={[imageStyle, styles.pageImage]} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </PagerView>
            ) : (
                <View style={[imageStyle, styles.measurePlaceholder]} />
            )}
            <View style={styles.dotsRow}>
                {imageUrls.map((url, index) => (
                    <View
                        key={`dot-${url}-${index}`}
                        style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pager: {
        alignSelf: 'center',
    },
    page: {
        flex: 1,
        overflow: 'hidden',
    },
    pageTouchable: {
        flex: 1,
        width: '100%',
    },
    pageImage: {
        width: '100%',
        height: '100%',
    },
    measurePlaceholder: {
        width: '100%',
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: COLORS.CATPURPLGT,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotInactive: {
        backgroundColor: COLORS.OVERLAY_WHITE_35,
    },
});

export default PostImageCarousel;
