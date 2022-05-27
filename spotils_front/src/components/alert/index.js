import { h } from 'preact';
import style from './style.css';
import { createPortal } from 'preact/compat';
import useSWR, { mutate } from 'swr'
import { syncPlaylist } from '../../api/';

function Alert({isShowing, hide, title, description}) {
    return isShowing ? createPortal(
        <dialog className={style.dialog}>
            <h1>{ title }</h1>
            <p>{ description }</p>
            <footer class="actions">
                <button id="new-button" onClick={ () => { hide(); } }><i class="material-icons">cancel</i></button>
            </footer>
        </dialog>, document.body
    ) : null;
}

export default Alert;