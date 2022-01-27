import style from './style.css';
import { useEffect, useState } from "preact/hooks";

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
            <button class={`${style.imageBox} ${selected.find(el=>el.display_name===usr.display_name) ? style.selected : ""}`} onClick={() => {
              let testUsr = selected.find(elem => elem.display_name === usr.display_name);
              if (testUsr) {
                setSelected((selected) => [...selected.filter(el => el.display_name !== usr.display_name)])
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