import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { getPlaylistAnalytic, getPlaylistInfos, getUsersInfo } from '../../api/';
import { useAuth } from "../../context/auth";

import useUser from '../../hooks/useUser';
import settings from '../../settings';
import Loader from '../../components/loader';
import Chart from '../../components/chart';
import LoadError from '../../components/loadError';
import useSWR, { mutate } from 'swr';
import style from './style.css';
import Select from "../../components/select";

function PlaylistAnalytics() {
	const { user, mutated } = useUser();
    const authContext = useAuth();
	if (!user) 
		return <LoadError></LoadError>

        const [ graphType, setGraphType ] = useState("None");
    const { data, error } = useSWR([`${settings.SERVICE_URL}/playlist-info/`, window.location.pathname.slice(11), authContext.token], getPlaylistInfos);
    const { data: analytic, error: analyticError } = useSWR([`${settings.SERVICE_URL}/playlist/${window.location.pathname.slice(11)}/graph${graphType != 'None' ? '?graph_type='+graphType : ""}`, authContext.token], getPlaylistAnalytic);
    const { data: users, error: usersError } = useSWR([`${settings.SERVICE_URL}/users/${window.location.pathname.slice(11)}`, authContext.token], getUsersInfo);
    if (!data || !analytic || !users)
        return <Loader></Loader>
    if (error || analyticError || usersError)
        return <LoadError></LoadError>

    return (
        <main style="margin-bottom: 1rem">
            <button onClick={() => {
                route('/analytics');
            }}><i class="material-icons">arrow_back</i></button>
            <h1 className={style.title}>{data.name}</h1>
            <Select
                options={['None', 'acousticness', 'danceability', 'energy', 'instrumentalness', 'liveness', 'speechiness', 'valence']}
                current={graphType}
                onChange={(ev) => {
                    setGraphType(ev.target.value);
                }}
            />
            <Chart analytic={analytic} users={users}/>
        </main>
    );
} 

export default PlaylistAnalytics;