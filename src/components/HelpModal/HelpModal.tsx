import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import AkcruButtons from '../akcruButtons';
import {TouchableWithoutFeedback} from 'react-native';

type HelpModalProps = {
    closeModal: () => void;
    faq: () => void;
    bugReport: () => void;
    suggestion: () => void;
    question: () => void;
};

const HelpModal = ({closeModal, faq, bugReport, suggestion, question}: HelpModalProps) => {
    return (
        <Pressable
            onPress={closeModal}
            style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <TouchableWithoutFeedback>
                <View
                    style={{
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        padding: 20,
                        borderRadius: 10,
                        alignItems: 'center',
                        marginHorizontal: 15,
                        width: '95%',
                    }}>
                    <View>
                        <Icon name="help-rhombus" type="material-community" size={80} color={COLORS.TRANSPINK} />
                    </View>
                    <Text
                        style={{
                            ...FONTS.Title3,
                            marginBottom: 5,
                            textAlign: 'center',
                            fontSize: 20,
                            color: COLORS.PINK,
                        }}>
                        Help
                    </Text>
                    <View style={{paddingVertical: 10, alignItems: 'center'}}>
                        <View style={{paddingBottom: 10}}>
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Here's our frequently ask questions. Also ask Trinity
                            </Text>
                        </View>
                        <AkcruButtons.XlLrgButton btnname="FAQ" onPress={faq} color={COLORS.PINK} disabled={false} />
                    </View>
                    <View style={{paddingVertical: 10, alignItems: 'center'}}>
                        <View style={{paddingBottom: 10}}>
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>Report all bugs here</Text>
                        </View>
                        <AkcruButtons.XlLrgButton
                            btnname="Bug Report"
                            onPress={bugReport}
                            color={COLORS.PINK}
                            disabled={false}
                        />
                    </View>
                    <View style={{paddingVertical: 10, alignItems: 'center'}}>
                        <View style={{paddingBottom: 10}}>
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Have a suggestion or feature you would like to see on Akcru?
                            </Text>
                        </View>
                        <AkcruButtons.XlLrgButton
                            btnname="Suggestions"
                            onPress={suggestion}
                            color={COLORS.PINK}
                            disabled={false}
                        />
                    </View>
                    <View style={{paddingVertical: 10, alignItems: 'center'}}>
                        <View style={{paddingBottom: 10}}>
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Have a question we haven't answered in our FAQ's? Ask here.
                            </Text>
                        </View>
                        <AkcruButtons.XlLrgButton
                            btnname="Questions"
                            onPress={question}
                            color={COLORS.PINK}
                            disabled={false}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Pressable>
    );
};

export default HelpModal;
