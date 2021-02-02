import { useState } from "preact/hooks";

const useMessage = () => {
    const [isShowingMessage, setIsShowingMessage] = useState(false)
    
    function toggleMessage() {
        setIsShowingMessage(!isShowingMessage)
    }

    return {
        isShowingMessage,
        toggleMessage
    }
};

export default useMessage;