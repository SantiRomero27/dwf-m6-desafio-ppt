import "./pages/name-page/name-page";
import "./pages/home/home";
import "./pages/access-room/access-room";
import "./pages/instructions/instructions";
import "./pages/room-fail/room-fail";
import "./pages/waiting-room/waiting-room";
import "./pages/game-page/game-page";
import "./pages/show-hands/show-hands";
import "./pages/result-page/result-page";

import "./components/custom-button/custom-button";
import "./components/hand-comp/hand-comp";
import "./components/custom-input/custom-input";

import { state } from "./state";
import { Router } from "@vaadin/router";
import "./router";

// Main function
(function () {
    // Init state
    state.init();

    // Get the current name
    const currentName = state.getState().myName;

    // If name exists, go to home page directly
    if (currentName) {
        Router.go("/home");
    } else if (!currentName && location.pathname !== "/") {
        Router.go("/");
    }
})();
