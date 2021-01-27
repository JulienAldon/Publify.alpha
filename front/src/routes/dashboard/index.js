import useSWR, { mutate } from 'swr'
import { useEffect } from "preact/hooks";
import { useAuth } from '../../context/auth';
import Modal from '../../components/modal';
import useModal from '../../hooks/useModal';
import { syncPlaylist, deleteLink } from '../../api/';
import useUser from '../../hooks/useUser';
import { route } from 'preact-router';
import settings from '../../settings';

function Dashboard() {
	const { user, mutate } = useUser();
	useEffect(() => {
		if (!user) {
			route('/')
		}
	}, [user]);
	if (!user) 
		return <main><h1>failed to load</h1></main>

	const {isShowing, toggle} = useModal();
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
	return (
		<main>
			<table>
				<thead>
					<tr>
						<th>Contributive Playlist</th>
						<th>Public Playlist</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{ 
					data.result.links.map((elem, index) => {
						return (
							<tr>
								<td> {elem.collaborative.name} </td>
								<td> {elem.public.name}</td>
								<td class="item-actions actions">
									<button onClick={ () => { 
										document.getElementById("backward"+elem.id).classList.add("pending"); 
										syncPlaylist(elem.id, authContext.token, "backward", document.getElementById("backward"+elem.id))
									}} title="Copy content of public playlist into collaborative playlist (backup mode)"><i id={`backward${elem.id}`} class="material-icons">arrow_back</i></button>
									<button onClick={ () => { 
										document.getElementById("forward"+elem.id).classList.add("pending");
										syncPlaylist(elem.id, authContext.token, "forward", document.getElementById("forward"+elem.id)) 
									}} title="Copy content of collaborative playlist into public playlist (Synchronize mode)"><i id={`forward${elem.id}`} class="material-icons">arrow_forward</i></button>
									<button onClick={ () => { 
										document.getElementById("delete"+elem.id).classList.add("pending"); 
										mutate(`${settings.SERVICE_URI}/playlist`, deleteLink(elem.id, authContext.token)) 
									}} title="Delete the link between playlists"><i id={`delete${elem.id}`} class="danger material-icons">delete</i></button>
								</td>
							</tr>
						)}
					)}
				</tbody>
			</table>
			<Modal
				isShowing={isShowing}
				hide={toggle}
				data={data}
			/>
			<footer class="actions">
			<button id="new-button" onClick={toggle}><i class="material-icons" title="Add a new link">add_circle_outline</i></button>
			</footer>
		</main>
	);
}

export default Dashboard;
