import {View, Text, Pressable} from 'react-native';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';

type ResendTimerProps = {
    activeResend: any;
    setActiveResend: any;
    targetTimeInSec: number;
    resendEmail: any;
    resendStatus: any;
    resendingEmail: any;
};

const ResendTimer = ({activeResend, setActiveResend, targetTimeInSec, resendEmail, resendStatus}: ResendTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [targetTime, setTargetTime] = useState<number | null>(null);
    const resendTimerInterval = useRef<NodeJS.Timeout | null>(null);

    const resendText = (status: any) => {
        if (status === 'Failed') {
            return COLORS.CATREDLGT;
        } else if (status === 'Sent') {
            return COLORS.GREEN;
        } else {
            return COLORS.LIGHTORANGE;
        }
    };

    const calculateTimeLeft = useCallback(
        (finalTime: number) => {
            const difference = finalTime - +new Date();
            if (difference >= 0) {
                setTimeLeft(Math.round(difference / 1000));
            } else {
                if (resendTimerInterval.current !== null) {
                    clearInterval(resendTimerInterval.current);
                }
                setActiveResend(true);
                setTimeLeft(null);
            }
        },
        [setActiveResend],
    );

    const triggerTimer = useCallback(
        (targetTimeSeconds: number = 30) => {
            setTargetTime(targetTimeSeconds);
            setActiveResend(false);
            const finalTime = +new Date() + targetTimeSeconds * 1000;
            resendTimerInterval.current = setInterval(() => calculateTimeLeft(finalTime), 1000);
        },
        [calculateTimeLeft, setActiveResend],
    );

    useEffect(() => {
        triggerTimer(targetTimeInSec);

        return () => {
            if (resendTimerInterval.current !== null) {
                clearInterval(resendTimerInterval.current);
            }
        };
    }, [targetTimeInSec, triggerTimer]);

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
