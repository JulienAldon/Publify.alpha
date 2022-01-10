import useSWR, { mutate } from 'swr'
import { useEffect, useState } from "react";
import { route } from 'preact-router';
import useUser from '../../hooks/useUser';
import settings from '../../settings';
import style from './style.css';
import { useAuth } from '../../context/auth';
import Loader from '../../components/loader';
import LoadError from '../../components/loadError';
import { getPlaylists } from '../../api/';

function Analytics() {
	const { user, mutated } = useUser();
	useEffect(() => {
		if (!user) {
			route('/')
		}
	}, [user]);
	if (!user) 
		return <LoadError></LoadError>	
	const authContext = useAuth();

	const { data, error } = useSWR([`${settings.SERVICE_URI}/playlist`, authContext.token], getPlaylists)
	if (error) 
		return <LoadError></LoadError>
	if (!data) 
		return <Loader></Loader>

	const [ loadingElem, setLoadingElem ] = useState();
	const [ message, setMessage ] = useState({"data": {}});
    const [ selectedPlaylist, setSelectedPlaylist ] = useState({"name": "", "id": ""})


	const playlists = data.result.collaborative.concat(data.result.public, data.result.watched)

	return (
		<div className={style.analytic}>
			<main>
				<h1>Analytics</h1>
				<form>
					<ul>
						{ playlists.map((elem, index) => {
							return (
								<li>
									<input onChange={ () => { setSelectedPlaylist({"name": elem.name, "id":elem.id}) } } name="playlists" value={elem.name} id={elem.id} type="radio"/>
									<label for={elem.id}>{elem.name}</label>
									<button onClick={ () => {
										const el = document.getElementById('compute'+elem.id)
										el.classList.add("pending");
										// create analytics
									}} type="button" title="Create analitycs for this playlist"><i id={"compute"+elem.id} class="material-icons">arrow_forward</i></button>
								</li>
							)})
						}
					</ul>
				</form>
				<footer class="item-actions-radio actions-radio">
					{/* <button id="new-confirm-button" onClick={ () => {
						const pls = document.getElementsByName("playlists")
						var i;
						for (i = 0; i < pls.length; i++) {
							pls[i].checked = false;
						}
						setSelectedPlaylist({"name": "", "id": ""})
						const elem = document.getElementById("new-confirm-button")
						elem.classList.add("rotate-infinite");
						elem.lastElementChild.classList.add("pending");
						// create analytics
						setLoadingElem(elem);
					}}><i id="add-btn" class="material-icons">add_circle_outline</i></button> */}
				</footer>
			</main>
			<main>
				<h1>Result</h1>
			</main>
		</div>
	);
}

export default Analytics;
