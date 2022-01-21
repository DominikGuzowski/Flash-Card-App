import React, { useState, useEffect } from "react";
import { DifficultyRating } from "./DifficultyRating";
import { FlashCard } from "./FlashCard";

export const FlashCardViewer = ({ cards: data = null, onDifficultyClick }) => {
    const [cards, setCards] = useState({});
    const [currentCard, setCurrentCard] = useState({});
    const [changing, toggleChanging] = useState(false);
    const [allowSelectDifficulty, setAllowSelectDifficulty] = useState(false);

    useEffect(() => {
        if (data) {
            setCards(data);
            setCurrentCard(data?.[Object.keys(data)?.[0]][0].cards[0]);
        }
    }, [data]);

    const getSubHeading = (title) => {
        let headings = title.split(".");
        headings.pop();
        return headings
            .filter((x) => x !== "__notopic__")
            .map((x) => x.replace(/([a-z0-9])([A-Z])/g, "$1 $2"))
            .join(" • ");
    };

    const getMainHeading = (title) => {
        return title
            .split(".")
            .pop()
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    };
    const getNextCard = (e) => {
        if (!changing) {
            toggleChanging(true);
            setAllowSelectDifficulty(false);
            onDifficultyClick?.(e);
            let card = document.getElementById(currentCard.id + "_card");
            card.style.animation = "slide-out 1s forwards";
            card.classList.remove("flash-card--back-visible");
            card.classList.add("flash-card--front-visible");

            setTimeout(() => {
                let temp = cards;
                temp[Object.keys(temp)[0]][0].cards.push(temp[Object.keys(temp)[0]][0].cards.shift());
                setCards(temp);
                setCurrentCard(temp[Object.keys(temp)[0]][0].cards[0]);
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

    if (!cards || Object.keys(cards).length === 0) return null;
    return (
        <div className='flash-card__wrapper'>
            <div className='flash-card__container'>
                <FlashCard
                    onReveal={() => {
                        if (!allowSelectDifficulty)
                            setTimeout(() => {
                                setAllowSelectDifficulty(true);
                            }, 1000);
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
