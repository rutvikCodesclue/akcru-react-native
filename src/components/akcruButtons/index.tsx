import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {FONTS, COLORS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {isTablet} from '../../../assets/constants/theme';
import { Icon } from '@rneui/base';

interface Props {
    btnname: string;
    onPress: () => void;
    color: string;
    disabled?: boolean;
    width: number;
}

interface BtnProps {
    btnname: string;
    onPress: () => void;
    color: string;
    disabled?: boolean;
}

interface IconBtnProps {
    btnname: string;
    onPress: () => void;
    color: string;
    disabled?: boolean;
    icon: string;
    type: string
}

const buttonHeight = isTablet() ? 60 : 45;
const smallButtonHeight = isTablet() ? 60 : 40;
const smallButtonWidth = isTablet() ? 130 : 95;
const iconsize = isTablet() ? 30 : 20;

const SmallButton: React.FC<BtnProps> = ({btnname, onPress, color, disabled}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth / 3, height: buttonHeight}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: buttonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const MedButton: React.FC<BtnProps> = ({btnname, onPress, color, disabled}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth / 2.2, height: buttonHeight}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: buttonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const LrgButton: React.FC<BtnProps> = ({btnname, onPress, color, disabled}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth * 0.9, height: buttonHeight}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: buttonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const XlLrgButton: React.FC<BtnProps> = ({btnname, onPress, color, disabled}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth * 0.8, height: buttonHeight}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: buttonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const XSmallButton = ({btnname, onPress, disabled, color}: BtnProps) => {
    return (
        <View>
            <TouchableOpacity onPress={onPress} disabled={disabled}>
                <View
                    style={{
                        backgroundColor: color,
                        height: smallButtonHeight,
                        justifyContent: 'center',
                        width: smallButtonWidth,
                        borderRadius: 5,
                        alignItems: 'center',
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: smallButtonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title2}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const AutoButton = ({btnname, onPress, color, width}: Props) => {
    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <View
                    style={{
                        backgroundColor: color,
                        height: 35,
                        justifyContent: 'center',
                        width: width,
                        borderRadius: 5,
                        alignItems: 'center',
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: 35,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title2}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const FollowButton: React.FC<BtnProps> = ({btnname, onPress, color, disabled}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth / 2.2, height: SIZES.ScreenHeight * 0.05}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: SIZES.ScreenHeight * 0.05,
                            borderRadius: 5,
                        }}
                    />
                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>{btnname}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const IconMedButton: React.FC<IconBtnProps> = ({btnname, onPress, color, disabled, icon, type}) => {
    return (
        <View>
            <TouchableOpacity
                style={{width: SIZES.ScreenWidth / 2.4, height: buttonHeight}}
                onPress={onPress}
                disabled={disabled}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        justifyContent: 'center',
                        borderRadius: 5,
                        alignItems: 'center'
                    }}>
                    <LinearGradient
                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: buttonHeight,
                            borderRadius: 5,
                        }}
                    />
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Icon
                            name={icon}
                            type={type}
                            color={COLORS.LIGHTGREY}
                            size={iconsize}
                            style={{marginRight: 5}}
                        />
                        <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const AkcruButtons = {
    SmallButton,
    MedButton,
    LrgButton,
    XSmallButton,
    XlLrgButton,
    FollowButton,
    AutoButton,
    IconMedButton,
};

export default AkcruButtons;
