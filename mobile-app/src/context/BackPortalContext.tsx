import React, { createContext, useContext, ReactNode } from 'react';

const BackPortalContext = createContext<(() => void) | null>(null);

export const BackPortalProvider = ({
  onBack, children,
}: { onBack: () => void; children: ReactNode }) => (
  <BackPortalContext.Provider value={onBack}>
    {children}
  </BackPortalContext.Provider>
);

export const useBackPortal = () => useContext(BackPortalContext);
