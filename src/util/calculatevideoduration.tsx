import React, {useState} from 'react';
import {useEffect} from 'react';
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
            paused={true}
            style={{width: 0, height: 0}}
        />
    );
};

export default CalculateVideoDuration;
