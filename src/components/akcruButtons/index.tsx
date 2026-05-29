import {View, Text, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType} from 'react-native';
import React from 'react';
import {FONTS, COLORS, SIZES} from '../../../assets/constants';
import {AUTH_BUTTON_THEME, AUTH_TEXT_THEME} from '../../../assets/constants/authTheme';
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
    /** Use auth theme (purple-pink gradient, theme dimensions) */
    variant?: 'default' | 'auth';
    /** Show loading spinner inside button */
    loading?: boolean;
    /** Auth variant only: override default width (e.g. footer row next to balance) */
    authButtonWidth?: number;
    /** Auth variant only: optional image beside the label (e.g. movie ticket icon) */
    authLeftImage?: ImageSourcePropType;
    /** Auth variant only: side for `authLeftImage` (default left) */
    authImagePosition?: 'left' | 'right';
    /** Auth variant only: icon size for `authLeftImage` */
    authImageSize?: number;
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

const SmallButton: React.FC<BtnProps> = ({
    btnname,
    onPress,
    color,
    disabled,
    variant = 'default',
    loading = false,
    authButtonWidth,
    authLeftImage,
    authImagePosition = 'left',
    authImageSize = 22,
}) => {
    if (variant === 'auth') {
        const authW = authButtonWidth ?? SIZES.ScreenWidth / 2.2;
        const imageEl =
            authLeftImage != null ? (
                <Image
                    source={authLeftImage}
                    style={{
                        width: authImageSize,
                        height: authImageSize,
                        marginRight: authImagePosition === 'left' ? 8 : 0,
                        marginLeft: authImagePosition === 'right' ? 8 : 0,
                    }}
                    resizeMode="contain"
                />
            ) : null;
        return (
            <View style={{marginVertical: authButtonWidth !== undefined ? 0 : 10}}>
                <TouchableOpacity
                    style={{
                        width: authW,
                        height: AUTH_BUTTON_THEME.getHeight(),
                        borderRadius: AUTH_BUTTON_THEME.borderRadius,
                        overflow: 'hidden',
                        opacity: disabled ? 0.5 : 1,
                    }}
                    onPress={onPress}
                    disabled={disabled || loading}>
                    <LinearGradient
                        colors={AUTH_BUTTON_THEME.colors}
                        start={AUTH_BUTTON_THEME.start}
                        end={AUTH_BUTTON_THEME.end}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: AUTH_BUTTON_THEME.borderRadius,
                            paddingHorizontal: authLeftImage ? 14 : 0,
                        }}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.WHITE} />
                        ) : (
                            <>
                                {authImagePosition === 'left' ? imageEl : null}
                                <Text style={AUTH_TEXT_THEME.buttonLabel}>{btnname}</Text>
                                {authImagePosition === 'right' ? imageEl : null}
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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

const LrgButton: React.FC<BtnProps> = ({
    btnname,
    onPress,
    color,
    disabled,
    variant = 'default',
    loading = false,
    authButtonWidth,
}) => {
    if (variant === 'auth') {
        const authW = authButtonWidth ?? AUTH_BUTTON_THEME.width;
        return (
            <View style={{marginVertical: authButtonWidth !== undefined ? 0 : 10}}>
                <TouchableOpacity
                    style={{
                        width: authW,
                        height: AUTH_BUTTON_THEME.getHeight(),
                        borderRadius: AUTH_BUTTON_THEME.borderRadius,
                        overflow: 'hidden',
                        opacity: disabled ? 0.5 : 1,
                    }}
                    onPress={onPress}
                    disabled={disabled || loading}>
                    <LinearGradient
                        colors={AUTH_BUTTON_THEME.colors}
                        start={AUTH_BUTTON_THEME.start}
                        end={AUTH_BUTTON_THEME.end}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: AUTH_BUTTON_THEME.borderRadius,
                        }}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.WHITE} />
                        ) : (
                            <Text style={AUTH_TEXT_THEME.buttonLabel}>{btnname}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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

const XlLrgButton: React.FC<BtnProps> = ({
    btnname,
    onPress,
    color,
    disabled,
    variant = 'default',
    loading = false,
    authButtonWidth,
}) => {
    if (variant === 'auth') {
        const authW = authButtonWidth ?? AUTH_BUTTON_THEME.width;
        return (
            <View style={{marginVertical: authButtonWidth !== undefined ? 0 : 10}}>
                <TouchableOpacity
                    style={{
                        width: authW,
                        height: AUTH_BUTTON_THEME.getHeight(),
                        borderRadius: AUTH_BUTTON_THEME.borderRadius,
                        overflow: 'hidden',
                        opacity: disabled ? 1: 1,
                    }}
                    onPress={onPress}
                    disabled={disabled || loading}>
                    <LinearGradient
                        colors={AUTH_BUTTON_THEME.colors}
                        start={AUTH_BUTTON_THEME.start}
                        end={AUTH_BUTTON_THEME.end}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: AUTH_BUTTON_THEME.borderRadius,
                        }}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.WHITE} />
                        ) : (
                            <Text style={AUTH_TEXT_THEME.buttonLabel}>{btnname}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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

const CustomButton = ({
  btnname,
  onPress,
  disabled,
  color,
  iconName,
  iconColor = COLORS.WHITE,
  iconSize = 18,
}: BtnProps & {iconName?: string; iconColor?: string; iconSize?: number}) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <View
          style={{
            backgroundColor: color,
            height: smallButtonHeight,
            justifyContent: 'center',
            borderRadius: 5,
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 6,
            alignSelf: 'flex-start',
                      opacity: disabled ?1: 1,
          }}>
          <LinearGradient
            colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: smallButtonHeight,
              borderRadius: 5,
            }}
          />
          {/* Icon */}
          {iconName && (
              <Icon
                name={iconName}
                size={iconSize}
                color={iconColor}
                style={{marginRight: 6}}
              />
          )}
          {/* Text */}
          <Text style={{...FONTS.Title2}}>{btnname}</Text>
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
                        colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
    CustomButton,
    XlLrgButton,
    FollowButton,
    AutoButton,
    IconMedButton,
};

export default AkcruButtons;
