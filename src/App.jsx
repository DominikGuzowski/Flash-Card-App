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
    const [tree, setTree] = useState(null);
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

    // let a = 1;
    // if (a === 1) {
    //     return (
    //         <div className='main'>
    //             <DifficultyRating onClick={(e) => console.log(e)} />
    //         </div>
    //     );
    // } else
    let options = [
        { value: "Hello", label: "WORLD" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "$None_Selected$", label: "Selection" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
        { value: "cheese", label: "grouier cheese is best" },
    ];
    let testing = false;
    if (testing)
        return (
            <div className='main'>
                <ArrowSelect options={options} onSelect={(e) => console.log(e)} />
                <ArrowSelect options={options} onSelect={(e) => console.log(e)} />
            </div>
        );
    else
        return (
            <div className='main'>
                <Navigation pages={pages} />
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
                        onChange={(e) => {
                            Parser.readFlashCardFiles(e.target.files, setData);
                        }}
                    />
                </div>

                <CardTreeSelect tree={tree} ignoreKeys={["__flashcards"]} />
                <FlashCardViewer cards={data} />
            </div>
        );
}

export default App;
