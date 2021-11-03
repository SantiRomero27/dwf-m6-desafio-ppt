import { Router } from "@vaadin/router";
import { state } from "../../state";

// Image routes
const resultVisual = {
    userWin: require("url:../../assets/userWin.svg"),
    opponentWin: require("url:../../assets/opponentWin.svg"),
    tiedGame: require("url:../../assets/tiedGame.svg"),
};

export class ResultPage extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add listeners to the page
        this.addListeners();
    }

    // Add listeners method
    addListeners() {
        // Get the button
        const buttonEl = this.querySelector("custom-button");

        // Once it gets clicked, go to the instructions page again
        buttonEl.addEventListener("click", () => {
            // Set the player status as not ready
            state.changeReadyStatus(false);

            Router.go("/instructions");
        });
    }

    // Render method
    render() {
        // Get the current game, and the result
        const currentGame = state.getCurrentGame();
        const gameResult = state.getResult(
            currentGame.myMove,
            currentGame.opponentMove
        );

        // Update the history
        state.updateHistory(gameResult);

        // Get the current state
        const currentState = state.getState();

        // Set content for the page element
        this.innerHTML = `
        <div class="result">
            <div class="image-container">
                <img src=${resultVisual[gameResult]} class="result-image" />
            </div>

            <div class="score-container">
                <h2 class="score-container__title">Score</h2>
                <article class="score-container__data">
                    <h3 class="score-container__my-data result-score">
                        ${currentState.myName}: ${currentState.history.myScore}
                    </h3>
                    <h3 class="score-container__opponent-data result-score">
                        ${currentState.opponentName}: ${currentState.history.opponentScore}
                    </h3>
                </article>
            </div>

            <div class="button-container">
                <custom-button text="Volver a jugar"></custom-button>
            </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("result-page", ResultPage);
