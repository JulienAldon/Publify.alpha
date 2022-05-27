import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';
import { useAuth } from '../../context/auth'
import useUser from '../../hooks/useUser';
import Cookies from 'js-cookie';
import { useEffect, useReducer } from 'preact/hooks';
import { mutate } from 'swr';
import { route } from 'preact-router';
import settings from '../../settings';

function logout() {
	Cookies.remove('userToken', { domain: `.${settings.ROOT_FQDN}`});
	route('/');
}
function login() {
	window.location.replace(`${settings.SERVICE_URI}/api/auth/login`);
}

function Header() {
	const authContext = useAuth();
	const { user, loading, loggedOut, mutate } = useUser();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		if (params.get("token")) {
			Cookies.set('userToken', params.get("token"), { domain: `.${settings.ROOT_FQDN}`, secure: true});
			authContext.token = Cookies.get('userToken', { domain: `.${settings.ROOT_FQDN}`});
		}
	});

	return (
		<header>
			<h1><a href="/radio">Spotils</a> // <a href="/dashboard">Publify</a></h1>
			<a href="/">Home</a>
			<a href="/about">About</a>
			<aside>
				{
					user ?
					<button onClick={() => {logout(); authContext.token = "null";}}>Log Out</button> : 
					<button onClick={login}>Log in with Spotify</button> 
				}
			</aside>
		</header>
	);
}

export default Header;
