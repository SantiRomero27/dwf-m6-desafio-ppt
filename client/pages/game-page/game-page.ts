import { Router } from "@vaadin/router";
import { state } from "../../state";

export class GamePage extends HTMLElement {
    // Connects the page to the DOM
    connectedCallback() {
        // Render the page
        this.render();

        // Add event listeners to the page for the first time
        this.addListeners();
    }

    // Add listeners to the page
    addListeners() {
        // Aux elements
        const countdownTimerEl = this.querySelector(".countdown-timer");
        const handsComps = this.querySelectorAll("hand-comp");

        // Aux variable
        let countdownTimer: number = 5;

        // Add event listeners to the hands
        handsComps.forEach((handComp) => {
            // Everytime a hand gets clicked, get the Move
            handComp.addEventListener("handClick", (e: any) => {
                // Get the move
                const selectedMove = e.detail.handMove;

                // Set my move
                state.setMyMove(selectedMove);

                // Hands animation event
                handsComps.forEach((auxHand) => {
                    // Get the image element
                    const imageEl = auxHand.shadowRoot.querySelector(".hand");

                    // If the selected move is not equal to the aux hand, just deactivate it
                    if (auxHand.getAttribute("hand") !== selectedMove) {
                        imageEl.classList.add("inactive-hand");
                        imageEl.classList.remove("active-hand");
                    }

                    // But, if it is equal to the aux hand, activate it
                    else if (auxHand.getAttribute("hand") === selectedMove) {
                        imageEl.classList.add("active-hand");
                        imageEl.classList.remove("inactive-hand");
                    }
                });
            });
        });

        // Timer handling
        const timerIntervalID = setInterval(() => {
            // Listen to the opponent moves
            state.listenOpponentMoves();

            // The timer stops when it gets to 0
            if (countdownTimer === 0) {
                // Break the interval
                clearInterval(timerIntervalID);

                // Show the hands
                Router.go("/show-hands");
            }

            // Change the countdown number
            countdownTimerEl.textContent = countdownTimer.toString();

            // Reduce the time
            countdownTimer -= 1;
        }, 1000);
    }

    // Render method
    render() {
        // Set content for the page element
        this.innerHTML = `
        <div class="game-countdown">
            <h2 class="countdown-timer">5</h2>
            <div class="hands-container-countdown">
                <hand-comp hand="scissors"></hand-comp>
                <hand-comp hand="rock"></hand-comp>
                <hand-comp hand="paper"></hand-comp>
            </div>
        </div>`;
    }
}

// Define the custom element
customElements.define("game-page", GamePage);
