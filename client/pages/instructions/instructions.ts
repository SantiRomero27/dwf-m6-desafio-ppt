import { Router } from "@vaadin/router";
import { state } from "../../state";

// Page element
export class Instructions extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add event listeners once
        this.addListeners();
    }

    // Add listeners method
    addListeners() {
        // Get the custom button
        const buttonEl = this.querySelector("custom-button");

        // Redirect to the waiting room, by clicking the button
        buttonEl.addEventListener("click", () => {
            // Set ready
            state.changeReadyStatus(true, () => {
                // Restart the move before playing
                state.setMyMove("none", () => {
                    // Go to the waiting room
                    Router.go("/waiting");
                });
            });
        });
    }

    // Render method
    render() {
        // Get the last state
        const currentState = state.getState();

        // Aux variables
        const { myName, opponentName, roomId } = currentState;
        const { myScore, opponentScore } = currentState.history;

        // Set content for the custom element
        this.innerHTML = `
        <div class="instructions">
            <!-- Header -->
            <header class="info-header">
                <!-- Scores container -->
                <div class="info-header__scores-container">
                    <p class="score">${myName}: ${myScore}</p>
                    <p class="score opponent-score">${
                        opponentName ? opponentName : "Oponente"
                    }: ${opponentScore}</p>
                </div>

                <!-- Room info -->
                <div class="info-header__room-info">
                    <p class="room-info__title">Sala</p>
                    <p class="room-info__code">${roomId}</p>
                </div>
            </header>

            <p class="instructions-text">
            Presioná jugar y elegí: piedra, papel o tijera antes de que
            pasen los 5 segundos.
            </p>
            <custom-button text="¡Jugar!"></custom-button>
            <div class="hands-container">
                <hand-comp hand="scissors"></hand-comp>
                <hand-comp hand="rock"></hand-comp>
                <hand-comp hand="paper"></hand-comp>
            </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("instructions-page", Instructions);
