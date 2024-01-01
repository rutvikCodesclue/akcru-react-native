import React from 'react';

const TabContext = React.createContext({opened: false, toggleOpened: () => {}});

export const TabContextProvider = ({children}: {children: React.ReactNode}) => {
    const [opened, setOpened] = React.useState(false);

    const toggleOpened = () => {
        setOpened(!opened);
        console.log('Toggling opened state');
    };

    return <TabContext.Provider value={{opened, toggleOpened}}>{children}</TabContext.Provider>;
};

export const UseTabMenu = () => React.useContext(TabContext);