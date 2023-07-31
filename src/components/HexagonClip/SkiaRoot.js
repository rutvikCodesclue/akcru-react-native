import {useEffect, useState} from 'react';
import {Canvas, Path, Rect} from '@shopify/react-native-skia';
import {useWindowDimensions, View} from 'react-native';
import ClipImage, {makeHexagonPath} from './ClipImage';

const imgs = [
  'https://images.pexels.com/photos/261152/pexels-photo-261152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.unsplash.com/photo-1662819050844-105002a4f862?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
];

export default function SkiaRoot() {
  const [images, setImages] = useState([]);
  const {width, height} = useWindowDimensions();
  const imgSize = width * 0.5;
  useEffect(() => {
    Promise.all(imgs).then(setImages);
  }, []);
  return (
    <Canvas style={{flex: 1, width, height, backgroundColor: 'pink'}}>
      {imgs.map((img, i) => (
        <ClipImage
          imageSrc={img}
          imageSize={imgSize}
          imagePosition={[0, imgSize * i]}
        />
      ))}
    </Canvas>
  );
}
