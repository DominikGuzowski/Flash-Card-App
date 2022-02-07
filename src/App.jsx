import React, { useState, useEffect } from "react";
import "./styles.css";
import { FlashCard } from "./components/FlashCard";
import * as Parser from "./js/FlashCardParser";
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
import { CookiesProvider } from "react-cookie";
import { getAccessToken, initializeClient, signIn, signOut } from "./js/Gapi";
import { LandingPage } from "./pages/LandingPage";
const pages = [
    { name: "Home", link: "home" },
    { name: "Flash Cards", link: "flash-cards" },
    { name: "Preferences", link: "user-preferences" },
    { name: "Upload Notes", link: "upload-notes" },
];
function App() {
    const [init, setInit] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(0);
    const [currentCards, setCurrentCards] = useState([]);

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

    useEffect(() => initializeClient(() => setInit(true)), []);

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
    if (!init) return <div className='landing-page__container'></div>;
    let testing = true;
    if (testing) return <Routes />;
    else return <CookiesProvider></CookiesProvider>;
}

export default App;
