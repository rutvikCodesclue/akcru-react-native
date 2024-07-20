import {View, Text, Pressable} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';

type ResendTimerProps = {
    activeResend: any;
    setActiveResend: any;
    targetTimeInSec: number;
    resendEmail: any;
    resendStatus: any;
    resendingEmail: any;
};

const ResendTimer = ({
    activeResend,
    setActiveResend,
    targetTimeInSec,
    resendEmail,
    resendStatus,
    resendingEmail,
    ...props
}: ResendTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [targetTime, setTargetTime] = useState(null);

    const resendText = (resendStatus: any) => {
        if (resendStatus === 'Failed') {
            return COLORS.CATREDLGT;
        } else if (resendStatus === 'Sent') {
            return COLORS.GREEN;
        } else {
            return COLORS.LIGHTORANGE;
        }
    };

    let resendTimerInterval;

    const triggerTimer = (targetTimeInSec: number = 60) => {
        setTargetTime(targetTimeInSec);
        setActiveResend(false);
        const finalTime = +new Date() + targetTimeInSec * 1000;
        resendTimerInterval = setInterval(() => calculateTimeLeft(finalTime), 1000);
    };

    const calculateTimeLeft = (finalTime: number) => {
        const difference = finalTime - +new Date();
        if (difference >= 0) {
            setTimeLeft(Math.round(difference / 1000));
        } else {
            clearInterval(resendTimerInterval);
            setActiveResend(true);
            setTimeLeft(null);
        }
    };

    useEffect(() => {
        triggerTimer(targetTimeInSec);

        return () => {
            clearInterval(resendTimerInterval);
        };
    }, []);
    return (
        <View style={{alignItems: 'center', marginTop: 10}}>
            <View style={{flexDirection: 'row'}}>
                <Text style={{...FONTS.Title2Orange, color: COLORS.PINK}}>Didn't receive a code? </Text>
                <Pressable
                    onPress={() => resendEmail(triggerTimer)}
                    disabled={!activeResend}
                    style={{opacity: !activeResend ? 0.5 : 1}}>
                    <Text style={{...FONTS.Title1, color: resendText(resendStatus)}}>
                        {resendStatus === 'Failed' ? 'Failed' : resendStatus === 'Sent' ? 'Sent' : 'Resend'}
                    </Text>
                </Pressable>
            </View>

            {!activeResend && (
                <Text style={{...FONTS.Title2Orange}}>
                    In <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>{timeLeft || targetTime}</Text>{' '}
                    second(s)
                </Text>
            )}
        </View>
    );
};

export default ResendTimer;
