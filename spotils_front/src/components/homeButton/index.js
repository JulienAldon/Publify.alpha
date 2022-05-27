import style from './style.css';

function HomeButton({link, icon, title}) {
    return (
            <a className={style.tool} href={link}>
                <i className={`${icon} ${style.icone}`}></i>{title}
            </a> 
    );
}

export default HomeButton;