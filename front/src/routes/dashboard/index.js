import useSWR, { mutate } from 'swr'
import { useEffect, useState } from "preact/hooks";
import { useAuth } from '../../context/auth';
import Modal from '../../components/modal';
import Message from '../../components/message';
import useModal from '../../hooks/useModal';
import useMessage from '../../hooks/useMessage';
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

	const { isShowing, toggle } = useModal();
	const { isShowingMessage, toggleMessage } = useMessage();
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

	const [ messageMode, setMessageMode ] = useState("");
	const [ messageTitle, setMessageTitle ] = useState("");
	const [ messageDescription, setMessageDescription ] = useState("");
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
								<Message
									isShowing={isShowingMessage}
									hide={toggleMessage}
									title={messageTitle}
									token={authContext.token}
									mode={messageMode}
									element={elem}
									description={messageDescription}
								/>
									<button onClick={ () => { 
										setMessageTitle("Backward synchronization");
										setMessageDescription("This will change the collaborative playlist copying public tracks into collaborative playlist")
										setMessageMode("backward")
										toggleMessage();
										
									}} title="Copy content of public playlist into collaborative playlist (backup mode)"><i id={`backward${elem.id}`} class="material-icons">arrow_back</i></button>
									<button onClick={ () => { 
										setMessageTitle("Forward synchronization");
										setMessageDescription("This will change the public playlist copying collaborative tracks into public playlist.")
										setMessageMode("forward")
										toggleMessage();									
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
				isShowing={ isShowing }
				hide={ toggle }
				data={ data }
			/>
			<footer class="actions">
			<button id="new-button" onClick={ toggle }><i class="material-icons" title="Add a new link">add_circle_outline</i></button>
			</footer>
		</main>
	);
}

export default Dashboard;
