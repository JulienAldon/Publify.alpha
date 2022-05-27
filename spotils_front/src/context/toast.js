import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [ toastList, setToastList ] = useState([]);

    return (
        <ToastContext.Provider value={{ toastList, setToastList}}>
            { children }
        </ToastContext.Provider>
    );
};