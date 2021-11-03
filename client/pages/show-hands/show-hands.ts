import { Router } from "@vaadin/router";
import { state } from "../../state";

export class ShowHandsPage extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        this.render();

        // After rendering, go to the results page
        setTimeout(() => {
            Router.go("/result");
        }, 5000);
    }

    // Render method
    render() {
        // Get the current game
        const currentGame = state.getCurrentGame();

        // Set content for the page element
        this.innerHTML = `
        <div class="game-hands-show">
            <hand-comp hand=${currentGame.opponentMove} class="opponent-hand" height="215px" width="90px"></hand-comp>
            <hand-comp hand=${currentGame.myMove} class="my-hand" height="215px" width="90px"></hand-comp>
        </div>
        `;
    }
}

// Define the custom element
customElements.define("show-hands-page", ShowHandsPage);
