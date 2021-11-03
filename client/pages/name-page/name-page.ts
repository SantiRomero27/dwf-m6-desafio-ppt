import { Router } from "@vaadin/router";
import { state } from "../../state";

export class NamePage extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // Add listeners to the page, after being rendered --> Only once
        this.addListeners();
    }

    // Add listeners method
    addListeners() {
        // Get the form element, and the continue button
        const formEl = this.querySelector(".name-form");

        // Add an event listener to the form, everytime it gets submitted
        formEl.addEventListener("submit", (e) => {
            // Prevent default form behavior
            e.preventDefault();

            // First of all, get the input value
            const targetEl: any = e.target;
            const inputValue: string =
                targetEl.children[0].shadowRoot.children[1].value.trim();

            // If nothing is in the input, just return...
            if (!inputValue) {
                return;
            }

            // If the name is too long, tell the user!
            else if (inputValue.length > 15) {
                alert("El nombre ingresado es muy largo!");

                return;
            }

            // Set the name to the state, and sign up
            state.setName(inputValue);
            state.signUp((err: string) => {
                // If an error occured, alert it
                if (err) {
                    alert(err);

                    return;
                }

                // Go to the home page after signing up
                Router.go("/home");
            });
        });
    }

    // Render method
    render() {
        // Set content for the custom element
        this.innerHTML = `
        <div class="name-page">
            <h1 class="game-title">Piedra, Papel, ó Tijera</h1>

            <p class="name-label">Tu nombre</p>
            <form class="name-form">
                <custom-input></custom-input>
                <custom-button text="Continuar"></custom-button>
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
customElements.define("name-page", NamePage);
