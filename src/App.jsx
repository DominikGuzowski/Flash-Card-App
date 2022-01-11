import React, { useState } from "react";
import "./styles.css";
import { FlashCard } from "./components/FlashCard";
import * as Parser from "./js/FlashCardParser";

function App() {
    const [data, setData] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(0);
    const [currentCard, setCurrentCard] = useState(0);

    const getSubHeading = (title) => {
        let headings = title.split(".");
        headings.pop();
        return headings.map((x) => x.replace(/([a-z0-9])([A-Z])/g, "$1 $2")).join(" • ");
    };

    const getMainHeading = (title) => {
        return title
            .split(".")
            .pop()
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    };
    return (
        <div className='main'>
            <input
                type='file'
                multiple
                onChange={(e) => {
                    Parser.readFlashCardFiles(e.target.files, (d) =>
                        setData(d[Object.keys(d)[0]])
                    );
                }}></input>
            <div style={{ display: "flex" }}>
                <button
                    onClick={() => {
                        if (currentTopic > 0) {
                            console.log(getSubHeading(data[currentTopic].topic));
                            setCurrentTopic(currentTopic - 1);
                            setCurrentCard(0);
                        }
                    }}>
                    Prev Topic
                </button>
                <button
                    onClick={() => {
                        if (currentTopic < data.length - 1) {
                            setCurrentTopic(currentTopic + 1);
                            setCurrentCard(0);
                        }
                    }}>
                    Next Topic
                </button>
            </div>
            <div style={{ display: "flex" }}>
                <button
                    onClick={() => {
                        if (currentCard > 0) {
                            setCurrentCard(currentCard - 1);
                        }
                    }}>
                    Prev Card
                </button>
                <button
                    onClick={() => {
                        if (currentCard < data[currentTopic].cards.length - 1) {
                            setCurrentCard(currentCard + 1);
                        }
                    }}>
                    Next Card
                </button>
            </div>
            {/* <FlashCard
                frontHeading={data && getMainHeading(data[currentTopic].topic)}
                frontSubheading={data && getSubHeading(data[currentTopic].topic)}
                frontText={data && data[currentTopic].cards[currentCard].question}
                backText={data && data[currentTopic].cards[currentCard].answer}
            /> */}
            {data?.map((section) => {
                return section.cards.map((card) => {
                    return (
                        <FlashCard
                            frontHeading={getMainHeading(section.topic)}
                            frontSubheading={getSubHeading(section.topic)}
                            frontText={card.question}
                            backText={card.answer}
                        />
                    );
                });
            })}
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        </div>
    );
}

export default App;
