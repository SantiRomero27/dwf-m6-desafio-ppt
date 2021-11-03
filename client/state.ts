import { rtdbFront } from "./rtdb";

// Auxiliar types
type Move = "rock" | "paper" | "scissors" | "none";
type Result = "userWin" | "opponentWin" | "tiedGame";

// Aux variable
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// State
const state = {
    // Main data
    data: {
        userId: "",
        myName: "",
        opponentName: "",
        rtdbId: "",
        roomId: "",

        currentGame: {
            myMove: "none",
            opponentMove: "none",
        },

        history: {
            myScore: 0,
            opponentScore: 0,
        },
    },

    // State listeners
    listeners: [],

    // State initialicer
    init() {
        // Get the local data
        const localData = JSON.parse(localStorage.getItem("games-data"));

        if (!localData) {
            return;
        }

        this.setState(localData);
    },

    // Getter
    getState() {
        return this.data;
    },

    // Get the current game
    getCurrentGame() {
        // Get current state
        const currentState = this.getState();

        return currentState.currentGame;
    },

    // Setter
    setState(newState) {
        this.data = newState;

        // Save the changes made to the state
        localStorage.setItem("games-data", JSON.stringify(newState));

        for (const cb of this.listeners) {
            cb();
        }
    },

    // Subscribe method
    subscribe(callback: (any) => any) {
        this.listeners.push(callback);
    },

    // Set user name method
    setName(name: string) {
        // First, get the last state
        const currentState = this.getState();

        // Change the name and set the new state
        currentState.myName = name;

        this.setState(currentState);
    },

    // Set room id method
    setRoomId(roomId: string) {
        // Get the current state
        const currentState = this.getState();

        // Change the room id
        currentState.roomId = roomId;

        this.setState(currentState);
    },

    // Signup method
    signUp(callbackFunction?) {
        // Get the current state, and the username
        const currentState = this.getState();
        const currentName = currentState.myName;

        // Make the API call
        fetch(`${API_BASE_URL}/signUp`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                name: currentName,
            }),
        })
            // Resolve the promise
            .then((res) => res.json())
            .then((data) => {
                // If the name already exists, execute the callback
                if (data.message) {
                    callbackFunction(data.message);

                    return;
                }

                // Update the userId to the state
                currentState.userId = data.playerId;

                this.setState(currentState);

                // Go to the home page, using a callback
                callbackFunction();
            });
    },

    // Restart data before we create a new game method
    restartData() {
        // Get the current state
        const currentState = this.getState();

        // Restart the opponent name, the scores
        currentState.opponentName = "";
        currentState.history.myScore = 0;
        currentState.history.opponentScore = 0;

        this.setState(currentState);
    },

    // Get new room
    getNewRoom(callbackFunction?) {
        // Get the current state
        const currentState = this.getState();

        // Make an API call in order to get the short room ID
        fetch(`${API_BASE_URL}/rooms`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                userId: currentState.userId,
            }),
        })
            // Resolve the promise
            .then((res) => res.json())
            .then((data) => {
                // Update the short room ID
                currentState.roomId = data.shortRoomId;

                this.setState(currentState);

                // Get the rtdbID, using the callback function
                callbackFunction();
            });
    },

    // Get the realtime DB ID method
    getRealtimeDBID(callbackFunction?) {
        // Get the current state
        const currentState = this.getState();

        // Make an API call
        fetch(
            `${API_BASE_URL}/rooms/${currentState.roomId}?playerId=${currentState.userId}`
        )
            .then((res) => res.json())
            .then((data) => {
                // If there's an error, use the callback to notify
                if (data.message) {
                    callbackFunction(data.message);

                    return;
                }

                // Update the rtdbID
                currentState.rtdbId = data.rtdbRoomId;

                this.setState(currentState);

                // Use the callback function to go to enter the room
                callbackFunction();
            });
    },

    // Join to a room method
    joinRoom(callbackFunction?) {
        // Get the current state
        const currentState = this.getState();

        // Get the needed data
        const { rtdbId, myName } = currentState;

        // Make an API call
        fetch(`${API_BASE_URL}/rooms/${rtdbId}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },

            body: JSON.stringify({
                playerName: myName,
            }),
        })
            // Resolve the promise
            .then((res) => res.json())
            .then((data) => {
                // Get the response message, and the other data
                const { message, opponentName, opponentScore, myScore } = data;

                // If an error occurred, execute the callback as an error, and go to the room-fail page
                if (message !== "ok") {
                    callbackFunction(true);

                    return;
                }

                // Update the state data
                currentState.opponentName = opponentName;
                currentState.history.opponentScore = opponentScore;
                currentState.history.myScore = myScore;

                this.setState(currentState);

                // Go to the instructions page
                callbackFunction();
            });
    },

    // Set ready method
    changeReadyStatus(status: boolean, callbackFunction?) {
        // Get the current state
        const currentState = this.getState();

        // Get the playerName and the rtdbId
        const { myName, rtdbId } = currentState;

        // Make an API call
        fetch(`${API_BASE_URL}/setReady`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
            },

            body: JSON.stringify({
                playerName: myName,
                rtdbRoomId: rtdbId,
                ready: status,
            }),
        })
            // Resolve the promise
            .then((res) => res.json())
            .then((data) => {
                if (callbackFunction) {
                    // Go to the waiting room
                    callbackFunction();
                }
            });
    },

    // Listen to server ready method
    listenReady(callbackFunction?) {
        // Get the current state, and the rtdbId + myName + opponentName
        const currentState = this.getState();
        const { rtdbId, myName, opponentName } = currentState;

        // Make a rtdb room reference
        const rtdbRoomRef = rtdbFront.ref(`rooms/${rtdbId}/current-game`);

        // Listen to the ready changes
        rtdbRoomRef.on("value", (snap) => {
            // Get the values
            const roomValues = snap.val();

            // Get the players data
            const { player1, player2 } = roomValues;

            // If there's no opponent name, get it and save the state
            if (!opponentName && player1.name && player1.name !== myName) {
                // Player1 is the opponent
                currentState.opponentName = player1.name;

                this.setState(currentState);
            } else if (
                !opponentName &&
                player2.name &&
                player2.name !== myName
            ) {
                // Player2 is the opponent
                currentState.opponentName = player2.name;

                this.setState(currentState);
            }

            // When both players are ready, go to the Game Page
            if (player1.ready && player2.ready) {
                // Disconnect the listener
                rtdbRoomRef.off("value");

                // Redirect, using the callback
                callbackFunction();
            }
        });
    },

    // Set move method
    setMyMove(move: Move, callbackFunction?) {
        // Get the current state
        const currentState = this.getState();

        // Change my move in the state
        currentState.currentGame.myMove = move;

        this.setState(currentState);

        // Make an API call
        fetch(`${API_BASE_URL}/setMove`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
            },

            body: JSON.stringify({
                playerName: currentState.myName,
                rtdbRoomId: currentState.rtdbId,
                playerMove: move,
            }),
        })
            // Response
            .then((res) => res.json())
            .then((data) => {
                // Redirect to the Waiting page
                if (callbackFunction) {
                    callbackFunction();
                }
            });
    },

    // Listen to the opponent moves method
    listenOpponentMoves() {
        // Get the current state, and the useful data
        const currentState = this.getState();
        const { opponentName, rtdbId } = currentState;

        // Make the room reference
        const rtdbRoomRef = rtdbFront.ref(`rooms/${rtdbId}/current-game`);

        // Listen to the changes made to the values
        rtdbRoomRef.on("value", (snap) => {
            // Get the room values, and the players data
            const roomValues = snap.val();
            const { player1, player2 } = roomValues;

            // Check which is the opponent
            if (player1.name === opponentName) {
                currentState.currentGame.opponentMove = player1.choice;
            }

            // If the player2 is the opponent
            else {
                currentState.currentGame.opponentMove = player2.choice;
            }

            // Change the state
            this.setState(currentState);
        });
    },

    // Get the result method
    getResult(myMove: Move, opponentMove: Move) {
        // Aux variables
        const userWin = [
            myMove === "rock" && opponentMove === "scissors",
            myMove === "paper" && opponentMove === "rock",
            myMove === "scissors" && opponentMove === "paper",
            myMove === "rock" && opponentMove === "none",
            myMove === "paper" && opponentMove === "none",
            myMove === "scissors" && opponentMove === "none",
        ].includes(true);
        const opponentWin = [
            opponentMove === "rock" && myMove === "scissors",
            opponentMove === "paper" && myMove === "rock",
            opponentMove === "scissors" && myMove === "paper",
            opponentMove === "rock" && myMove === "none",
            opponentMove === "paper" && myMove === "none",
            opponentMove === "scissors" && myMove === "none",
        ].includes(true);

        // Result variable
        let gameResult: Result;

        // Change the winner history, depending on the result
        if (userWin) {
            gameResult = "userWin";
        } else if (opponentWin) {
            gameResult = "opponentWin";
        } else {
            gameResult = "tiedGame";
        }

        return gameResult;
    },

    // Update history method
    updateHistory(result: Result) {
        // Get the current state
        const currentState = this.getState();

        // If there was a tie, or the opponent was the winner, dont do anything
        if (result === "tiedGame") {
            return;
        }

        // If i won...
        if (result === "userWin") {
            currentState.history.myScore += 1;

            // Update the state
            this.setState(currentState);
        }

        // If the opponent won...
        else if (result === "opponentWin") {
            currentState.history.opponentScore += 1;

            // Update the state, and don't do anything else
            this.setState(currentState);

            return;
        }

        // Make an API call only if i won
        fetch(`${API_BASE_URL}/setScore`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
            },

            body: JSON.stringify({
                winnerName: currentState.myName,
                rtdbRoomId: currentState.rtdbId,
            }),
        })
            // Response
            .then((res) => res.json())
            .then((data) => {
                //
            });
    },
};

// EXPORT
export { state };
