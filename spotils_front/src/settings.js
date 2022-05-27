
import process from 'process';

let settings = {
    COOKIE_DOMAIN: "",
    SERVICE_URL: ""
}

switch (process.env.REACT_APP_ENV) {
    case "env":
        settings.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
        settings.SERVICE_URL = process.env.SERVICE_URL
        break
    case "localhost":
    default:
        settings.COOKIE_DOMAIN = "localhost";
        settings.SERVICE_URL = "http://localhost:8000";
        break;
}

export default settings;