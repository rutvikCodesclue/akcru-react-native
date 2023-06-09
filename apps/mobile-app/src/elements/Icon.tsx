import {Image} from 'react-native';
import styled from 'styled-components/native';

const Icon = styled(Image)`
  width: 18px;
  height: 18px;
  aspect-ratio: 1;
`;

export default ({source, style = {}}) => {
  return source ? (
    <Icon resizeMode="contain" style={style} source={source} />
  ) : (
    <></>
  );
};
