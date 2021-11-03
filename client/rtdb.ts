import firebase from "firebase";

// Initialice the firebase app
firebase.initializeApp({
    apiKey: "EAG9o9dCDt5VEwpgkoLy7dmtmqvB41JVA4luPc5v",
    databaseURL: "https://apx-dwf-m6-desafio-default-rtdb.firebaseio.com/",
    authDomain: "apx-dwf-m6-desafio.firebaseapp.com",
});

// Instance
const rtdbFront = firebase.database();

// Export
export { rtdbFront };
