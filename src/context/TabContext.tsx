import React from 'react';
import {PixelRatio, Dimensions} from 'react-native';

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
}

const TabContext = React.createContext<TabContextType>({
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
});

export const TabContextProvider = ({children}: {children: React.ReactNode}) => {
    const [opened, setOpened] = React.useState(false);

    const [refetchCrus, setRefetchCrus] = React.useState(false);

    const [refetchDates, setRefetchDates] = React.useState(false);

    const [refetchReadNotifications, setRefetchReadNotifications] = React.useState(false);

    const [refetchUnreadNotifications, setRefetchUnreadNotifications] = React.useState(false);

    const [deletedNotifications, setDeletedNotifications] = React.useState(false);

    const [updateMITs, setUpdateMITs] = React.useState(false);

    const toggleOpened = () => {
        setOpened(!opened);
    };

    const getAdjustedIconSize = (baseSize: number) => {
        const {width} = Dimensions.get('window');
        const adjustmentFactor = PixelRatio.get();

        const adjustedSize = baseSize * (width > 400 ? 1.1 : 1) * adjustmentFactor;
        return Math.min(adjustedSize, baseSize * 1.5);
    };

    return (
        <TabContext.Provider
            value={{
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
            }}>
            {children}
        </TabContext.Provider>
    );
};

export const UseTabMenu = () => React.useContext(TabContext);
