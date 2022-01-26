import React from "react";
import { BrowserRouter, Route, Routes as Switch } from "react-router-dom";

export const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path={"/"} element={<h2 style={{ color: "red" }}>Redirect from here</h2>}></Route>
                <Route path={"/home"} element={<h2>HOME PAGE</h2>}></Route>
                <Route path={"/notes"} element={<h2>NOTES PAGE</h2>}></Route>
                {/* <Route path={} component={}></Route>
                <Route path={} component={}></Route> */}
                <Route path={"*"} element={<h2>DEFAULT</h2>} />
            </Switch>
        </BrowserRouter>
    );
};
