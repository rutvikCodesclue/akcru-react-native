// CruGroupChatStyles.ts
import {StyleSheet} from 'react-native';
import {COLORS} from '../../../assets/constants';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    fullScreen: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10,
    },
    selectedImage: {
        width: '100%',
        height: '70%',
        borderRadius: 15,
        marginBottom: 10,
    },
    textInput: {
        // width: '90%',
        flex: 1,
        backgroundColor: 'rgba(24,20,36,0.95)',
        borderColor: 'rgba(174,146,255,0.35)',
        borderWidth: 1,
        borderRadius: 15,
        padding: 10,
        paddingLeft: 10,
        color: COLORS.WHITE,
    },
    sendButton: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(132,76,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePickerButton: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(132,76,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    crossButton: {
        alignSelf: 'flex-end',
        // position: 'absolute',
        // top: -15,
        // right: 10,
        // zIndex: 10,
    },
});

export default styles;
