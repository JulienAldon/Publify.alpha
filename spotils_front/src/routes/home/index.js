import { h } from 'preact';
import style from './style.css';

import { useEffect } from "react";
import { route } from 'preact-router';
import useUser from '../../hooks/useUser';
import HomeButton from '../../components/homeButton';
import settings from '../../settings';
import Loader from '../../components/loader';
import LoadError from '../../components/loadError';

function Home() {
	const { loading, user, mutate } = useUser();	
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
						title='Scanify'
					/>
					<HomeButton 
						link="/dashboard"
						icon='fas fa-search'
						title='Publify'
					/>
					<HomeButton 
						link="/analytics"
						icon='fas fa-chart-line'
						title='Statify'
					/>
				</div>
			</section>
		);
	}
	if (loading) {
		return <Loader></Loader>
	}
	return <LoadError></LoadError>;
}

export default Home;
