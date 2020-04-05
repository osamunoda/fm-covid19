class CustomBurger extends HTMLElement {
    constructor(size, bool, color, sidePanel) {
        super();
        this.bool = bool || false;
        this.size = size || 35;
        this.color = color || "black";
        this.sidePanelName = sidePanel;
        this.sidePanel = null;
        const shadowRoot = this.attachShadow({
            mode: "open"
        });
        shadowRoot.innerHTML = `<style>
        :host{
            display:inline-block;
            width:${this.size}px;
            height:${this.size}px;
            position:relative;
        }
        .box{
            padding:2.5px;
            border:1px solid ${this.color};
            position:relative;
            width:100%;
            height:100%;
            border-radius:5px;
        }
        .bar{
            width:80%;
            height:5px;
            background-color:${this.color};
            margin:5px auto;
        }
        </style>
        <div class="box">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        `;
        this.bar1 = shadowRoot.querySelector(".bar:nth-of-type(1)");
        this.bar2 = shadowRoot.querySelector(".bar:nth-of-type(2)");
        this.bar3 = shadowRoot.querySelector(".bar:nth-of-type(3)");
        this.box = shadowRoot.querySelector(".box");
    }
    connectedCallback() {
        //this.sidePanel = document.getElementById(sidePanel);
        this.onclick = () => {
            const check = this.getAttribute("bool");
            this.setAttribute("bool", check === "true" ? "false" : "true");
        }
    }
    static get observedAttributes() {

        return ["bool", "color", "sidePanel"];
    }
    attributeChangedCallback(name, oldValue, newValue, nameSpaceURI) {
        if (name === "bool") {
            const name = this.getAttribute("sidePanel");
            if (!name) {
                console.log("sidePanel attribute is missing");
            }
            const panel = document.getElementById(name);
            if (!name) {
                console.log("There's no link to side-panel");
            }
            if (newValue === "false") {
                this.bar2.style.opacity = 0;
                this.bar1.style.transform = "translateY(10px) rotate(45deg)";
                this.bar3.style.transform = "translateY(-10px) rotate(-45deg)";
                panel.setAttribute("bool", "true");
            } else {
                this.bar2.style.opacity = 1;
                this.bar1.style.transform = "none";
                this.bar3.style.transform = "none";
                panel.setAttribute("bool", "false");
            }
        }
        if (name === "color") {
            this.color = newValue;
            this.bar1.style.background = newValue;
            this.bar2.style.background = newValue;
            this.bar3.style.background = newValue;
            this.box.style.border = "1px solid " + newValue;
        }
    }
}
customElements.define("custom-burger", CustomBurger);