import { Router } from "@vaadin/router";
import { state } from "../../state";

export class Home extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add the listeners after rendering the page
        this.addListeners();
    }

    // Add listeners to the page elements
    addListeners() {
        // Get the buttons
        const newGameButtonEl = this.querySelector(
            "custom-button:first-of-type"
        );
        const accessRoomButtonEl = this.querySelector(
            "custom-button:last-of-type"
        );

        // After clicking, redirect to the specified pages
        newGameButtonEl.addEventListener("click", () => {
            // Get the new room ID
            state.getNewRoom(() => {
                state.getRealtimeDBID((err: string) => {
                    // If there's an error, alert
                    if (err) {
                        alert(err);

                        return;
                    }

                    // Restart the state data --> In case the user creates a new room, after playing with a game
                    state.restartData();

                    // Go to the instructions page
                    Router.go("/instructions");
                });
            });
        });

        accessRoomButtonEl.addEventListener("click", () => {
            Router.go("/access-room");
        });
    }

    // Render method
    render() {
        // Set content for the custom element
        this.innerHTML = `
        <div class="home">
                <h1 class="game-title">Piedra, Papel, ó Tijera</h1>

                <div class="buttons-container">
                    <custom-button text="Nuevo juego"></custom-button>
                    <custom-button text="Ingresar a una sala"></custom-button>
                </div>

                <div class="hands-container">
                    <hand-comp hand="scissors"></hand-comp>
                    <hand-comp hand="rock"></hand-comp>
                    <hand-comp hand="paper"></hand-comp>
                </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("home-page", Home);
