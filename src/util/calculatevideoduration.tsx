import React, { useState } from 'react';
import { useEffect } from 'react';
import Video from 'react-native-video';

const CalculateVideoDuration = ({videoUri, onDuration}) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (duration > 0) {
            onDuration(duration);
        }
    }, [duration, onDuration]);

    return (
        <Video
            source={{uri: videoUri}}
            onLoad={data => setDuration(data.duration)}
            paused={true} // Ensure the video doesn't play
            style={{width: 0, height: 0}} // Render it out of view
        />
    );
};

export default CalculateVideoDuration;
