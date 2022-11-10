import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { createContext, useContext } from "react"

interface InitialStateProps {
    context: WebPartContext
}

const Context = createContext<InitialStateProps>(undefined)

export const WebPartContextProvider = ({ context, children }) =>
    <Context.Provider value={{ context }} children={children} />

export const useWebPartContext = () => useContext(Context)