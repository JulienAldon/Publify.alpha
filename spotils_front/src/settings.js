
import process from 'process';

let settings = {
    COOKIE_DOMAIN: "",
    SERVICE_URI: ""
}
// "process.env.REACT_APP_ENV"
console.log(process.env.REACT_APP_ENV);
switch (process.env.REACT_APP_ENV) {
    case "prod":
        settings.COOKIE_DOMAIN = "publify.aldon.info";
        settings.SERVICE_URI = "https://auth.publify.aldon.info";
        break;
    case "dev":
        settings.COOKIE_DOMAIN = "localhost";
        settings.SERVICE_URI = "http://localhost:8000";
        break;
    case "env":
        settings.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN
        settings.SERVICE_URI = process.env.SERVICE_URI
        break
    case "localhost":
    default:
        settings.COOKIE_DOMAIN = "localhost";
        settings.SERVICE_URI = "http://localhost:8000";
        break;
}

export default settings;