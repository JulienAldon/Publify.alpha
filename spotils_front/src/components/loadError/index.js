import style from './style.css';
import settings from '../../settings';

function login() {
    window.location.replace(`${settings.SERVICE_URL}/api/auth/login`);
}

function LoadError({}) {
    return (
        <main>
            <h1 className={style.title}>Welcome to Spotils</h1>
            <h2 style="text-align:center;">Login with spotify to use the tools.</h2>
            <button className={style.loginButton} onClick={login}>Login</button>
        </main>
    );
} 

export default LoadError