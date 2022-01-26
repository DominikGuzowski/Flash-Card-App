import React, { useState, useEffect } from "react";

export const ArrowSelect = ({ options = [], onSelect, current }) => {
    const defaultValue = { value: "$None_Selected$", label: "" };
    const [id] = useState((Math.random() * 10000000).toFixed(0));
    const [selected, setSelected] = useState(defaultValue);
    useEffect(() => {
        hideDropdown();
    }, [selected]);

    useEffect(() => {
        if (!current) setSelected(defaultValue);
    }, [current]);
    const showDropdown = () => {
        const dropdown = document.querySelector(`#custom-select_${id}.custom-select__options`);
        dropdown.classList.add("show");
    };
    const hideDropdown = () => {
        const dropdown = document.querySelector(`#custom-select_${id}.custom-select__options`);
        dropdown.classList.remove("show");
        document.activeElement.blur();
    };
    return (
        <div className='custom-select' data-selected={selected.value}>
            <div className='custom-select__left-arrow'></div>
            <div
                className='custom-select__box'
                tabIndex='0'
                onFocus={showDropdown}
                onClick={showDropdown}
                onBlur={hideDropdown}>
                <span className='custom-select__label'>{selected.label}</span>
                <ul id={`custom-select_${id}`} className='custom-select__options'>
                    {options.map((x, i) => (
                        <li
                            className={`custom-select__option ${selected.value === x.value && "selected"}`}
                            tabIndex={selected.value === x.value ? -1 : 0}
                            value={x.value}
                            key={x.label + i}
                            onClick={() => {
                                setSelected(x);
                                onSelect?.(x.value);
                                hideDropdown();
                            }}
                            onKeyPress={(e) => {
                                e.preventDefault();
                                if (e.key === " " || e.key === "Enter") {
                                    e.target.click();
                                }
                            }}>
                            {x.label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='custom-select__right-arrow'></div>
        </div>
    );
};
