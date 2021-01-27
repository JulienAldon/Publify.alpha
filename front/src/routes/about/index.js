import { h } from 'preact';
import style from './style.css';

const About = () => (
	<main>
		<h1>About</h1>
		<article>
			<h2>Publify</h2>
			<p>Synchronize collaborative Spotify playlists to public ones to coauthor them without allowing everyone to edit your playlist.</p>
		</article>
		<article>
			<h2>Radio</h2>
			<p>Create a spotify playlist containing new titles from all artists of a given spotify playlist.</p>
		</article>
		<footer>
			<p>Application made with Preact and FastAPI by Julien Aldon</p>
			<p>Design made by Sowlipsism</p>
		</footer>
	</main>
);

export default About;
