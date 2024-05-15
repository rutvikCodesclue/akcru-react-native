var Sound = require('react-native-sound');

Sound?.setCategory('Playback');

const messageSound = new Sound('message.mp3', Sound?.MAIN_BUNDLE, (error: any) => {
    if (error) {
        console.log('Failed to load the sound', error);
        return;
    }
});

const playMessageSound = () => {
    if (messageSound.isLoaded()) {
        messageSound.play();
    } else {
        console.log('Message sound is not loaded');
    }
};

export default playMessageSound;
