// Hand files
const handFiles = {
    rock: require("url:../../assets/piedra.png"),
    paper: require("url:../../assets/papel.png"),
    scissors: require("url:../../assets/tijera.png"),
};

// Create the class
export class HandComponent extends HTMLElement {
    // Initial properties
    shadow: ShadowRoot;

    // Constructor
    constructor() {
        // Inherit all properties
        super();

        // Create the Shadow DOM
        this.shadow = this.attachShadow({ mode: "open" });
    }

    // Connect the component to the DOM
    connectedCallback() {
        this.render();
    }

    // Method that adds listeners to the custom element
    addListeners() {
        // Create a custom event, that returns the hand selected by the user
        this.addEventListener("click", () => {
            // Create the custom event
            const handClickEvent = new CustomEvent("handClick", {
                detail: {
                    handMove: this.getAttribute("hand"),
                },
            });

            // Dispatch the event
            this.dispatchEvent(handClickEvent);
        });
    }

    // Render method
    render() {
        // Get the selected hand
        const handType = this.getAttribute("hand") || "rock";

        // Get the size attributes
        const heightAttr = this.getAttribute("height") || "175px";
        const widthAttr = this.getAttribute("width") || "70px";

        // Create the img element
        const imgEl = document.createElement("img");
        imgEl.setAttribute("src", handFiles[handType]);
        imgEl.setAttribute("class", "hand");

        // Create styles
        const handStyles = document.createElement("style");
        handStyles.innerHTML = `
                * {
                    box-sizing: border-box;
                }
                .hand {
                    height: ${heightAttr};
                    width: ${widthAttr};
                    transform: translateY(30px);
                    transition: all 0.3s ease-in-out;
                    cursor: pointer;
                }
                .active-hand {
                    transform: translateY(5px);
                    transition: all 0.3s ease-in-out;
                }
                .inactive-hand {
                    opacity: 45%;
                    transition: all 0.3s ease-in-out;
                }`;

        // Append the element to the shadow
        this.shadow.appendChild(handStyles);
        this.shadow.appendChild(imgEl);

        // Add the listeners to the component
        this.addListeners();
    }
}

// Define the component
customElements.define("hand-comp", HandComponent);
