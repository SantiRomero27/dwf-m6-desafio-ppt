class CustomInput extends HTMLElement {
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

    // Render method
    render() {
        // Get the placeholder attribute
        const placeholderAttr = this.getAttribute("placeholder");

        // Create the input element
        const inputEl = document.createElement("input");
        inputEl.setAttribute("class", "custom-input");

        // Set the placeholder if exists
        if (placeholderAttr) {
            inputEl.setAttribute("placeholder", placeholderAttr);
        }

        // Create styles
        const inputStyles = document.createElement("style");
        inputStyles.innerHTML = `
            * {
                box-sizing: border-box;
            }

            .custom-input {
                width: 100%;
                padding: 10px;
            
                font-family: inherit;
                font-size: 45px;
                text-align: center;
                border: solid 10px black;
                border-radius: 10px;
            }

            .custom-input::placeholder {
                color: #878787a6;
            }
        `;

        // Append the styles, and the element to the shadow DOM
        this.shadow.appendChild(inputStyles);
        this.shadow.appendChild(inputEl);
    }
}

// Define the component
customElements.define("custom-input", CustomInput);
