import { Image, View } from "react-native";
import styled from "styled-components";

const Thumbnail = styled(Image)`
  width: 100%;
  aspect-ratio: 1;
  flex: 1;
  border-radius: 100px;
`;

export default ({ imgSize = 49, imgSrc = "", offset = 2.5 }) => {
  return (
    <View>
      <Thumbnail
        style={{
          width: imgSize,
          height: imgSize,
        }}
        resizeMode="cover"
        source={{
          uri: imgSrc,
        }}
      />
    </View>
  );
};
