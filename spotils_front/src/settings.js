
import process from 'process';

let settings = {
    ROOT_FQDN: "",
    SERVICE_URI: ""
}
// "process.env.REACT_APP_ENV"
console.log(process.env.REACT_APP_ENV);
switch (process.env.REACT_APP_ENV) {
    case "prod":
        settings.ROOT_FQDN = "publify.aldon.info";
        settings.SERVICE_URI = "https://auth.publify.aldon.info";
        break;
    case "dev":
        settings.ROOT_FQDN = "localhost";
        settings.SERVICE_URI = "http://localhost:8000";
        break;
    case "env":
        settings.ROOT_FQDN = process.env.ROOT_FQDN
        settings.SERVICE_URI = process.env.SERVICE_URI
        break
    case "localhost":
    default:
        settings.ROOT_FQDN = "localhost";
        settings.SERVICE_URI = "http://localhost:8000";
        break;
}

export default settings;