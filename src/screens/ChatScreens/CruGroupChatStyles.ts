// CruGroupChatStyles.ts
import {StyleSheet} from 'react-native';
import {COLORS} from '../../../assets/constants';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
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
        backgroundColor: 'white',
        borderColor: COLORS.BLACK,
        borderWidth: 1,
        borderRadius: 15,
        padding: 10,
        paddingLeft: 10,
        color: 'black',
    },
    sendButton: {
        // alignSelf: 'flex-end',
        // marginLeft: 10,
    },
    imagePickerButton: {
        // position: 'absolute',
        // bottom: 8,
        // left: 6,
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
