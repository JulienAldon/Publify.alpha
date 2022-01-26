import style from './style.css';
import { useState } from "preact/hooks";

function UserList({ users, selected, setSelected }) {
  const [ isAll, toggleIsAll] = useState(true);

  return (
    <div class={style.imageContainer}>
      <button class={style.imageBox} onClick={()=>{
        if (isAll)
          setSelected([]);
        else 
          setSelected([...users]);
        toggleIsAll(!isAll);
      }}>{isAll ? `None` : `All`}</button>
      {
        users.map((usr) => {
          return (
            <button class={`${style.imageBox} ${selected.find(el=>el===usr) ? style.selected : ""}`} onClick={() => {
              let testUsr = selected.find(elem => elem === usr);
              if (testUsr) {
                setSelected([...selected.filter(el => el !== usr)])
              } else if (!testUsr) {
                setSelected([...selected, usr])
                if (selected.lenght === users.lenght) {
                  toggleIsAll(true)
                }
              }
            }}>
              <img style={`border: 3px solid ${usr.color}`} class={style.image} src={usr?.images[0] ? usr.images[0].url : null}></img>
              <label class={style.imageLabel}>{usr.display_name}</label>
            </button>
          );
        })
      }

    </div>
  );
}

export default UserList;