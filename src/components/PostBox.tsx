import styled from 'styled-components/native';
import Button from '../elements/Button';
import {Text, TextInput, View} from 'react-native';
import React from 'react';

const Wrapper = styled(View)`
  width: 100%;
  border: 1px solid #ebebed41;
  border-radius: 12px;
  position: relative;
  height: 150px;
`;

const Container = styled(View)`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const ButtonLabel = styled(Text)`
  font-size: 14px;
  font-family: 'Montserrat-Regular';
  color: #ffffff;
  text-align: center;
  align-items: center;
`;

const Textarea = styled(TextInput)`
  width: 100%;
  text-align: left;
  color: #ebebed;
  padding: 10px 12px;
  height: 100%;
`;

const Buttons = styled(View)`
  width: 100px;
  z-index: 1;
  position: absolute;
  right: 4px;
  bottom: 8px;
`;

export default () => {
  return (
    <Wrapper>
      <Container>
        <Textarea
          placeholder="Post something"
          placeholderTextColor="#ebebed75"
          textAlignVertical="top"
          multiline={true}></Textarea>
      </Container>
      <Buttons>
        <Button>
          <ButtonLabel>Post</ButtonLabel>
        </Button>
      </Buttons>
    </Wrapper>
  );
};
