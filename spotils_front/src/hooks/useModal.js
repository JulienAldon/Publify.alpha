import { useState } from "preact/hooks";

const useModal = () => {
    const [isShowing, setIsShowing] = useState(false)
    
    function toggle() {
        setIsShowing(!isShowing)
    }

    return {
        isShowing,
        toggle
    }
};

export default useModal;