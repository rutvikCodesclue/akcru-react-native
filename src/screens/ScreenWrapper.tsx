// import NavBar from '@components/NavBar';
import {Dimensions, View} from 'react-native';
import styled from 'styled-components/native';

const {height, width} = Dimensions.get('screen');

const Wrapper = styled(View)`
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  height: ${() => height}px;
  width: ${() => width}px;
`;

export default ({children}) => {
  return (
    <Wrapper>
      {children}
      {/* <NavBar /> */}
    </Wrapper>
  );
};
