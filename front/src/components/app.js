import { Router } from 'preact-router';
import Header from './header';
import AuthContext, { authContextTemplate } from '../context/auth';
import { ToastProvider } from '../context/toast';
import Home from '../routes/home';
import Dashboard from '../routes/dashboard';
import About from '../routes/about';
import Radio from '../routes/radio';
import Analytics from '../routes/analytics';
import Toast from './toast';

function App() {		
	return (
		<AuthContext.Provider value={authContextTemplate}>
			<ToastProvider>
				<div id="app">
					<Header />
					<Router>
						<Home path="/" />
						<Dashboard path="/dashboard"/>
						<About path="/about"/>
						<Radio path="/radio"/>
						<Analytics path="/analytics"/>
					</Router>
					<Toast 
						position="bottom-right"
					/>
				</div>
			</ToastProvider>
		</AuthContext.Provider>
	);
}

export default App;
