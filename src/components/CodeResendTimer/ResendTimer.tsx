import {View, Text, Pressable, ActivityIndicator} from 'react-native';
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

const ResendTimer = ({activeResend, setActiveResend, targetTimeInSec, resendEmail, resendStatus, resendingEmail}: ResendTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [targetTime, setTargetTime] = useState<number | null>(null);
    const resendTimerInterval = useRef<NodeJS.Timeout | null>(null);

    const resendButtonColor = COLORS.OVERLAY_WHITE_90;

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
            if (resendTimerInterval.current !== null) {
                clearInterval(resendTimerInterval.current);
                resendTimerInterval.current = null;
            }
            setTargetTime(targetTimeSeconds);
            setTimeLeft(targetTimeSeconds);
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
                <Text style={{...FONTS.Title2Orange, color: COLORS.OVERLAY_WHITE_70}}>Didn't receive a code? </Text>
                <Pressable
                    onPress={() => resendEmail(triggerTimer)}
                    disabled={!activeResend || resendingEmail}
                    style={{opacity: !activeResend || resendingEmail ? 0.5 : 1}}>
                    {resendingEmail ? (
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                            <ActivityIndicator size="small" color={resendButtonColor} />
                            <Text style={{...FONTS.Title1, color: resendButtonColor}}>Sending…</Text>
                        </View>
                    ) : (
                        <Text style={{...FONTS.Title1, color: resendButtonColor}}>
                            {resendStatus === 'Failed' ? 'Failed' : resendStatus === 'Sent' ? 'Sent' : 'Resend'}
                        </Text>
                    )}
                </Pressable>
            </View>

            {resendingEmail && (
                <Text style={{...FONTS.Title2Orange, color: COLORS.OVERLAY_WHITE_60, minHeight: 24}}>Sending new code…</Text>
            )}
            {!activeResend && !resendingEmail && (
                <Text style={{...FONTS.Title2Orange, color: COLORS.OVERLAY_WHITE_60, minHeight: 24}}>
                    In <Text style={{...FONTS.Title1, color: COLORS.PINK}}>{timeLeft ?? targetTime ?? targetTimeInSec}</Text>{' '}
                    second(s)
                </Text>
            )}
        </View>
    );
};

export default ResendTimer;
