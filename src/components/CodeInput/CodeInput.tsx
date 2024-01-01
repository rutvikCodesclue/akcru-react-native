import {View, Text, TextInput, Pressable} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';

type CodeInputProps = {
    maxLength: number;
    code: any;
    setCode: any;
    setPinReady: any;
};

const CodeInput = ({maxLength, code, setCode, setPinReady}: CodeInputProps) => {
    const codeDigitArray = new Array(maxLength).fill(0);

    const [inputFocused, setInputFocused] = useState(false)

    const textInputRef = useRef(null);

    const handleOnPress = () => {
        setInputFocused(true);
        textInputRef?.current?.focus();
    };
    const handleOnSubmitEditing = () => {
        setInputFocused(false);
    };
    
    useEffect(() => {
        setPinReady(code.length === maxLength)
        return () => setPinReady(false);
    },[code]);

    const toCodeDigitInput = (value, index) => {
        const emptyInputChar = ' ';
        const digit = code[index] || emptyInputChar;

        const isCurrentDigit = index === code.length;
        const isLastDigit = index === maxLength - 1;
        const isCodeFull = code.length === maxLength

        const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull)

        return (
            <View
                style={{
                    width: '18%',
                    padding: 12,
                    borderBottomWidth: 5,
                    borderRadius: 10,
                    borderColor: inputFocused && isDigitFocused ? COLORS.MIDORANGE : COLORS.DARKERGREY,
                }}
                key={index}>
                <Text style={{...FONTS.Title2, fontSize: 18, textAlign: 'center'}}>{digit}</Text>
            </View>
        );
    };

    return (
        <View style={{ alignItems: 'center'}}>
            <Pressable
                style={{width: '80%', flexDirection: 'row', justifyContent: 'space-between'}}
                onPress={handleOnPress}>
                {codeDigitArray.map(toCodeDigitInput)}
            </Pressable>
            <TextInput
                keyboardType="number-pad"
                returnKeyType="done"
                textContentType="oneTimeCode"
                ref={textInputRef}
                value={code}
                onChangeText={setCode}
                maxLength={maxLength}
                onSubmitEditing={handleOnSubmitEditing}
                style={{position: 'absolute', width: 1, height: 1, opacity: 0,}}
            />
        </View>
    );
};

export default CodeInput;
