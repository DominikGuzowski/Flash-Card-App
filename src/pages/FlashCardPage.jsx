import React, { useEffect, useState } from "react";
import { FlashCardViewer } from "../components/FlashCardViewer";
import { FileUpload } from "../components/FileUpload";
import { FileDownload } from "../components/FileDownload";
import * as Parser from "../js/FlashCardParser";
import { CardTreeSelect } from "../components/CardTreeSelect";
import { createQueueFromArray, updateQueue } from "../js/QueueManager";
import { initialiseCards, setupConfig, updateCard } from "../js/UserDataJson";
import { useNavigate } from "react-router-dom";
import { signOut } from "../js/Gapi";

export const FlashCardPage = () => {
    const nav = useNavigate();
    const [tree, setTree] = useState(null);
    const [data, setData] = useState(null);
    const [cardQueue, setCardQueue] = useState([]);
    const [availableCards, setAvailableCards] = useState([]);
    useEffect(() => {
        if (data) {
            setTree(Parser.treeifyCards(data));
        }
        return () => {};
    }, [data]);
    return (
        <div className='main'>
            <button onClick={() => setupConfig(true)}>REFRESH</button>
            <button onClick={() => signOut(() => nav("/"))}>Log out</button>
            <div style={{ display: "flex", gap: "1em" }}>
                <FileDownload />
                <FileUpload
                    directories
                    onChange={(e) => {
                        Parser.readFlashCardFiles(e.target.files, setData);
                    }}
                />
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
};
