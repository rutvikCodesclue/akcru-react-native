import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {BlurView} from '@react-native-community/blur';

type CodeInputProps = {
    maxLength: number;
    code: any;
    setCode: any;
    setPinReady: any;
};

const CodeInput = ({maxLength, code, setCode, setPinReady}: CodeInputProps) => {
    const codeDigitArray = new Array(maxLength).fill(0);

    const [inputFocused, setInputFocused] = useState(false);

    const textInputRef = useRef(null);
    const isRefocusingRef = useRef(false);

    const handleOnPress = () => {
        const input = textInputRef?.current;
        if (input) {
            isRefocusingRef.current = true;
            input.blur();
            setTimeout(() => {
                setInputFocused(true);
                input.focus();
                isRefocusingRef.current = false;
            }, 0);
        } else {
            setInputFocused(true);
            textInputRef?.current?.focus();
        }
    };
    const handleOnSubmitEditing = () => {
        setInputFocused(false);
    };
    const handleOnBlur = () => {
        if (!isRefocusingRef.current) {
            setInputFocused(false);
        }
    };

    useEffect(() => {
        setPinReady(code.length === maxLength);
        return () => setPinReady(false);
    }, [code]);

    const toCodeDigitInput = (value, index) => {
        const emptyInputChar = ' ';
        const digit = code[index] || emptyInputChar;

        const isCurrentDigit = index === code.length;
        const isLastDigit = index === maxLength - 1;
        const isCodeFull = code.length === maxLength;

        const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull);

        return (
            <View
                style={{
                    width: '15%',
                    height: 60,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: inputFocused && isDigitFocused ? COLORS.PINK : 'rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                }}
                key={index}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="rgba(255,255,255,0.1)"
                />
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{...FONTS.Title2, fontSize: 24, textAlign: 'center', color: COLORS.WHITE}}>
                        {digit}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={{alignItems: 'center'}}>
            <Pressable
                style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8}}
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
                onBlur={handleOnBlur}
                style={{position: 'absolute', width: 1, height: 1, opacity: 0}}
            />
        </View>
    );
};

export default CodeInput;
