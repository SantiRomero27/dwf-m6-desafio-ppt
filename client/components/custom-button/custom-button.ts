export class CustomButton extends HTMLElement {
    // Initial properties
    shadow: ShadowRoot;

    // Constructor
    constructor() {
        // Inherit all properties
        super();

        // Create the Shadow DOM
        this.shadow = this.attachShadow({ mode: "open" });
    }

    // Connect the component with the DOM
    connectedCallback() {
        this.render();

        // Get the closest form, and check if it exists
        const closestFormEl = this.closest("form");

        if (!closestFormEl) {
            return;
        }

        // Everytime it gets clicked, send a submit event
        this.onclick = () => closestFormEl.dispatchEvent(new Event("submit"));
    }

    // Render method
    render() {
        // Get the button text
        const buttonText = this.getAttribute("text") || "Empezar";

        // Create the button element
        const buttonEl = document.createElement("button");
        buttonEl.setAttribute("class", "custom-button");

        // Create styles
        const buttonStyles = document.createElement("style");
        buttonStyles.innerHTML = `
        * {
            box-sizing: border-box;
        }
        
        .custom-button {
            width: 100%;
            padding: 10px;
            
            font-family: inherit;
            font-size: 45px;
            background-color: #006cfc;
            color: white;
            border: solid 10px #001997;
            border-radius: 10px;
            cursor: pointer;
            transition: opacity 0.3s ease;
        }
        
        .custom-button:hover {
            opacity: 0.85;
        }`;

        // Set the button textContent
        buttonEl.textContent = buttonText;

        // Append the styles to the shadow, and finally the element
        this.shadow.appendChild(buttonStyles);
        this.shadow.appendChild(buttonEl);
    }
}

// Define the component
customElements.define("custom-button", CustomButton);
