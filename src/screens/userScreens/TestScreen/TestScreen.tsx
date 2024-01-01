import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {findAUser} from '../../../lib/api/user.lib';

const TestScreen = () => {
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleTestFindUser = async () => {
        try {
            const user = await findAUser({email});
            setResult(user ? `User Found: ${JSON.stringify(user)}` : 'No user found');
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.textInput}
                placeholder="Enter Email"
                placeholderTextColor="#FFFFFF"
                value={email}
                onChangeText={setEmail}
            />
            <Button title="Test Find User" onPress={handleTestFindUser} />
            {result && <Text style={styles.resultText}>{result}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Optional: for better visibility of white text
    },
    textInput: {
        color: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        width: '80%',
        marginBottom: 10,
        padding: 10,
    },
    resultText: {
        color: '#FFFFFF',
        marginTop: 20,
    },
});

export default TestScreen;
