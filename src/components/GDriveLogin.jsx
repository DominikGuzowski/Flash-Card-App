import React from "react";

const GDriveLogin = () => {
  const [signedInUser, setSignedInUser] = useState("");
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(true);

  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser);
      setIsLoadingGoogleDriveApi(false);
    } else {
      // prompt user to sign in
      handleAuthClick();
    }
  };

  const initClient = () => {
    gapi.client
      .init({
        apiKey: process.env.REACT_APP_API_KEY,
        clientId: process.env.REACT_APP_CLIENT_ID,
        discoveryDocs: [process.env.REACT_APP_DISCOVERY_DOCS],
        scope: process.env.REACT_APP_SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {
          console.log(error);
        }
      );
  };

  const handleClientLoad = () => {
    gapi.load("client:auth2", initClient);
  };

  return (
    <div>
      {isLoadingGoogleDriveApi && (
        <button onClick={handleClientLoad}>Login</button>
      )}
    </div>
  );
};

export default GDriveLogin;
