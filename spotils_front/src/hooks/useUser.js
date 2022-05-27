import { useContext } from "preact/hooks";
import useSWR from "swr";
import { useAuth } from "../context/auth";
import Cookies from 'js-cookie';
import settings from '../settings';

const userFetcher = async (url, token) => {
    const res = await fetch(url, {
        method: 'GET',
		headers: {"Authorization": "Bearer " + token},
    });
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.')
        // Attach extra info to the error object.
        error.info = await res.json()
        error.status = res.status
        throw error
    }
    return res.json()
}

export default function useUser() {
    const authContext = useAuth();
    authContext.token = Cookies.get('userToken', { domain: `.${settings.COOKIE_DOMAIN}`});
    const { data, error, mutate } = useSWR(
        [`${settings.SERVICE_URI}/api/auth/user`, authContext.token],
        userFetcher
    );
    
    const loading = !data && !error;
    const loggedOut = error && error.status === 403;
    return {
        loading,
        loggedOut,
        user: data,
        mutate
    };
}