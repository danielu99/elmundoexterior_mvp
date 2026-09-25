import {
    useEffect,
    useState
} from "react";

function useLoadingState(
    loading,
    {
        loaderDelay = 300,
        slowDelay = 2000
    } = {}
) {

    const [showLoader,
        setShowLoader] =
        useState(false);

    const [showSlowMessage,
        setShowSlowMessage] =
        useState(false);

    useEffect(() => {

        let loaderTimer;
        let slowTimer;

        if (loading) {

            loaderTimer =
                setTimeout(
                    () => {
                        setShowLoader(true);
                    },
                    loaderDelay
                );

            slowTimer =
                setTimeout(
                    () => {
                        setShowSlowMessage(true);
                    },
                    slowDelay
                );

        } else {

            setShowLoader(false);

            setShowSlowMessage(false);

        }

        return () => {

            clearTimeout(
                loaderTimer
            );

            clearTimeout(
                slowTimer
            );

        };

    }, [
        loading,
        loaderDelay,
        slowDelay
    ]);

    return {
        showLoader,
        showSlowMessage
    };
}

export default useLoadingState;