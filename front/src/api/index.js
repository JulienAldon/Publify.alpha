import { mutate } from "swr";
import settings from '../settings';

function createLink(token, body, setToastList, toastList, id) {
	return fetch(`${settings.SERVICE_URI}/playlist`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
		},
		body: JSON.stringify(body)
	}).then((r) => {
		mutate([`${settings.SERVICE_URI}/playlist`, token]).then(() => {
			setToastList((toastList) => {return [...toastList, {
				id: id,
				title: "Info",
				description: "The playlist link has been added !",
				backgroundColor: "#7DA641",
			}]});
		})
		return r.json()
	}).catch((err) => {
		setToastList([...toastList, {
			id: id,
			title: "Alert",
			description: "Could not add specified link !",
			backgroundColor: "#d9534f",
		}]);
	});
}

function syncPlaylist(id, token, mode, elem) {
	return fetch(`${settings.SERVICE_URI}/playlist/` + id + '/sync?mode=' + mode, {
		method: 'PUT',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
		}
	}).then((r) => {
		elem.classList.remove('pending');
		elem.classList.add('success');
		return r.json()
	})
}

function createRadio(token, selected, setMessage) {
	const bd = {
		"playlist_id": selected.id,
		"playlist_name": selected.name
	}
	return fetch(`${settings.SERVICE_URI}/radio`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
		},
		body: JSON.stringify(bd)
	}).then(r => {
		return r.json()
	}).then(t => {
		if (t && t.detail) {
			setMessage({'data': {'error': t.detail}})
		}
		else {
			setMessage(t);
		}
	})
}

function deleteLink(url, id, token) {
	return fetch(url + id, {
		method: 'DELETE',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
		}
	}).then((r) => {
		return r.json()
	}).catch(err => {
		const error = new Error("Not authorized!")
		error.status = 403;
		throw error;
	})
}

function getPlaylists(url, token) {
	return fetch(url, {
		method: 'GET',
		headers: {"Authorization": "Bearer " + token}
	}).then((r) => {
		return r.json()
	}).catch(err => {
		const error = new Error("Not authorized!");
		error.status = 403;
		throw error;
	})
}

function getPlaylistInfos(url, id, token) {
	return fetch(url + id, {
		method: 'GET',
		headers: {"Authorization": "Bearer " + token}
	}).then((r) => {
		return r.json()
	}).catch(err => {
		const error = new Error("Not authorized!");
		error.status = 403;
		throw error;
	})
}

function getPlaylistAnalytic(url, token) {
	return fetch(url, {
		method: 'GET',
		headers: {'Authorization': "Bearer " + token}
	}).then((r) => {
		return r.json();
	}).catch(err => {
		const error = new Error("Not authorized!");
		error.status = 403;
		throw error;
	})
}

function getUsersInfo(url, token) {
	return fetch(url, {
		method: 'GET',
		headers: {'Authorization': "Bearer " + token}
	}).then((r) => {
		return r.json()
	}).catch(err => {
		const error = new Error("Not authorized");
		error.status = 403;
		throw error;
	})
}

export {
	createLink,
	deleteLink,
	syncPlaylist,
	createRadio,
	getPlaylists,
	getPlaylistInfos,
	getPlaylistAnalytic,
	getUsersInfo
}