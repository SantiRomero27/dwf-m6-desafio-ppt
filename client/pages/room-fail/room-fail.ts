import { Router } from "@vaadin/router";

export class RoomFail extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add event listeners
        this.addListeners();
    }

    // Add Listeners method
    addListeners() {
        // Get the button
        const buttonEl = this.querySelector("custom-button");

        buttonEl.addEventListener("click", () => {
            Router.go("/home");
        });
    }

    // Render method
    render() {
        // Set content for the custom element
        this.innerHTML = `
        <div class="room-fail">
                <h1 class="game-title">Piedra, Papel, ó Tijera</h1>

                <div class="room-fail__info">
                    <p class="room-fail__info-text">Ups, esta sala está completa y tu nombre no coincide con nadie en la sala.</p>
                    <custom-button text="Volver"></custom-button>
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
customElements.define("room-fail-page", RoomFail);
