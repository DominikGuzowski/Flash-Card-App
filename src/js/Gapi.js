import { gapi } from "gapi-script";

export const initializeClient = (callback) => {
    gapi.load("client:auth2", () => setUpGapi(callback));
};

const setUpGapi = (callback) =>
    gapi.client
        .init({
            apiKey: process.env.REACT_APP_API_KEY,
            clientId: process.env.REACT_APP_CLIENT_ID,
            discoveryDocs: [process.env.REACT_APP_DISCOVERY_DOCS],
            scope: process.env.REACT_APP_SCOPES,
        })
        .then(() => {
            console.log("initialised");
            callback?.();
        });

export const getAccessToken = () => gapi?.client?.getToken()?.access_token;
export const signIn = (callback) => {
    if (!isSignedIn()) {
        gapi.auth2
            .getAuthInstance()
            .signIn()
            .then(() => {
                console.log("Logged in");
                callback?.();
            });
    } else {
        console.log("Already logged in");
    }
};

export const signOut = (callback) =>
    gapi.auth2
        .getAuthInstance()
        .signOut()
        .then(() => {
            callback?.();
        });

export const isSignedIn = () => gapi?.auth2?.getAuthInstance().isSignedIn.get();

export const getUser = () => {
    try {
        return {
            data: {
                email: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
                fullName: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName(),
            },
        };
    } catch (error) {
        return {
            error: error.message,
        };
    }
};
