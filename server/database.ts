import * as firebaseAdmin from "firebase-admin";
const serviceKey = require("../serviceKey.json");

// Initialice the firebase app
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceKey as any),
    databaseURL: "https://apx-dwf-m6-desafio-default-rtdb.firebaseio.com",
});

// Instance the databases
const firestoreDB = firebaseAdmin.firestore();
const realtimeDB = firebaseAdmin.database();

export { firestoreDB, realtimeDB };
