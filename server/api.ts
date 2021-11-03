import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import { firestoreDB, realtimeDB } from "./database";
import { nanoid } from "nanoid";

// Create the express app
const app = express();
app.use(express.json());
app.use(cors());

// Use static
app.use(express.static("dist"));

// Aux variables
const PORT = process.env.PORT || 3000;
const playersCollection = firestoreDB.collection("players");
const roomsCollection = firestoreDB.collection("rooms");

// Test endpoint
app.get("/env", (req, res) => {
    res.json({
        environment: process.env.NODE_ENV || "development",
    });
});

// Sign Up endpoint
app.post("/signup", (req, res) => {
    // First, get the body with the name attribute
    const { name } = req.body;

    // Make a query
    const nameQuery = playersCollection.where("name", "==", name);

    // Get the name query, and check if the player already exists
    nameQuery.get().then((querySnap) => {
        if (querySnap.empty) {
            // Add a new user to the collection
            playersCollection
                .add({
                    name,
                })
                .then((createdPlayer) => {
                    res.status(201).json({
                        playerId: createdPlayer.id,
                    });
                });
        } else {
            res.status(400).json({
                message: "Ya existe un usuario con este nombre",
            });
        }
    });
});

// Create a new room
app.post("/rooms", (req, res) => {
    // Get the user/player Id
    const userId: string = req.body.userId.toString();

    // Get the player reference
    const playerRef = playersCollection.doc(userId);

    playerRef.get().then((playerSnap) => {
        // Check if the user exists
        if (playerSnap.exists) {
            // Aux variable
            const playerSnapData = playerSnap.data();

            // Create the rtdb room
            const rtdbRoomRef = realtimeDB.ref(`rooms/${nanoid()}`);

            rtdbRoomRef.set(
                {
                    ownerId: userId,
                    ownerName: playerSnapData.name,
                    "current-game": {
                        player1: {
                            name: playerSnapData.name,
                            choice: "none",
                            ready: false,
                            score: 0,
                        },

                        player2: {
                            name: "",
                            choice: "none",
                            ready: false,
                            score: 0,
                        },
                    },
                },
                () => {
                    // After being created, get the room id, and slice it
                    const roomId = rtdbRoomRef.key;
                    const shortRoomId = roomId.slice(0, 5);

                    // Create a new room in the firestore database
                    const firestoreRoomRef = roomsCollection.doc(shortRoomId);

                    firestoreRoomRef
                        .set({
                            rtdbRoomId: roomId,
                        })

                        .then(() => {
                            res.status(201).json({
                                shortRoomId,
                            });
                        });
                }
            );
        }

        // If the player does not exists
        else {
            res.status(404).json({
                message: "No existe ese usuario",
            });
        }
    });
});

// Get the rtdbRoomId
app.get("/rooms/:roomId", (req, res) => {
    // Get the user ID and the short room ID
    const playerId: string = req.query.playerId.toString();
    const shortRoomId: string = req.params.roomId;

    // Get the user reference
    const playerRef = playersCollection.doc(playerId);

    // Get the user/player first
    playerRef.get().then((playerSnap) => {
        // Check if the player exists
        if (playerSnap.exists) {
            // Get the room reference from firestore
            const roomRef = roomsCollection.doc(shortRoomId);

            // Get the room, and send the rtdb room ID
            roomRef.get().then((roomSnap) => {
                if (roomSnap.exists) {
                    // Get the room data
                    const roomData = roomSnap.data();

                    res.status(200).json(roomData);
                } else {
                    res.status(404).json({
                        message: `La sala ${shortRoomId} no existe!`,
                    });
                }
            });
        }

        // If the player does not exists, notify the user
        else {
            res.status(404).json({
                message: "El usuario no existe!",
            });
        }
    });
});

// Connect to a room, updating the player2 name
app.post("/rooms/:rtdbRoomId", (req, res) => {
    // First, get the room Id and the user name
    const { rtdbRoomId } = req.params;
    const { playerName } = req.body;

    // Get the room reference
    const rtdbRoomPlayersRef = realtimeDB.ref(
        `rooms/${rtdbRoomId}/current-game`
    );

    // Get the room data only once
    rtdbRoomPlayersRef.once("value", (roomSnap) => {
        // Get the room data
        const roomData = roomSnap.val();
        const { player1, player2 } = roomData;

        // Check if the name is valid
        if (player2.name === "" && player1.name !== playerName) {
            // Update the name
            roomData.player2.name = playerName;

            rtdbRoomPlayersRef.update(roomData);

            res.status(200).json({
                message: "ok",
                opponentName: player1.name,
                opponentScore: player1.score,
                myScore: player2.score,
            });
        }

        // If the name matches with some of the names in the room
        else if (player1.name === playerName) {
            res.status(200).json({
                message: "ok",
                opponentName: player2.name,
                opponentScore: player2.score,
                myScore: player1.score,
            });
        } else if (player2.name === playerName) {
            res.status(200).json({
                message: "ok",
                opponentName: player1.name,
                opponentScore: player1.score,
                myScore: player2.score,
            });
        }

        // If the name is definetely not valid for this room
        else {
            res.status(400).json({
                message:
                    "Esta sala ya tiene 2 jugadores, y tu nombre no coincide con ninguno de los registrados",
            });
        }
    });
});

// Change ready status endpoint
app.patch("/setReady", (req, res) => {
    // Get the resources from the user
    const { playerName, rtdbRoomId, ready } = req.body;

    // Get the room reference
    const playerDataRef = realtimeDB.ref(`rooms/${rtdbRoomId}/current-game`);

    // Check where the player is located
    playerDataRef.once("value", (snap) => {
        // Get the game data from this room
        const gameData = snap.val();
        const { player1 } = gameData;

        // Set ready depending on where the player is located
        if (player1.name === playerName) {
            gameData.player1.ready = ready;
        } else {
            gameData.player2.ready = ready;
        }

        // Update
        playerDataRef.update(gameData);

        // Response
        res.status(200).json({
            message: "ok",
        });
    });
});

// Set move endpoint
app.patch("/setMove", (req, res) => {
    // Get the playerName, move, and the rtdbId
    const { playerName, rtdbRoomId, playerMove } = req.body;

    // Get the room reference
    const rtdbRoomRef = realtimeDB.ref(`rooms/${rtdbRoomId}/current-game`);

    // Get the room values
    rtdbRoomRef.once("value", (snap) => {
        const roomValues = snap.val();
        const { player1 } = roomValues;

        // Check which is the player to change its move
        if (player1.name === playerName) {
            roomValues.player1.choice = playerMove;
        } else {
            roomValues.player2.choice = playerMove;
        }

        // Update
        rtdbRoomRef.update(roomValues);

        // Response
        res.status(200).json({
            message: "ok",
        });
    });
});

// Update socre endpoint
app.patch("/setScore", (req, res) => {
    // Get the useful data from the body
    const { winnerName, rtdbRoomId } = req.body;

    // Get the rtdb room reference
    const rtdbRoomRef = realtimeDB.ref(`rooms/${rtdbRoomId}/current-game`);

    // Get the room values
    rtdbRoomRef.once("value", (snap) => {
        const roomValues = snap.val();
        const { player1 } = roomValues;

        // Check which is the winner, and update its score
        if (player1.name === winnerName) {
            roomValues.player1.score += 1;
        } else {
            roomValues.player2.score += 1;
        }

        // Update the room values
        rtdbRoomRef.update(roomValues);

        // Response
        res.status(200).json({
            message: "ok",
        });
    });
});

// Get the index file from the dist folder
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Listen to the requests
app.listen(PORT, () => {
    console.log(`> Aplicación escuchando al puerto ${PORT}`);
});
