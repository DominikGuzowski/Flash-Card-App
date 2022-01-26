import React, { useState, useEffect } from "react";
import { Markdown } from "./Markdown";

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
    cardId = "",
    onReveal,
}) => {
    const [id] = useState((Math.random() * 100000).toFixed(0));
    const [visibility, setVisibility] = useState("flash-card--front-visible");
    const [backBody, setBackBody] = useState("");
    const [backTitle, setBackTitle] = useState("");
    const [backSub, setBackSub] = useState("");
    const toggleVisibility = () => {
        if (visibility === "flash-card--front-visible") {
            setVisibility("flash-card--back-visible");
            onReveal?.();
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

    useEffect(() => {
        let front = document.getElementById(cardId + "_front");
        let back = document.getElementById(cardId + "_back");
        let card = document.getElementById(cardId + "_card");
        card.style.height = Math.max(front.clientHeight, back.clientHeight) + "px";
    }, [visibility, cardId]);

    return (
        <div id={cardId + "_card"} className={`flash-card ${visibility}`}>
            <div
                tabIndex='0'
                onKeyPress={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                        toggleVisibility();
                    }
                }}
                className='flash-card__content'
                onClick={toggleVisibility}>
                <div id={cardId + "_front"} className='flash-card__front'>
                    <h5 className='flash-card__subheading'>{frontSubheading}</h5>
                    <h3 className='flash-card__heading'>{frontHeading}</h3>
                    {/* <p className='flash-card__text'>{frontText}</p> */}
                    <Markdown className='flash-card__text' markdown={frontText} />
                </div>
                <div id={cardId + "_back"} className='flash-card__back'>
                    <h5 className='flash-card__subheading'>{backSub}</h5>
                    <h3 className='flash-card__heading'>{backTitle}</h3>
                    <Markdown className='flash-card__text' markdown={backBody} />

                    {/* <p className='flash-card__text'>{backBody}</p> */}
                </div>
            </div>
        </div>
    );
};
