import useSWR, { mutate } from 'swr';
import { useEffect, useState } from "preact/hooks";
import { useAuth } from '../../context/auth';
import { useToast } from '../../context/toast';

import Modal from '../../components/modal';
import Message from '../../components/message';
import useModal from '../../hooks/useModal';
import useMessage from '../../hooks/useMessage';
import { deleteLink, getPlaylists } from '../../api/';
import useUser from '../../hooks/useUser';
import { route } from 'preact-router';
import settings from '../../settings';
import style from './style.css';
import Loader from '../../components/loader';
import LoadError from '../../components/loadError';
import { useTransition, animated, config } from 'react-spring';

function Dashboard() {
	const { user, mutated } = useUser();

	useEffect(() => {
		if (!user) {
			route('/');
		}
	}, [user]);
	if (!user) 
		return <LoadError></LoadError>

	const { isShowing, toggle } = useModal();
	const { isShowingMessage, toggleMessage } = useMessage();
	const authContext = useAuth();
	const { toastList, setToastList } = useToast();
	const { data, error } = useSWR([`${settings.SERVICE_URI}/playlist`, authContext.token], getPlaylists);
	const [ links, setLinks ] = useState([]);
	const [ messageMode, setMessageMode ] = useState("");
	const [ messageTitle, setMessageTitle ] = useState("");
	const [ messageDescription, setMessageDescription ] = useState("");
	const [ toastDescription, setToastDescription ] = useState("");

	if (error) 
		return <LoadError></LoadError>
	if (!data || !data?.result || !data?.result?.links)
		return <Loader></Loader>

	const transitions = useTransition(links, {
		initial: { opacity: 1, marginTop: 0 },
		from: { opacity: 0, marginTop: 5 },
		enter: { opacity: 1, maxHeight: 50, marginTop: 5},
		leave: { opacity: 0, maxHeight: 0, marginTop: 0 },
		config: config.gentle,
	});

	setLinks(data.result.links);

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
					links.length == 0 ? <div className={style.nothing}>Add a link to get started</div> : 
						transitions((style, elem) => (
							<animated.tr style={style} className={style.item} id={elem.id}>
								<td className={style.playlistName} onClick={()=>{window.open("https://open.spotify.com/playlist/" + elem.collaborative.id, '_blank');}}> {elem.collaborative.name} </td>
								<td className={style.playlistName} onClick={()=>{window.open("https://open.spotify.com/playlist/" + elem.public.id, '_blank');}}> {elem.public.name}</td>
								<td class="item-actions actions">
									<Message
										isShowing={isShowingMessage}
										hide={toggleMessage}
										title={messageTitle}
										token={authContext.token}
										mode={messageMode}
										element={elem}
										description={messageDescription}
										toastDescription={toastDescription}
									/>
									<button onClick={ () => { 
										setMessageTitle("Backward synchronization");
										setMessageDescription("This will change the collaborative playlist copying public tracks into the collaborative playlist")
										setMessageMode("backward");
										setToastDescription("Successfully synchronized " + elem.public.name + " to " + elem.collaborative.name + " !")
										toggleMessage();
									}} title="Copy content of public playlist into collaborative playlist (backup mode)"><i id={`backward${elem.id}`} class="material-icons">arrow_back</i></button>
									<button onClick={ () => { 
										setMessageTitle("Forward synchronization");
										setMessageDescription("This will change the public playlist copying collaborative tracks into the public playlist.");
										setMessageMode("forward");
										setToastDescription("Successfully synchronized " + elem.collaborative.name + " to " + elem.public.name + " !")
										toggleMessage();
									}} title="Copy content of collaborative playlist into public playlist (Synchronize mode)"><i id={`forward${elem.id}`} class="material-icons">arrow_forward</i></button>
									<button onClick={ () => {
										document.getElementById("delete"+elem.id).classList.add("pending");
										mutate([`${settings.SERVICE_URI}/playlist/`, elem.id, authContext.token], deleteLink(`${settings.SERVICE_URI}/playlist/`, elem.id, authContext.token)).then(
											mutate([`${settings.SERVICE_URI}/playlist`, authContext.token]).then(() => {
												setToastList((toastList) => {return [...toastList, {
													id: elem.id,
													title: "Info",
													description: "The playlist link has been deleted !",
													backgroundColor: "#7DA641",
												}] });
											})
										)
									}} title="Delete the link between playlists"><i id={`delete${elem.id}`} class="danger material-icons">delete</i></button>
								</td>
							</animated.tr>
						))}
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
