import {View, SafeAreaView} from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';

const CruChewOrder = () => {
    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                <View>
                    <Header />
                </View>
                <WebView
                    source={{
                        uri: 'https://sdk.mealme.ai/store?api=akcru&storeType=restaurant&primaryColor=2FBFF1&hidePoweredBy=true&combineServiceAndDeliveryFee=true',
                    }}
                    style={{
                        marginBottom: 40,
                    }}
                />
            </SafeAreaView>
        </TabContainer>
    );
};

export default CruChewOrder;
