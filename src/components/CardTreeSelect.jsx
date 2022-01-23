import React, { useEffect, useState } from "react";
import { ArrowSelect } from "./ArrowSelect";

export const CardTreeSelect = ({ tree, ignoreKeys = [] }) => {
    const [cardTree, setCardTree] = useState({});
    const [currentSelection, setCurrentSelection] = useState([]);
    const [currentKeys, setCurrentKeys] = useState([]);

    const collect = (objTree, collectKey, array) => {
        if (!objTree || !collectKey || !array) return;
        for (let key of Object.keys(objTree)) {
            if (key === collectKey) {
                array.push(...objTree[collectKey]);
            }
        }
        for (let key of Object.keys(objTree)) {
            if (key !== collectKey) {
                collect(objTree[key], collectKey, array);
            }
        }
    };

    const resetSelect = (level) => {
        let select = document.querySelector(`select[name="select_${level}"]`);
        while (select) {
            select.selectedIndex = 0;
            select = document.querySelector(`select[name="select_${++level}"]`);
        }
    };

    const get = (json, keyarr) => {
        let copy = { ...json };
        for (let a of keyarr) {
            if (!copy[a]) return null;
            else copy = copy[a];
        }
        return copy;
    };
    useEffect(() => {
        console.log(currentSelection);
    }, [currentSelection]);

    useEffect(() => {
        if (tree) {
            let temp = { ...tree };
            setCardTree(temp);
            setCurrentKeys(Object.keys(temp).filter((x) => !ignoreKeys.includes(x)));
        }
    }, [tree]);

    const getCurrentLevel = (selection = currentSelection) => {
        return Object.keys(get(cardTree, selection) || {}).filter((x) => !ignoreKeys.includes(x));
    };

    const getSelect = (depth) => {
        let arrSlice = currentSelection.slice(0, depth);
        let keys = getCurrentLevel(arrSlice);
        if (!keys || keys.length === 0) return null;
        return (
            <ArrowSelect
                key={`select_${JSON.stringify(keys)}`}
                options={keys.map((x) => ({ value: x, label: x }))}
                onSelect={(e) => {
                    let temp = [...currentSelection].slice(0, depth);
                    setCurrentSelection([]);
                    temp.push(e);
                    resetSelect(depth + 1);
                    setCurrentSelection(temp);
                }}
            />
        );
    };
    if (!tree) return null;
    return (
        <div className='card-tree-select'>
            <ArrowSelect
                key={JSON.stringify(currentKeys)}
                options={currentKeys.map((x) => ({ value: x, label: x }))}
                onSelect={(e) => {
                    let temp = [...currentSelection].slice(0, 0);
                    setCurrentSelection([]);
                    temp.push(e);
                    resetSelect(1);
                    setCurrentSelection(temp);
                }}
            />
            {currentSelection.map((_, i) => {
                return getSelect(i + 1);
            })}
            <button className='card-tree-select__button'>Study !</button>
        </div>
    );
};
