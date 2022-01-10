import { h } from 'preact';
import style from './style.css';

import { useEffect } from "react";
import { route } from 'preact-router';
import useUser from '../../hooks/useUser';
import HomeButton from '../../components/homeButton';
import settings from '../../settings';
import Loader from '../../components/loader';

function Home() {
	const { loading, user, mutate } = useUser();

	function login() {
		window.location.replace(`${settings.SERVICE_URI}/api/auth/login`);
	}
	
	useEffect(() => {
	}, [user]);

	if (user) {
		return (
			<section className={style.content}>
				<h1 className={style.title}>Welcome to Spotils</h1>
				<div className={style.choice}>
					<HomeButton 
						link="/radio"
						icon='fas fa-broadcast-tower'
						title='Radio'
					/>
					<HomeButton 
						link="/dashboard"
						icon='fas fa-search'
						title='Dashboard'
					/>
					<HomeButton 
						link="/analytics"
						icon='fas fa-chart-line'
						title='Analytics'
					/>
				</div>
			</section>
		);
	}
	if (loading) {
		return <Loader></Loader>
	}
	return (
		<main>
			<h1 className={style.title}>Welcome to Spotils</h1>
			<h2 style="text-align:center;">Login with spotify to use the tools.</h2>
			<button className={style.loginButton} onClick={login}>Login</button>
		</main>
	);
}

export default Home;
