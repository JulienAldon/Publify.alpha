import { useAuth } from '../../context/auth';
import { useToast } from '../../context/toast';
import useUser from '../../hooks/useUser';
import useMessage from '../../hooks/useMessage';
import Alert from '../../components/alert';
import { useState, useEffect } from "preact/hooks";
import style from './style.css';
import useSWR from 'swr'
import settings from '../../settings';
import { createRadio, getPlaylists } from '../../api';
import Loader from '../../components/loader';
import LoadError from '../../components/loadError';

function Radio() {
	const [ selectedPlaylist, setSelectedPlaylist ] = useState({"name": "", "id": ""});
	const [ message, setMessage ] = useState({"data": {}});
	const [ loadingElem, setLoadingElem ] = useState();
	const [ txtFormatTitle , setTxtFormatTitle ] = useState();
	const [ txtFormatDescr , setTxtFormatDescr ] = useState();
	const { isShowingMessage, toggleMessage } = useMessage();
	const { user, mutate } = useUser();
	const { toastList, setToastList } = useToast();
	if (!user)
		return <LoadError></LoadError>
	
	useEffect(() => {
		if (!user) {
			route('/')
		}
	}, [user]);
	
	useEffect(() => {
		if (message.data.playlist_name !== undefined || message.data.data) {
			toggleMessage();
			loadingElem.classList.remove('rotate-infinite');
			loadingElem.lastElementChild.classList.remove("pending");
			loadingElem.lastElementChild.classList.add("success");
			setTxtFormatTitle("A new playlist has been created.");
			setTxtFormatDescr(`The radio found ${message.data.tracks_number} new tracks released in the past ${message.data.date} days. And created the playlist ${message.data.playlist_name}`);
			setToastList(() => {
				return [...toastList, {
					id: message.data.date,
					title: "Info",
					description: "Successfully created radio for " + message.data.playlist_name + " !" ,
					backgroundColor: "#7DA641",
				}]
			})
			setTimeout(function(loadingElem) {
				loadingElem.lastElementChild.classList.remove("success");
			}, 3000, loadingElem);
		} else if (message.data.error) {
			toggleMessage();
			loadingElem.classList.remove('rotate-infinite');
			loadingElem.lastElementChild.classList.remove("pending");
			loadingElem.lastElementChild.classList.add("warning");
			setTxtFormatTitle(`${message.data.error}`);
			setTxtFormatDescr(`The spotils radio utility could not define new songs from this playlist. Problem: ${message.data.error}`);
			setToastList(() => {
				return [...toastList, {
					id: message.data.date,
					title: "Alert",
					description: "Radio could not be created !" ,
					backgroundColor: "#A65041",
				}]
			})
			setTimeout(function(loadingElem) {
				loadingElem.lastElementChild.classList.remove("warning");
			}, 3000, loadingElem);
		}
	}, [message]);

	const authContext = useAuth();

	const { data, error } = useSWR([`${settings.SERVICE_URI}/playlist`, authContext.token], getPlaylists)

	if (error) 
		return <LoadError></LoadError>
	if (!data) 
		return <Loader></Loader>
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
			<Alert
				isShowing={isShowingMessage}
				hide={toggleMessage}
				title={txtFormatTitle}
				description={txtFormatDescr}
			/>
			<footer class="item-actions-radio actions-radio">
				<button id="new-confirm-button" onClick={ () => {
					const pls = document.getElementsByName("playlists")
					var i;
					for (i = 0; i < pls.length; i++) {
						pls[i].checked = false;
					}
					setSelectedPlaylist({"name": "", "id": ""})
					const elem = document.getElementById("new-confirm-button")
					elem.classList.add("rotate-infinite");
					elem.lastElementChild.classList.add("pending");
					createRadio(authContext.token, selectedPlaylist, setMessage);
					setLoadingElem(elem);
				}}><i id="add-btn" class="material-icons">add_circle_outline</i></button>
			</footer>
		</main>
	);
}

export default Radio;
