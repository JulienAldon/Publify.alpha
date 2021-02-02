import { h } from 'preact';
import style from './style.css';

import { useEffect } from "react";
import {route} from 'preact-router';
import useUser from '../../hooks/useUser';

function Home() {
	const { user, mutate } = useUser();
	
	useEffect(() => {
	}, [user]);
	if (user) {
		return (
			<main >
				<h1>Use the tools here !</h1>
				<div className={style.choice}>
					<a className={style.tool} href="/radio">Radio</a>
					<a className={style.tool} href="/dashboard">Publify</a>
				</div>
			</main>
		);
	}
	return (
		<main>
			<h1>Welcome to publify</h1>
			<h2 style="text-align:center;">Login with spotify to use the tools.</h2>
		</main>
	);
}

export default Home;
