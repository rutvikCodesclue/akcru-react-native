import React from 'react';
import {ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Icon} from '@rneui/base';

type InlineCommentComposerProps = {
    value: string;
    onChangeText: (value: string) => void;
    onSend?: () => void;
    isSending?: boolean;
    inputRef?: React.RefObject<TextInput | null>;
    onPressIn?: (event: GestureResponderEvent) => void;
};

const InlineCommentComposer = ({
    value,
    onChangeText,
    onSend,
    isSending = false,
    inputRef,
    onPressIn,
}: InlineCommentComposerProps) => {
    const handleSendPress = (event: GestureResponderEvent) => {
        event.stopPropagation();
        if (isSending) {
            return;
        }
        onSend?.();
    };

    return (
        <View style={styles.commentBar}>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChangeText}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.commentPlaceholder}
                multiline={false}
                numberOfLines={1}
                onPressIn={onPressIn}
            />
            <Pressable onPress={handleSendPress}>
                {isSending ? (
                    <ActivityIndicator size="small" color="#9b59b6" />
                ) : (
                    <Icon name="send" type="ionicon" color="#9b59b6" size={22} />
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    commentBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        paddingHorizontal: 14,
        paddingVertical: 2,
        borderRadius: 20,
        backgroundColor: '#12121c',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#9b59b6',
    },
    commentPlaceholder: {
        flex: 1,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        lineHeight: 18,
        includeFontPadding: false,
    },
});

export default InlineCommentComposer;
