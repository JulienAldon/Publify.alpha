import { cpuUsage } from "process";
import { mutate } from "swr"
import settings from '../settings';
function createLink(token, body) {
	fetch(`${settings.SERVICE_URI}/playlist`, {
		method: 'POST',
		headers: {"Authorization": "Bearer " + token},
		body: JSON.stringify(body)
	}).then((r) => {
		mutate(`${settings.SERVICE_URI}/playlist`);
		return r.json()
	})
}

function syncPlaylist(id, token, mode, elem) {
	fetch(`${settings.SERVICE_URI}/playlist/` + id + '/sync?mode=' + mode, {
		method: 'PUT',
		headers: {"Authorization": "Bearer " + token}
	}).then((r) => {
		elem.classList.remove('pending')
		elem.classList.add('success')
		return r.json()
	})
}

function createRadio(token, selected, setMessage) {
	const body = {
		"playlist_id": selected.id,
		"playlist_name": selected.name,
	}
	fetch(`${settings.SERVICE_URI}/radio`, {
		method: 'POST',
		headers: {"Authorization": "Bearer " + token},
		body: JSON.stringify(body)
	}).then((r) => {
		return r.json()
	}).then(data => {
		console.log(data.data);
		setMessage(data);
	})
}

function deleteLink(id, token) {
	fetch(`${settings.SERVICE_URI}/playlist/` + id, {
		method: 'DELETE',
		headers: {"Authorization": "Bearer " + token}
	}).then((r) => {
		mutate(`${settings.SERVICE_URI}/playlist`);
		return r.json()
	})
}

export {
	createLink,
	deleteLink,
	syncPlaylist,
	createRadio
}