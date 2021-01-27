import { createContext } from "preact";
import { useState, useContext } from "preact/hooks";

export const authContextTemplate = {
    token: "",
    isLogged: false,
}

export const AuthContext = createContext(authContextTemplate);


function useAuth() {
    const context = useContext(AuthContext)
    if (AuthContext === undefined) {
        throw new Error ('Context Provider is missuing')
    }
    return context
}

export default AuthContext
export { useAuth }