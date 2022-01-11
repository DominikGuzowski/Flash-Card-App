import React, { useState, useEffect } from "react";

const fillerHeading = "Lorem, ipsum dolor.";
const fillerText =
    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos veritatis earum delectus nisi ducimus odio eius, quae similique repellat et?";
export const FlashCard = ({
    frontHeading = fillerHeading,
    backHeading = frontHeading,
    frontText = fillerText,
    backText = fillerText,
    frontSubheading = "",
    backSubheading = frontSubheading,
}) => {
    const [id] = useState((Math.random() * 100000).toFixed(0));
    const [visibility, setVisibility] = useState("flash-card--front-visible");
    const [backBody, setBackBody] = useState("");
    const [backTitle, setBackTitle] = useState("");
    const [backSub, setBackSub] = useState("");
    const toggleVisibility = () => {
        if (visibility === "flash-card--front-visible") {
            setVisibility("flash-card--back-visible");
        } else {
            setVisibility("flash-card--front-visible");
        }
    };

    useEffect(() => {
        setVisibility("flash-card--front-visible");
        setTimeout(() => {
            setBackBody(backText);
            setBackTitle(backHeading);
            setBackSub(backSubheading);
        }, 500);
    }, [frontHeading, frontText, backHeading, backText, backSubheading, frontSubheading]);

    // useEffect(() => {
    //     let front = document.getElementById(id + "front");
    //     let back = document.getElementById(id + "back");
    //     let card = document.getElementById(id + "card");
    //     card.style.height = front.clientHeight + "px";//Math.max(front.clientHeight, back.clientHeight) + "px";
    //     console.log(front.clientHeight, back.clientHeight);
    // }, [id]);

    useEffect(() => {
        let front = document.getElementById(id + "front");
        let back = document.getElementById(id + "back");
        let card = document.getElementById(id + "card");
        if (visibility === "flash-card--front-visible") {
            card.style.height = front.clientHeight + "px";
        } else card.style.height = back.clientHeight + "px";
    }, [visibility, id]);

    return (
        <div id={id + "card"} className={`flash-card ${visibility}`}>
            <div className='flash-card__content' onClick={toggleVisibility}>
                <div id={id + "front"} className='flash-card__front'>
                    <h5 className='flash-card__subheading'>{frontSubheading}</h5>
                    <h3 className='flash-card__heading'>{frontHeading}</h3>
                    <p className='flash-card__text'>{frontText}</p>
                </div>
                <div id={id + "back"} className='flash-card__back'>
                    <h5 className='flash-card__subheading'>{backSub}</h5>
                    <h3 className='flash-card__heading'>{backTitle}</h3>
                    <p className='flash-card__text'>{backBody}</p>
                </div>
            </div>
        </div>
    );
};
