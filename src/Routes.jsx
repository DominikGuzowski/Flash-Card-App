import React from "react";
import { BrowserRouter, Route, Routes as Switch } from "react-router-dom";
import { FlashCardPage } from "./pages/FlashCardPage";
import { LandingPage } from "./pages/LandingPage";
import { TestingPage } from "./pages/TestingPage";

export const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path={"/"} element={<LandingPage />}></Route>
                <Route path={"/home"} element={<FlashCardPage />}></Route>
                <Route path={"/notes"} element={<h2>NOTES PAGE</h2>}></Route>

                <Route path={"*"} element={<h2>DEFAULT</h2>} />
            </Switch>
        </BrowserRouter>
    );
};
