import { createPortal } from 'preact/compat';
import { useEffect, useState } from "preact/hooks";
import style from './style.css';
import { createLink, syncPlaylist } from '../../api';
import { mutate } from 'swr'
import { useAuth } from '../../context/auth';
import { useToast } from '../../context/toast';
import settings from '../../settings';

function clearSelection() {
    const pub = document.getElementsByName("public");
    const col = document.getElementsByName("collab");
    var i;

    for (i = 0; i < pub.length; i++) {
        pub[i].checked = false;
    }
    for (i = 0; i < col.length; i++) {
        col[i].checked = false;
    }
}

function addSync(token, publicP, collaborative, setToastList, toastList, elem) {
    const body = {
        "collaborative_name": collaborative.name,
        "collaborative": collaborative.id,
        "public_name": publicP.name,
        "public": publicP.id
    }

    if (publicP.name === "" || collaborative.name === "") {
        // TODO: message SELECT SMTHG
        return;
    }
    createLink(token, body, setToastList, toastList, elem.id);
}

function Modal({isShowing, hide, data}) {
    const [publicP, setPublic] = useState({'name': "", 'id': ""})
    const [collaborative, setCollaborative] = useState({'name': "", 'id': ""})
    const authContext = useAuth();
    const { toastList, setToastList } = useToast(); 

    useEffect(() => {
        clearSelection();
        const pubElem = document.getElementById("pub"+publicP.id)
        const colElem = document.getElementById("col"+collaborative.id)
        const elem = document.getElementById("new-confirm-button");
        if (elem)
            elem.classList.remove("rotate");
        if (pubElem && colElem) {
            colElem.classList.remove("item-anim");
            pubElem.classList.remove("item-anim");
        }
        setPublic({"name": ""});
        setCollaborative({"name": ""});
    }, [data.result.links])

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
                                    <label id={"col"+elem.id} for={elem.id}>{elem.name}</label>
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
                                    <label id={"pub"+elem.id} for={elem.id}>{elem.name}</label>
                                </li>
                            )})
                        }
                    </ul>
                </article>
            </form>
            <footer class="actions">
                <button id="new-confirm-button" onClick={ () => {
                    const elem = document.getElementById("new-confirm-button");
                    if (elem.classList.contains("rotate"))
                        return
                    let pubElem = document.getElementById("pub"+publicP.id)
                    let colElem = document.getElementById("col"+collaborative.id)
                    if (pubElem && colElem) {
                        pubElem.classList.add("item-anim");
                        colElem.classList.add("item-anim");
                    }
                    if (elem)
                        elem.classList.add("rotate");
                    mutate([`${settings.SERVICE_URI}`, authContext.token], addSync(authContext.token, publicP, collaborative, setToastList, toastList, colElem))
                }}><i id="add-modale-btn" class="material-icons">add_circle_outline</i></button>
                <button id="new-close-button" onClick={ hide }><i class="material-icons">cancel</i></button>
            </footer>
        </dialog>, document.body
    ) : null;
}
export default Modal;