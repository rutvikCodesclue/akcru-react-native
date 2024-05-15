import {Text, View, ImageBackground, Image, TouchableOpacity, SafeAreaView, Modal} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {SIZES, COLORS, FONTS} from '../../../../assets/constants';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import imageindex from '../../../../assets/images/imageindex';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import useAuthStore from '../../../stores/auth.store';
import {purchaseMIT} from '../../../lib/api/wallet.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';

const PurchaseMITScreen = () => {
    const {user} = useAuthStore();

    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    const [countMIT, setCountMIT] = useState(0);
    const [countMITError, setCountMITError] = useState(false);
    const [countMITError2, setCountMITError2] = useState(false);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [insufficientADError, setInsufficientADError] = useState(false);
    const [purchaseCompleteModalVisible, setPurchaseCompleteModalVisible] = useState(false);

    const maxMITs = Math.floor(user?.adAmount ? user?.adAmount / 500 : 0);

    const handlePurchaseModalOpen = () => {
        if (countMIT === 0) {
            setCountMITError2(true);

            return;
        }

        setPurchaseModalVisible(true);
    };

    const handlePurchaseComplete = () => {
        setPurchaseCompleteModalVisible(true);

        setTimeout(() => {
            setPurchaseCompleteModalVisible(false);
            setCountMIT(0);
        }, 4000);
    };

    const confirmPurchase = async () => {
        const totalCost = countMIT * 500;
        if (user?.adAmount && user.adAmount >= totalCost) {
            purchaseMIT({
                amount: countMIT,
            });

            setPurchaseModalVisible(false);
            setInsufficientADError(false);
            handlePurchaseComplete();
        } else {
            setInsufficientADError(true);
        }
    };

    const incrementCount = () => {
        if (countMIT < maxMITs) {
            setCountMIT(countMIT + 1);
            setCountMITError(false);
            setCountMITError2(false);
        } else {
            setCountMITError(true);

            setTimeout(() => {
                setCountMITError(false);
            }, 3000);
        }
    };

    const decrementCount = () => {
        if (countMIT > 1) {
            setCountMIT(countMIT - 1);
            setCountMITError(false);
        }
    };

    return (
        <TabContainer>
            <View>
                <ImageBackground
                    source={{
                        uri: 'https://akcru.com/wp-content/uploads/2023/05/creepymit.png',
                    }}
                    resizeMode="cover"
                    style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                    <SafeAreaView>
                        <View>
                            <Header />
                        </View>
                        <TouchableOpacity
                            style={{marginHorizontal: 15, marginBottom: 10}}
                            onPress={() => navigation.pop()}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <View>
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        marginHorizontal: 15,
                                        marginVertical: 10,
                                        color: COLORS.PINK,
                                        textAlign: 'center',
                                    }}>
                                    Create a date to watch a movie with someone outside of your CRU using a Movie Invite
                                    Ticket.
                                </Text>
                                <View style={styles.pricecontainer}>
                                    <Image source={imageindex.MIT1} style={styles.mitimage} />
                                    <View style={{flexDirection: 'row', marginVertical: 10}}>
                                        <Text style={{...FONTS.HeroTitle}}>Movie Invite Tickets</Text>
                                    </View>

                                    <Text style={styles.mitprice}>
                                        500 AD /<Text style={{color: COLORS.PINK}}> pc.</Text>
                                    </Text>
                                    <View style={{marginBottom: 10}}>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={styles.counticonbox}>
                                                <TouchableOpacity onPress={decrementCount}>
                                                    <Icon
                                                        name="minus"
                                                        type="material-community"
                                                        size={24}
                                                        color={COLORS.PINK}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: COLORS.LIGHTGREY,
                                                    width: 40,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                <Text style={{...FONTS.Title1}}>{countMIT}</Text>
                                            </View>
                                            <View style={styles.counticonbox}>
                                                <TouchableOpacity onPress={incrementCount}>
                                                    <Icon
                                                        name="plus"
                                                        type="material-community"
                                                        size={24}
                                                        color={COLORS.PINK}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{marginBottom: 10}}>
                                        {countMITError && (
                                            <Text style={styles.warningText}>
                                                You do not have enough Akcru Dollars.
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{marginBottom: 10}}>
                                        {countMITError2 && (
                                            <Text style={styles.warningText}>You must purchase atleast 1 MIT.</Text>
                                        )}
                                    </View>

                                    <AkcruButtons.LrgButton
                                        btnname="PURCHASE"
                                        color={COLORS.CATPURPDRK}
                                        onPress={handlePurchaseModalOpen}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                            <Modal animationType="fade" transparent={true} visible={purchaseModalVisible}>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    }}>
                                    <View
                                        style={{
                                            backgroundColor: COLORS.AKCRUBACKGROUND,
                                            padding: 20,
                                            borderRadius: 10,
                                        }}>
                                        <Text style={{...FONTS.Title1}}>You are purchasing '{countMIT}' MIT(s).</Text>
                                        <Text style={{...FONTS.Title1}}>Total Cost: {countMIT * 500} AD</Text>
                                        <View style={{flexDirection: 'row', marginTop: 10}}>
                                            <TouchableOpacity
                                                onPress={() => setPurchaseModalVisible(false)}
                                                disabled={isLoading}>
                                                <View
                                                    style={{
                                                        width: 125,
                                                        height: 30,
                                                        backgroundColor: COLORS.AKCRUBLUE,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: 3,
                                                        marginRight: 10,
                                                    }}>
                                                    <Text style={{...FONTS.Title2}}>CANCEL</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={confirmPurchase} disabled={isLoading}>
                                                <View
                                                    style={{
                                                        width: 125,
                                                        height: 30,
                                                        backgroundColor: COLORS.CATPURPDRK,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: 3,
                                                    }}>
                                                    <Text style={{...FONTS.Title2}}>CONFIRM</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={{marginBottom: 10}}>
                                                {insufficientADError && (
                                                    <Text style={styles.warningText}>
                                                        You do not have enough Akcru Dollars.
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            <Modal animationType="fade" transparent={true} visible={purchaseCompleteModalVisible}>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                    }}>
                                    <View
                                        style={{
                                            backgroundColor: COLORS.AKCRUBACKGROUND,
                                            padding: 20,
                                            borderRadius: 10,
                                        }}>
                                        <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                                            Congratulations, you have purchased '{countMIT}' MIT(s) for a total cost of{' '}
                                            {countMIT * 500} AD.
                                        </Text>
                                    </View>
                                </View>
                            </Modal>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
        </TabContainer>
    );
};

export default PurchaseMITScreen;
