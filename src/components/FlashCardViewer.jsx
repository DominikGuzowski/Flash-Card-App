import React, { useState, useEffect } from "react";
import { DifficultyRating } from "./DifficultyRating";
import { FlashCard } from "./FlashCard";

export const FlashCardViewer = ({ cards: data = [], onDifficultyClick, queue = [] }) => {
    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState({});
    const [changing, toggleChanging] = useState(false);
    const [allowSelectDifficulty, setAllowSelectDifficulty] = useState(false);
    const [cardId, setCardId] = useState(0);
    const [cardQueue, setCardQueue] = useState([]);
    // const []
    useEffect(() => {
        if (data && data.length > 0) {
            setCards(data);
            setAllowSelectDifficulty(false);
            // setCardQueue(queue);
            if (cardQueue.length > 0) setCurrentCard(data.find(({ id }) => id === cardQueue[0].id));
        }
    }, [data, cardQueue]);

    useEffect(() => {
        setCardQueue(queue);
    }, [queue]);
    const getSubHeading = (title) => {
        let headings = title?.split("*:-:*");
        headings?.pop();
        return headings
            ?.filter((x) => x !== "__notopic__")
            .map((x) => x.replace(/([a-z0-9])([A-Z])/g, "$1 $2"))
            .join(" • ");
    };

    const getMainHeading = (title) => {
        return title
            ?.split("*:-:*")
            .pop()
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    };

    const getNextCard = (e) => {
        if (!changing) {
            toggleChanging(true);
            setAllowSelectDifficulty(false);
            setCardId(cardId + 1);
            let card = document.getElementById(currentCard.id + "_card");
            card.style.animation = "slide-out 1s forwards";
            card.classList.remove("flash-card--back-visible");
            card.classList.add("flash-card--front-visible");

            setTimeout(() => {
                if (onDifficultyClick) onDifficultyClick(cardQueue, currentCard.id, e);

                // let temp = cards.slice();
                // console.log(temp);
                // temp.push(temp.shift());
                // console.log(temp);
                // setCards(temp);
                // setCurrentCard({ ...temp[0] });
                // card.style.animation = "slide-in 1s forwards";

                if (cardQueue.length > 0) {
                    setCurrentCard({ ...cards.find(({ id }) => id === cardQueue[0].id) });
                } else console.log("Complete?");

                setTimeout(() => {
                    toggleChanging(false);
                }, 750);
            }, 500);
        }
    };

    React.useEffect(() => {
        if (!currentCard) return;
        let card = document.getElementById(currentCard.id + "_card");
        if (!card) return;
        card.style.animation = "slide-in 1s forwards";
    }, [currentCard]);
    if (cardQueue.length === 0 && cards && cards.length > 0) return <h1>You are done!</h1>;
    if (!cards || cards.length === 0) return null;
    if (!currentCard) return null;
    return (
        <div className='flash-card__wrapper'>
            <div className='flash-card__container'>
                <FlashCard
                    state={cardId}
                    onReveal={() => {
                        if (!allowSelectDifficulty)
                            setTimeout(() => {
                                setAllowSelectDifficulty(true);
                            }, 750);
                    }}
                    cardId={currentCard.id}
                    frontHeading={getMainHeading(currentCard.topic)}
                    frontSubheading={getSubHeading(currentCard.topic)}
                    frontText={currentCard.question}
                    backText={currentCard.answer}
                />
            </div>
            <DifficultyRating onClick={getNextCard} disabled={!allowSelectDifficulty} />
        </div>
    );
};
