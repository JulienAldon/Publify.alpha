import { useEffect, useState } from "preact/hooks";
import { useToast } from '../../context/toast';

const Toast = (props) => {
    const { position} = props;
	const { toastList, setToastList } = useToast();

    const deleteToast = id => {
        let tmp = toastList;
        let index = tmp.findIndex(e => e.id === id);
        tmp.splice(index, 1);
        setToastList([...tmp]);
    }

    useEffect(() => {
    }, [ toastList ])

    return (
        <div className={`notificationContainer ${position}`}>
            {
                !toastList ? null :
                toastList.map((t, i) => 
                <div key={i} title={t.description} className={`notification toast ${position}`} style={{ backgroundColor: t.backgroundColor }}>
                    <button onClick={() => deleteToast(t.id)}><i class="material-icons">clear</i></button>
                    <div>
                        <h1 className="notificationTitle">{t.title}</h1>
                        <p className="notificationDescription">{t.description}</p>
                    </div>
                </div>
                )
            }
        </div>
    )
}
export default Toast;