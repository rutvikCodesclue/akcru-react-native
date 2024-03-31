var Sound = require('react-native-sound');
// Enable playback in silence mode
Sound?.setCategory('Playback');

// Load the sound file for the message
const messageSound = new Sound('message.mp3', Sound?.MAIN_BUNDLE, (error: any) => {
    if (error) {
        console.log('Failed to load the sound', error);
        return;
    }
});

// Function to play the message sound
const playMessageSound = () => {
    // Check if the sound is loaded successfully
    if (messageSound.isLoaded()) {
        // Play the sound
        messageSound.play();
    } else {
        console.log('Message sound is not loaded');
    }
};

export default playMessageSound;
