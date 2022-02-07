import React, { useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { isSignedIn, signIn, signOut } from "../js/Gapi";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
    const navigate = useNavigate();
    const transitionOut = () => {
        const cB = document.querySelector(".landing-page__corner-big");
        const cS = document.querySelector(".landing-page__corner-small");
        const tC = document.querySelector(".landing-page__title-card");
        const lC = document.querySelector(".landing-page__login-card");
        setTimeout(() => {
            tC.style.animation = "slide-to-left 1000ms ease forwards";
        }, 250);
        setTimeout(() => {
            lC.style.animation = "slide-to-right 1000ms ease forwards";
        }, 0);
        setTimeout(() => {
            cB.style.animation = "corner-out 1000ms cubic-bezier(.53,-0.59,.76,1.02) forwards";
        }, 750);
        setTimeout(() => {
            cS.style.animation = "corner-out 1000ms cubic-bezier(.53,-0.59,.76,1.02) forwards";
        }, 500);

        setTimeout(() => {
            navigate("/home");
        }, 1500);
    };

    const signInAndRedirect = () => {
        signIn(transitionOut);
    };

    useEffect(() => {
        if (isSignedIn()) navigate("/home");
    }, []);

    return (
        <div className='landing-page__container'>
            <div className='landing-page__corner-big' />
            <div className='landing-page__corner-small' />
            <div className='landing-page__title-card'>
                <h1 className='landing-page__title'>
                    No<span>You</span>
                </h1>
                <p className='landing-page__phrase'>Flippin' Flashcards made by You!</p>
            </div>
            <div className='landing-page__login-card'>
                <div className='landing-page__login-group'>
                    <h2 className='landing-page__header'>Log in with Google</h2>
                    <p className='landing-page__text'>and access your notes from Google Drive</p>
                    <button
                        className='landing-page__login-button landing-page--google-button'
                        onClick={signInAndRedirect}>
                        <FcGoogle /> Continue with Google
                    </button>
                </div>
                <div className='landing-page__login-group'>
                    <h2 className='landing-page__header'>... or upload notes</h2>
                    <p className='landing-page__text'>directly from your own computer!</p>
                    <button className='landing-page__login-button' onClick={transitionOut}>
                        Continue without sign in
                    </button>
                    <button className='landing-page__login-button landing-page--learn-more' onClick={signOut}>
                        Learn more
                    </button>
                </div>
            </div>
        </div>
    );
};
