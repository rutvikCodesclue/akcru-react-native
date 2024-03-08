import React from 'react';
import {PixelRatio, Dimensions} from 'react-native';

interface TabContextType {
    opened: boolean;
    toggleOpened: () => void;
    getAdjustedIconSize: (baseSize: number) => number; // Function to calculate adjusted icon size

    refetchCrus: boolean; // Add this line
    setRefetchCrus: (value: boolean) => void; // And this one

    refetchDates: boolean;
    setRefetchDates: (value: boolean) => void; 
}

const TabContext = React.createContext<TabContextType>({
    opened: false,
    toggleOpened: () => {},
    getAdjustedIconSize: (baseSize: number) => baseSize, // Default implementation

    refetchCrus: false, // Default value for refetchCrus
    setRefetchCrus: () => {}, // Default implementation (noop function) for setRefetchCrus

    refetchDates: false, // Default value for refetchCrus
    setRefetchDates: () => {}, // Default implementation (noop function) for setRefetchCrus
});

// const TabContext = React.createContext({opened: false, toggleOpened: () => {}});

export const TabContextProvider = ({children}: {children: React.ReactNode}) => {
    const [opened, setOpened] = React.useState(false);

    const [refetchCrus, setRefetchCrus] = React.useState(false); // Add this line

    const [refetchDates, setRefetchDates] = React.useState(false); // Add this line

    const toggleOpened = () => {
        setOpened(!opened);
        // console.log('Toggling opened state');
    };

    // Function to dynamically calculate icon size
    const getAdjustedIconSize = (baseSize: number) => {
        // You can adjust this logic to fit your needs
        const {width} = Dimensions.get('window');
        const adjustmentFactor = PixelRatio.get(); // Get device's pixel density
        // Adjust the base size based on the width or density
        const adjustedSize = baseSize * (width > 400 ? 1.1 : 1) * adjustmentFactor;
        return Math.min(adjustedSize, baseSize * 1.5); // Example cap to 1.5 times the base size
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
            }}>
            {children}
        </TabContext.Provider>
    );
};

export const UseTabMenu = () => React.useContext(TabContext);