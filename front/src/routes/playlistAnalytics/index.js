import { route } from "preact-router";
import { getPlaylistAnalytic, getPlaylistInfos, getUsersInfo } from '../../api/';
import { useAuth } from "../../context/auth";

import useUser from '../../hooks/useUser';
import settings from '../../settings';
import Loader from '../../components/loader';
import Chart from '../../components/chart';
import LoadError from '../../components/loadError';
import { useEffect, useMemo } from "react";
import useSWR, { mutate } from 'swr';
import style from './style.css';

function PlaylistAnalytics() {
	const { user, mutated } = useUser();
    // useEffect(() => {
	// 	if (!user) {
	// 		route('/')
	// 	}
	// }, [user]);
	if (!user) 
		return <LoadError></LoadError>
    
    let id = window.location.pathname.slice(11);
    const authContext = useAuth();
    const { data, error } = useSWR([`${settings.SERVICE_URI}/playlist-info/`, id, authContext.token], getPlaylistInfos);
    const { data: analytic, error: analyticError } = useSWR([`${settings.SERVICE_URI}/playlist/${id}/graph`, authContext.token], getPlaylistAnalytic);
    const { data: users, error: usersError } = useSWR([`${settings.SERVICE_URI}/users/${id}`, authContext.token], getUsersInfo);
    if (error || analyticError || usersError)
        return <LoadError></LoadError>
    if (!data || !analytic || !users)
        return <Loader></Loader>
    return (
        <main>
            <button onClick={() => {
                route('/analytics');
            }}><i class="material-icons">arrow_back</i></button>
            <h1 className={style.title}>{data.name}</h1>
            <Chart analytic={analytic} users_p={users}/>
        </main>
    );
} 

export default PlaylistAnalytics;