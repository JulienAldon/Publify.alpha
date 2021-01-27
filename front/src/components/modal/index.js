import { createPortal } from 'preact/compat';
import { useState } from "preact/hooks";
import style from './style.css';
import { createLink, syncPlaylist } from '../../api';
import { mutate } from 'swr'
import { useAuth } from '../../context/auth';
import settings from '../../settings';

function addSync(token, publicP, collaborative, elem) {
    const body = {
        "collaborative_name": collaborative.name,
        "collaborative": collaborative.id,
        "public_name": publicP.name,
        "public": publicP.id
    }
    if (publicP.name === "" || collaborative.name === "") {
        elem.classList.remove("rotate");
        return;
    }
    createLink(token, body);
}

function Modal({isShowing, hide, data}) {
    const [publicP, setPublic] = useState({'name': "", 'id': ""})
    const [collaborative, setCollaborative] = useState({'name': "", 'id': ""})
    const authContext = useAuth();

    return isShowing ? createPortal(
        <dialog>
            <h1>Create New Association</h1>
            <form>
                <article>
                    <h1>Collaborative Playlist</h1>
                    <ul>
                        { data.result.collaborative.map((elem, index) => {
                            return (
                                <li>
                                    <input onChange={ () => { setCollaborative({'name': elem.name, 'id': elem.id}) } } name="collab" value={elem.name} id={elem.id} type="radio"/>
                                    <label for={elem.id}>{elem.name}</label>
                                </li>
                            )})
                        }
                    </ul>
                </article>
                <article>
                    <h1>Public Playlist</h1>
                    <ul>
                        { data.result.public.map((elem, index) => {
                            return (
                                <li>
                                    <input onChange={ () => { setPublic({'name': elem.name, 'id': elem.id}) } } name="public" value={elem.name} id={elem.id} type="radio"/>
                                    <label for={elem.id}>{elem.name}</label>
                                </li>
                            )})
                        }
                    </ul>
                </article>
            </form>
            <footer class="actions">
                <button id="new-confirm-button" onClick={ () => {
                    const pub = document.getElementsByName("public");
                    const col = document.getElementsByName("collab");
                    var i;
                    for (i = 0; i < pub.length; i++) {
                        pub[i].checked = false;
                    }
                    for (i = 0; i < col.length; i++) {
                        col[i].checked = false;
                    }
                    setPublic({"name": ""});
                    setCollaborative({"name": ""});
                    const elem = document.getElementById("new-confirm-button");
                    elem.classList.add("rotate");
                    mutate(`${settings.SERVICE_URI}`, addSync(authContext.token, publicP, collaborative, elem))
                }}><i id="add-modale-btn" class="material-icons">add_circle_outline</i></button>
                {/* <button id="new-close-button"><i class="material-icons">refresh</i></button> */}
                <button id="new-close-button" onClick={ hide }><i class="material-icons">cancel</i></button>
            </footer>
        </dialog>, document.body
    ) : null;
}
export default Modal;