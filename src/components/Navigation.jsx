import React, { useState } from "react";

export const Navigation = ({ pages = [] }) => {
    const [visibility, setVisibility] = useState("navigation--visible");

    const toggleNav = () => {
        if (visibility === "navigation--visible") {
            setVisibility("navigation--hidden");
        } else {
            setVisibility("navigation--visible");
        }
    };
    if (!pages) return null;
    return (
        <nav className={`navigation ${visibility}`}>
            {/* <div className='navigation__toggle'>
                <button className='navigation__toggle-button' onClick={toggleNav}></button>
            </div> */}
            <div className='navigation__header'></div>
            <ul className='navigation__items'>
                {pages.map(({ name, link }) => {
                    return (
                        <li className='navigation__item'>
                            <a className='navigation__link' href={link}>
                                {name}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
