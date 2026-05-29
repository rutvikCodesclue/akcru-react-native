import {View, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import {TouchableWithoutFeedback} from 'react-native';

type HelpModalProps = {
    closeModal: () => void;
    faq: () => void;
    bugReport: () => void;
    suggestion: () => void;
    question: () => void;
};

const HelpModal = ({closeModal, faq, bugReport, suggestion, question}: HelpModalProps) => {
    const items = [
        {
            key: 'faq',
            title: 'FAQ',
            subtitle: "Frequently asked questions and Trinity help",
            onPress: faq,
        },
        {
            key: 'bug',
            title: 'Bug Report',
            subtitle: 'Report issues you found',
            onPress: bugReport,
        },
        {
            key: 'suggestion',
            title: 'Suggestions',
            subtitle: 'Share features you want on Akcru',
            onPress: suggestion,
        },
        {
            key: 'question',
            title: 'Questions',
            subtitle: "Ask anything not covered in FAQ's",
            onPress: question,
        },
    ];

    return (
        <Pressable onPress={closeModal} style={styles.overlay}>
            <TouchableWithoutFeedback>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Icon name="help-rhombus" type="material-community" size={28} color={COLORS.PINK} />
                            <Text style={styles.title}>Help</Text>
                        </View>
                        <Pressable onPress={closeModal} style={styles.closeBtn}>
                            <Icon name="close" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                        </Pressable>
                    </View>
                    <Text style={styles.subtitle}>Choose an option to continue</Text>

                    <View style={styles.listWrap}>
                        {items.map((item, index) => (
                            <View key={item.key}>
                                <Pressable style={styles.tile} onPress={item.onPress}>
                                    <View style={styles.tileTextWrap}>
                                        <Text style={styles.tileTitle}>{item.title}</Text>
                                        <Text style={styles.tileSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Text style={styles.chevron}>{'>'}</Text>
                                </Pressable>
                                {index < items.length - 1 ? <View style={styles.separator} /> : null}
                            </View>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY_BLACK_50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
    },
    card: {
        backgroundColor: COLORS.BLACK,
        padding: 16,
        borderRadius: 14,
        width: '100%',
        maxWidth: 540,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        ...FONTS.Title2,
        color: COLORS.PINK,
        marginLeft: 8,
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        marginBottom: 14,
    },
    listWrap: {
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(211,211,211,0.08)',
    },
    tile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    tileTextWrap: {
        flex: 1,
        paddingRight: 10,
    },
    tileTitle: {
        ...FONTS.paragraph1,
        color: COLORS.PINK,
    },
    tileSubtitle: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        marginTop: 2,
    },
    chevron: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.OVERLAY_WHITE_20,
    },
});

export default HelpModal;
