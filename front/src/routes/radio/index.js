import { useAuth } from '../../context/auth';
import useUser from '../../hooks/useUser';
import { useState, useEffect } from "preact/hooks";
import style from './style.css';
import useSWR from 'swr'
import settings from '../../settings';
import { createRadio } from '../../api';

function Radio() {
	const [ selectedPlaylist, setSelectedPlaylist ] = useState({"name": "", "id": ""});
	const { user, mutate } = useUser();
	if (!user)
		return <main><h1>failed to load</h1></main>
	
	useEffect(() => {
		if (!user) {
			route('/')
		}
	}, [user]);
	
	const authContext = useAuth();

	const getPlaylists = (url) => fetch(url, {
		method: 'GET',
		headers: {"Authorization": "Bearer " + authContext.token}
	}).then((r) => {
		return r.json()
	}).catch(err => {
		const error = new Error("Not authorized!");
        error.status = 403;
        throw error;
	})
	const { data, error } = useSWR(`${settings.SERVICE_URI}/playlist`, getPlaylists)

	if (error) 
		return <main><h1>failed to load</h1></main>
	if (!data) 
		return <main><h1>loading...</h1></main>
	const playlists = data.result.collaborative.concat(data.result.public, data.result.watched)

	return (
		<main>
			<h1>Radio</h1>
			<form>
				<ul>
					{ playlists.map((elem, index) => {
						return (
							<li>
								<input onChange={ () => { setSelectedPlaylist({"name": elem.name, "id":elem.id}) } } name="playlists" value={elem.name} id={elem.id} type="radio"/>
								<label for={elem.id}>{elem.name}</label>
							</li>
						)})
					}
				</ul>
			</form>
			<footer class="actions">
				<button id="new-confirm-button" onClick={ () => {
					const pls = document.getElementsByName("playlists")
					var i;
					for (i = 0; i < pls.length; i++) {
						pls[i].checked = false;
					}
					setSelectedPlaylist({"name": "", "id": ""})
					const elem = document.getElementById("new-confirm-button")
					elem.classList.add("rotate");
					createRadio(authContext.token, selectedPlaylist, elem)
				}}><i id="add-btn" class="material-icons">add_circle_outline</i></button>
			</footer>
		</main>
	);
}

export default Radio;
