import React from 'react';
import {PixelRatio, Dimensions} from 'react-native';
import {isTablet} from '../../assets/constants/theme';
import {emitHexagonShake} from '../util/hexagonShake';
import {INotification} from '../../types';
import {
    computeMitUnreadNotificationCount,
    computeMsgRcvdUnreadNotificationCount,
    computeUnreadNotificationCount,
} from '../util/notificationUnreadCount';

interface TabContextType {
    opened: boolean;
    toggleOpened: () => void;
    getAdjustedIconSize: (baseSize: number) => number;

    refetchCrus: boolean;
    setRefetchCrus: (value: boolean) => void;

    refetchDates: boolean;
    setRefetchDates: (value: boolean) => void;

    refetchReadNotifications: boolean;
    setRefetchReadNotifications: (value: boolean) => void;

    refetchUnreadNotifications: boolean;
    setRefetchUnreadNotifications: (value: boolean) => void;

    deletedNotifications: boolean;
    setDeletedNotifications: (value: boolean) => void;

    updateMITs: boolean;
    setUpdateMITs: (value: boolean) => void;

    /** Unread count for header + center hex badge (synced when notifications are fetched). */
    notificationUnreadCount: number;
    setNotificationUnreadCount: (value: number) => void;

    /** Unread MITReceived / MITAccepted / MITDeclined (hex ticket dot + center hex dot + shake). */
    mitNotificationUnreadCount: number;
    setMitNotificationUnreadCount: (value: number) => void;

    /** Unread MsgRcvd (hex chat-list satellite dot + center hex dot + shake). */
    msgRcvdNotificationUnreadCount: number;
    setMsgRcvdNotificationUnreadCount: (value: number) => void;

    /** Updates total + MIT + MsgRcvd badge counts from a notification list (preferred at fetch points). */
    syncNotificationBadgeCounts: (notifications: INotification[] | undefined) => void;
}

/** Single source of defaults for createContext + UseTabMenu merge (avoids undefined setters after partial context). */
const defaultTabContextValue: TabContextType = {
    opened: false,
    toggleOpened: () => {},
    getAdjustedIconSize: (baseSize: number) => baseSize,

    refetchCrus: false,
    setRefetchCrus: () => {},

    refetchDates: false,
    setRefetchDates: () => {},

    refetchReadNotifications: false,
    setRefetchReadNotifications: () => {},

    refetchUnreadNotifications: false,
    setRefetchUnreadNotifications: () => {},

    deletedNotifications: false,
    setDeletedNotifications: () => {},

    updateMITs: false,
    setUpdateMITs: () => {},

    notificationUnreadCount: 0,
    setNotificationUnreadCount: () => {},

    mitNotificationUnreadCount: 0,
    setMitNotificationUnreadCount: () => {},

    msgRcvdNotificationUnreadCount: 0,
    setMsgRcvdNotificationUnreadCount: () => {},
    syncNotificationBadgeCounts: () => {},
};

const TabContext = React.createContext<TabContextType>(defaultTabContextValue);

export const TabContextProvider = ({children}: {children: React.ReactNode}) => {
    const [opened, setOpened] = React.useState(false);

    const [refetchCrus, setRefetchCrus] = React.useState(false);

    const [refetchDates, setRefetchDates] = React.useState(false);

    const [refetchReadNotifications, setRefetchReadNotifications] = React.useState(false);

    const [refetchUnreadNotifications, setRefetchUnreadNotifications] = React.useState(false);

    const [deletedNotifications, setDeletedNotifications] = React.useState(false);

    const [updateMITs, setUpdateMITs] = React.useState(false);

    const [notificationUnreadCount, setNotificationUnreadCountState] = React.useState(0);

    const [mitNotificationUnreadCount, setMitNotificationUnreadCountState] = React.useState(0);

    const [msgRcvdNotificationUnreadCount, setMsgRcvdNotificationUnreadCountState] = React.useState(0);

    /** After first sync, hex shakes when MIT hex unread or MsgRcvd unread count rises (vibration runs in hex listener). */
    const notificationBadgeCountsHydratedRef = React.useRef(false);
    const lastSyncedMitHexRef = React.useRef(0);
    const lastSyncedMsgRcvdRef = React.useRef(0);

    const setNotificationUnreadCount = React.useCallback((value: number) => {
        setNotificationUnreadCountState(value);
    }, []);

    const setMitNotificationUnreadCount = React.useCallback((value: number) => {
        setMitNotificationUnreadCountState(value);
    }, []);

    const setMsgRcvdNotificationUnreadCount = React.useCallback((value: number) => {
        setMsgRcvdNotificationUnreadCountState(value);
    }, []);

    const syncNotificationBadgeCounts = React.useCallback((notifications: INotification[] | undefined) => {
        const nextTotal = computeUnreadNotificationCount(notifications);
        const nextMitHex = computeMitUnreadNotificationCount(notifications);
        const nextMsgRcvd = computeMsgRcvdUnreadNotificationCount(notifications);

        if (notificationBadgeCountsHydratedRef.current) {
            if (
                nextMitHex > lastSyncedMitHexRef.current ||
                nextMsgRcvd > lastSyncedMsgRcvdRef.current
            ) {
                emitHexagonShake();
            }
        } else {
            notificationBadgeCountsHydratedRef.current = true;
        }

        lastSyncedMitHexRef.current = nextMitHex;
        lastSyncedMsgRcvdRef.current = nextMsgRcvd;

        setMitNotificationUnreadCountState(nextMitHex);
        setMsgRcvdNotificationUnreadCountState(nextMsgRcvd);
        setNotificationUnreadCountState(nextTotal);
    }, []);

    const toggleOpened = React.useCallback(() => {
        setOpened(prev => !prev);
    }, []);

    const getAdjustedIconSize = React.useCallback((baseSize: number) => {
        const {width} = Dimensions.get('window');
        const adjustmentFactor = PixelRatio.get();

        const adjustedSize = baseSize * (isTablet() ? 1.5 : width > 400 ? 1.1 : 1) * adjustmentFactor;
        return Math.min(adjustedSize, baseSize * 1.5);
    }, []);

    const contextValue = React.useMemo(
        (): TabContextType => ({
            opened,
            toggleOpened,
            getAdjustedIconSize,
            refetchCrus,
            setRefetchCrus,
            refetchDates,
            setRefetchDates,
            refetchReadNotifications,
            setRefetchReadNotifications,
            refetchUnreadNotifications,
            setRefetchUnreadNotifications,
            deletedNotifications,
            setDeletedNotifications,
            updateMITs,
            setUpdateMITs,
            notificationUnreadCount,
            setNotificationUnreadCount,
            mitNotificationUnreadCount,
            setMitNotificationUnreadCount,
            msgRcvdNotificationUnreadCount,
            setMsgRcvdNotificationUnreadCount,
            syncNotificationBadgeCounts,
        }),
        [
            opened,
            toggleOpened,
            getAdjustedIconSize,
            refetchCrus,
            setRefetchCrus,
            refetchDates,
            setRefetchDates,
            refetchReadNotifications,
            setRefetchReadNotifications,
            refetchUnreadNotifications,
            setRefetchUnreadNotifications,
            deletedNotifications,
            setDeletedNotifications,
            updateMITs,
            setUpdateMITs,
            notificationUnreadCount,
            mitNotificationUnreadCount,
            msgRcvdNotificationUnreadCount,
            setNotificationUnreadCount,
            setMitNotificationUnreadCount,
            setMsgRcvdNotificationUnreadCount,
            syncNotificationBadgeCounts,
        ],
    );

    return <TabContext.Provider value={contextValue}>{children}</TabContext.Provider>;
};

/** Return the tab context from the nearest provider (Hermes-safe: no manual spread merge). */
export const UseTabMenu = (): TabContextType => React.useContext(TabContext);
