import { h } from 'preact';
import { Router } from 'preact-router';
import Header from './header';
import AuthContext, { authContextTemplate } from '../context/auth'
// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Dashboard from '../routes/dashboard';
import About from '../routes/about';
import Radio from '../routes/radio';

const App = () => (
		<AuthContext.Provider value={authContextTemplate}>
			<div id="app">
				<Header />
				<Router>
					<Home path="/" />
					<Dashboard path="/dashboard" />
					<About path="/about"/>
					<Radio path="/radio" />
				</Router>
			</div>
		</AuthContext.Provider>
)

export default App;
