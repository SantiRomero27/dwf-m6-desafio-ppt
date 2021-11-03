import { Router } from "@vaadin/router";
import { state } from "../../state";

// Page element
export class AccessRoom extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add listeners after rendering the page
        this.addListeners();
    }

    // Add event listeners method
    addListeners() {
        // Get the form and the current state
        const codeFormEl = this.querySelector(".code-form");

        // Add the submit listener
        codeFormEl.addEventListener("submit", (e) => {
            // Prevent default behavior
            e.preventDefault();

            // Get the target, and its value
            const targetEl: any = e.target;
            const inputValue: string =
                targetEl.children[0].shadowRoot.children[1].value.trim();

            if (!inputValue) {
                return;
            }

            // Set the room id to the state
            state.setRoomId(inputValue);

            // Get the realtime DB ID
            state.getRealtimeDBID((err: string) => {
                // If there's an error, return
                if (err) {
                    alert(err);

                    return;
                }

                // If there's not an error, check if the room is available
                state.joinRoom((err: boolean) => {
                    // If the room is not available, go to the room-fail page
                    if (err) {
                        Router.go("/room-fail");

                        return;
                    }

                    // Go to the instructions page
                    Router.go("/instructions");
                });
            });
        });
    }

    // Render method
    render() {
        // Set content for the custom element
        this.innerHTML = `
        <div class="access-room">
            <h1 class="game-title">Piedra, Papel, ó Tijera</h1>

            <form class="code-form">
                <custom-input placeholder="Código"></custom-input>
                <custom-button text="Ingresar a la sala"></custom-button>
            </form>

            <div class="hands-container">
                <hand-comp hand="scissors"></hand-comp>
                <hand-comp hand="rock"></hand-comp>
                <hand-comp hand="paper"></hand-comp>
            </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("access-room-page", AccessRoom);
