import style from './style.css';

function Select({options, current, onChange}) {
    return (
        <>
            <label className={style.selectLabel}>Filter</label>
            <select className={style.select} onchange={onChange}>
                {
                    options.map((elem) => {
                        if (elem === current) {
                            return <option selected="true" value={elem}>{elem}</option>
                        }
                        return (
                            <option value={elem}>{elem}</option>
                        );
                    })
                }
            </select>
        </>
    );
}

export default Select;