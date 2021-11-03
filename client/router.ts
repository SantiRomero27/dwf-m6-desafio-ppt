import { Router } from "@vaadin/router";

// Get the root element
const rootEl = document.querySelector("#root");

// Instance a new Router
const myRouter = new Router(rootEl);

// Set the routes
myRouter.setRoutes([
    {
        path: "/",
        component: "name-page",
    },
    {
        path: "/home",
        component: "home-page",
    },
    {
        path: "/access-room",
        component: "access-room-page",
    },
    {
        path: "/instructions",
        component: "instructions-page",
    },
    {
        path: "/room-fail",
        component: "room-fail-page",
    },
    {
        path: "/waiting",
        component: "waiting-room-page",
    },
    {
        path: "/game",
        component: "game-page",
    },
    {
        path: "/show-hands",
        component: "show-hands-page",
    },
    {
        path: "/result",
        component: "result-page",
    },
]);
