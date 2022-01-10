import { h } from 'preact';
import style from './style.css';
import { createPortal } from 'preact/compat';
import { syncPlaylist } from '../../api/';
import { useToast } from '../../context/toast';

function Message({isShowing, hide, title, token, mode, element, description, toastDescription}) {
    const { toastList, setToastList } = useToast()

    return isShowing ? createPortal(
        <dialog className={style.dialog}>
            <h1>{ title }</h1>
            <p>{ description }</p>
            <footer class="actions">
                <button id="new-button" onClick={ () => { 
                    var el = document.getElementById(mode+element.id);
                    el.classList.add("pending");
                    syncPlaylist(element.id, token, mode, el).then(() => {
                        setToastList((toastList) => {
                            return [...toastList, {
                                id: element.id,
                                title: "Info",
                                description: toastDescription,
                                backgroundColor: "#7DA641",
                            }]
                        })
                        el.classList.remove('pending');
                        el.classList.add('success');
                        setTimeout(() => {
                            el.classList.remove('success');
                            el.classList.remove('pending');
                        }, 5000)
                    });
                    hide(); } }><i class="material-icons">done</i></button>
                <button id="new-button" onClick={ () => { hide(); } }><i class="material-icons">cancel</i></button>
            </footer>
        </dialog>, document.body
    ) : null;
}

export default Message;