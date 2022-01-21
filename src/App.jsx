import React, { useState } from "react";
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

const pages = [
    { name: "Home", link: "home" },
    { name: "Flash Cards", link: "flash-cards" },
    { name: "Preferences", link: "user-preferences" },
    { name: "Upload Notes", link: "upload-notes" },
];
function App() {
    const [data, setData] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(0);
    const [currentCard, setCurrentCard] = useState(0);

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
    // let a = 1;
    // if (a === 1) {
    //     return (
    //         <div className='main'>
    //             <DifficultyRating onClick={(e) => console.log(e)} />
    //         </div>
    //     );
    // } else
    return (
        <div className='main'>
            <Navigation pages={pages} />
            <GDriveLogin />
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
            </button>
            <FileDownload />
            <FileUpload
                onChange={(e) => {
                    Parser.readFlashCardFiles(e.target.files, setData);
                }}
            />
            <FlashCardViewer cards={data} />
        </div>
    );
}

export default App;
