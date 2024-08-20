import {Text, View, Modal} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {FONTS, COLORS} from '../../../../assets/constants';

interface Props {
    setHostNotFound: any;
}

const HostNotFoundModal = ({setHostNotFound}: Props) => {
    return (
        <Modal animationType="fade" transparent={true}>
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
                        marginHorizontal: '5%',
                    }}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Watch Party Host Not Found</Text>
                        <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                            There was some trouble finding the host for this watch party. Please try re-joining the
                            watch party room.
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}>
                        <AkcruButtons.SmallButton
                            onPress={() => setHostNotFound(false)}
                            color={COLORS.PINK}
                            btnname="Okay"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default HostNotFoundModal;
