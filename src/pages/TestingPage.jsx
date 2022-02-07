import React from "react";
import { signOut } from "../js/Gapi";
import { useNavigate } from "react-router-dom";

export const TestingPage = () => {
    const navigate = useNavigate();

    return (
        <h2>
            HOME PAGE<button onClick={() => signOut(() => navigate("/"))}>Log out</button>
        </h2>
    );
};
