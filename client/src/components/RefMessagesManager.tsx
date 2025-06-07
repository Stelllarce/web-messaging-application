import React from "react"
import { createContext, useContext, useRef } from "react"
import type { ReactNode } from "react"

type TargetsType = {
  targetsRef: React.RefObject<Record<string, HTMLElement | null>>;
}

type RefManagerContextType = {
    registerPanel: (panelId: string,  panel: TargetsType) => void;
    unregisterPanel: (panelId: string) => void;
    getTarget: (panelId: string, targetId: string) => HTMLElement | undefined;
  };

const RefManagerContext = createContext<RefManagerContextType | null>(null);

export const RefManager = ({ children }: { children: ReactNode } ) => {
    const panelsRefs = useRef<Record<string, TargetsType>>({})

    const registerPanel = (panelId: string, targets: TargetsType) => {
        panelsRefs.current[panelId] = targets
    }

    const unregisterPanel = (panelId: string) => {
        delete panelsRefs.current[panelId]
    }

    const getTarget = (panelId: string, targetId: string) => {
        const panel = panelsRefs.current[panelId];
        if (panel && panel.targetsRef.current && panel.targetsRef.current[targetId]) {
            return panel.targetsRef.current[targetId];
        }
    }

    return (
        <RefManagerContext.Provider value = {{ registerPanel, unregisterPanel, getTarget }}>
            {children}
        </RefManagerContext.Provider>
    )
}

export const useRefManager = () => {
    const context = useContext(RefManagerContext)
    if(!context) {
        throw new Error("No context in RefManager.")
    }

    return context
}