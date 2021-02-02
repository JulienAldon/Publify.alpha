import { h } from 'preact';
import style from './style.css';
import { createPortal } from 'preact/compat';
import useSWR, { mutate } from 'swr'
import { syncPlaylist } from '../../api/';

function Message({isShowing, hide, title, token, mode, element, description}) {
    return isShowing ? createPortal(
        <dialog className={style.dialog}>
            <h1>{ title }</h1>
            <p>{ description }</p>
            <footer class="actions">
                <button id="new-button" onClick={ () => { 
                    document.getElementById(mode+element.id).classList.add("pending");
                    syncPlaylist(element.id, token, mode, document.getElementById(mode+element.id)) 
                    hide(); } }><i class="material-icons">done</i></button>
                <button id="new-button" onClick={ () => { hide(); } }><i class="material-icons">cancel</i></button>
            </footer>
        </dialog>, document.body
    ) : null;
}

export default Message;