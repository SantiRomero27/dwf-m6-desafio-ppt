import { Router } from "@vaadin/router";
import { state } from "../../state";

export class WaitingRoom extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        // Render the page for the first time
        this.render();

        // Add the event listeners once
        this.addListeners();

        // Subscribe to the changes made to the state ---> Update opponent name
        state.subscribe(() => {
            this.render();
        });
    }

    // Add listeners to the page
    addListeners() {
        // Listen to the ready statuses from the server
        state.listenReady(() => {
            // Go to the Game Page
            Router.go("/game");
        });

        // When the tab is closed, change the ready status to false
        window.onbeforeunload = () => {
            state.changeReadyStatus(false, () => {
                return;
            });
        };
    }

    // Render method
    render() {
        // Get the last state
        const currentState = state.getState();

        // Aux variables
        const { myName, roomId } = currentState;
        let { opponentName } = currentState;
        const { myScore, opponentScore } = currentState.history;

        opponentName = opponentName || "Oponente";

        // Set content for the custom element
        this.innerHTML = `
        <div class="waiting-room">
            <!-- Header -->
            <header class="info-header">
                <!-- Scores container -->
                <div class="info-header__scores-container">
                    <p class="score">${myName}: ${myScore}</p>
                    <p class="score opponent-score">${opponentName}: ${opponentScore}</p>
                </div>

                <!-- Room info -->
                <div class="info-header__room-info">
                    <p class="room-info__title">Sala</p>
                    <p class="room-info__code">${roomId}</p>
                </div>
            </header>

            <p class="waiting-room__text">
            Esperando a que <b>${opponentName}</b> presione ¡Jugar...!
            </p>

            <!-- Hands container -->
            <div class="hands-container">
                <hand-comp hand="scissors"></hand-comp>
                <hand-comp hand="rock"></hand-comp>
                <hand-comp hand="paper"></hand-comp>
            </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("waiting-room-page", WaitingRoom);
