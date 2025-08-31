module.exports = {
    project: {
        ios: {},
        android: {}, // grouped into "project"
    },
    assets: ['./assets/fonts/'], // stays the same
    dependencies: {
        'react-native-vector-icons': {
            platforms: {
                ios: null,
            },
        },
        '@100mslive/react-native-hms': {
            platforms: {
                android: {
                    sourceDir: '../node_modules/@100mslive/react-native-hms/android',
                    packageImportPath: 'import com.reactnativehmssdk.HmssdkPackage;',
                    packageInstance: 'new HmssdkPackage()',
                },
            },
        },
    },
};
