import useSWR, { mutate } from 'swr';
import { useEffect, useState } from "react";
import { route } from 'preact-router';
import useUser from '../../hooks/useUser';
import settings from '../../settings';
import style from './style.css';
import { useAuth } from '../../context/auth';
import { useToast } from '../../context/toast';
import Loader from '../../components/loader';
import LoadError from '../../components/loadError';
import { getPlaylists } from '../../api/';

function Analytics() {
	const { user, mutated } = useUser();
	const [ loadingElem, setLoadingElem ] = useState();
	const [ message, setMessage ] = useState({"data": {}});
    const [ selectedPlaylist, setSelectedPlaylist ] = useState([{"name": "", "id": ""}])
	const { toastList, setToastList } = useToast()
	if (!user) 
		return <LoadError></LoadError>	

	const authContext = useAuth();
	const { data, error } = useSWR([`${settings.SERVICE_URL}/playlist`, authContext.token], getPlaylists)
	if (error) 
		return <LoadError></LoadError>
	if (!data || !data?.result || !data?.result?.collaborative || !data?.result?.watched || !data?.result?.public) 
		return <Loader></Loader>

	const playlists = data.result.collaborative.concat(data.result.public, data.result.watched)

	return (
		<main>
			<h1>Analytics</h1>
			<form>
				<ul>
					{ playlists.map((elem, index) => {
						return (
							<li>
								<label for={elem.id}>{elem.name}</label>
								<button onClick={ () => {
									const el = document.getElementById('compute'+elem.id)
									el.classList.add("pending");
									route("/analytics/" + elem.id);
								}} class="item-actions actions" type="button" title="Create analitycs for this playlist">
									<i id={"compute"+elem.id} style="display:flex; align-items: center; justify-content: center;" class="material-icons">arrow_forward</i>
								</button>
							</li>
						)})
					}
				</ul>
			</form>
		</main>
	);
}

export default Analytics;
