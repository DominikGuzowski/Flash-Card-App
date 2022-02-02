import React, { useState, useEffect } from "react";
import "./styles.css";
import { FlashCard } from "./components/FlashCard";
import * as Parser from "./js/FlashCardParser";
import GDriveLogin from "./components/GDriveLogin";
import * as api from "./js/GoogleDriveAPI";
import { FlashCardViewer } from "./components/FlashCardViewer";
import { Navigation } from "./components/Navigation";
import { DifficultyRating } from "./components/DifficultyRating";
import { FileUpload } from "./components/FileUpload";
import { FileDownload } from "./components/FileDownload";
import { CardTreeSelect } from "./components/CardTreeSelect";
import { ArrowSelect } from "./components/ArrowSelect";
import { Routes } from "./Routes";
import { Markdown } from "./components/Markdown";
import { createQueue, createQueueFromArray, updateQueue } from "./js/QueueManager";
import { initialiseCards, setupConfig, updateCard } from "./js/UserDataJson";
const pages = [
    { name: "Home", link: "home" },
    { name: "Flash Cards", link: "flash-cards" },
    { name: "Preferences", link: "user-preferences" },
    { name: "Upload Notes", link: "upload-notes" },
];
function App() {
    const [data, setData] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(0);
    const [currentCards, setCurrentCards] = useState([]);
    const [tree, setTree] = useState(null);

    const [cardQueue, setCardQueue] = useState([]);
    const [availableCards, setAvailableCards] = useState([]);

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

    useEffect(() => {
        if (data) {
            setTree(Parser.treeifyCards(data));
        }
        return () => {};
    }, [data]);
    const test = () => {
        const cards = {
            today: {
                interval: 3 * 86400000,
                nextDate: 1643221109492,
                multiplier: 2,
                id: "today",
            },
            "today-later": {
                interval: 12512,
                nextDate: 1643221109492 + 600000,
                multiplier: 2,
                id: "today-later",
            },
            yesterday: {
                interval: 12512,
                nextDate: 1643221109492 - 86400000,
                multiplier: 2,
                id: "yesterday",
            },
            tomorrow: {
                interval: 12512,
                nextDate: 1643221109492 + 86400000,
                multiplier: 2,
                id: "tomorrow",
            },
            "earlier-today": {
                interval: 12512,
                nextDate: 1643221109492 - 6000000,
                multiplier: 2,
                id: "earlier-today",
            },
        };
        // setupConfig(true);
        // for (let key of Object.keys(cards)) {
        //     updateCard(key, cards[key].interval, cards[key].nextDate, cards[key].multiplier);
        // }
        // let queue = createQueue(cards);
        // console.log(queue);
        // queue = updateQueue(queue, "today", 1);
        // console.log(queue);
    };
    test();
    let testing = false;
    if (testing)
        return (
            <Markdown
                markdown={`# Hello World\n - p1\n - p2\n - p3\n\n![aria text](https://media.istockphoto.com/photos/portrait-of-smiling-beautiful-woman-beekeper-picture-id1295674526?b=1&k=20&m=1295674526&s=170667a&w=0&h=Dl2LrBHOtXOwimP5wUmYDino-gbfp9o-M_T72x8KDUk=)\n\n
                \n Some normal text and $m_i$ and $$\\frac{1}{2}$$`}
            />
        );
    else
        return (
            <div className='main'>
                <button onClick={() => setupConfig(true)}>REFRESH</button>
                {/* <Navigation pages={pages} /> */}
                {/* <GDriveLogin />
            <button
            onClick={() => {
                api.getFolderNames().then(({ data, error }) => {
                    if (error) console.log(error);
                    else console.log(data);
                });
                console.log(api.getAccessToken());
            }}>
            Call API
            </button>
            <button
            onClick={() => {
                // api.recursivelyGetFilesInFolder("1e-wJGfp-BC-OLcjyxbV3ukhOuuA_8uxT").then(
                    //     console.log
                    // );
                    api.getAllFilesContents("1e-wJGfp-BC-OLcjyxbV3ukhOuuA_8uxT").then(({ data, error }) => {
                        if (error) console.error(error);
                        else {
                            console.log(data);
                            Parser.readFlashCardFiles(data, setData);
                        }
                    });
                }}>
                GET THEM CARDS
            </button> */}
                <div style={{ display: "flex", gap: "1em" }}>
                    <FileDownload />
                    <FileUpload
                        directories
                        onChange={(e) => {
                            Parser.readFlashCardFiles(e.target.files, setData);
                        }}
                    />
                    {/* <FileUpload
                        onChange={(e) => {
                            console.log(e.target.files);
                        }}
                    /> */}
                </div>

                <CardTreeSelect
                    tree={tree}
                    ignoreKeys={["__flashcards"]}
                    collectKey={"__flashcards"}
                    onSelect={(cards) => {
                        initialiseCards(cards);
                        const queue = createQueueFromArray(cards);
                        setAvailableCards(cards);
                        setCardQueue(queue);
                    }}
                />
                <FlashCardViewer
                    queue={cardQueue}
                    cards={availableCards}
                    onDifficultyClick={(queue, id, diff) => {
                        setCardQueue(updateQueue(queue, id, diff));
                    }}
                />
            </div>
        );
}

export default App;
