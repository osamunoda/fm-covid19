class Spinner extends HTMLElement {
    constructor(size, bool, top, left) {
        super();
        this.bool = bool || false;
        this.size = size || 100;
        this._top = top || 0;
        this._left = left || 0;

        const shadowRoot = this.attachShadow({
            mode: "open"
        });
        shadowRoot.innerHTML = `<style>
        :host{
            width:${this.size}px;
            height:${this.size}px;
            left: ${this._left - this.size / 2}px;
            top: ${this._top - this.size / 2}px;
            font-size: 10px;
            position: absolute;
            text-indent: -9999em;
            border-top: 1.1em solid rgba(169,169,169, 0.2);
            border-right: 1.1em solid rgba(169,169,169, 0.2);
            border-bottom: 1.1em solid rgba(169,169,169, 0.2);
            border-left: 1.1em solid #a9a9a9;
            border-radius:50%;
            transform: translateZ(0);
            display:none;
            animation: load8 1.1s infinite linear;
        }

        @keyframes load8 {
            0% {
                -webkit-transform: rotate(0deg);
                transform: rotate(0deg);
            }
            100% {
                -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }
        
        </style>
        <div class="spinner"></div>
        `;
    }
    connectedCallback() {

    }
    static get observedAttributes() {
        return ["bool", "size", "_left", "_top"];
    }
    attributeChangedCallback(name, oldValue, newValue, nameSpaceURI) {
        if (name === "size") {
            this.size = Number(newValue);
            this.style.width = newValue + "px";
            this.style.height = newValue + "px";
        }
        if (name === "bool") {
            this.bool = newValue;
            if (newValue === "false") {
                this.style.dispaly = "none";
            } else {
                this.style.display = "block";
            }
        }
        if (name === "_left") {
            this._left = Number(newValue);
            if (this._left === 0) {
                this._left = window.innerWidth / 2;
            }
            this.style.left = this._left - this.size / 2 + "px";
        }
        if (name === "_top") {
            this._top = Number(newValue);
            if (this._top === 0) {
                this._top = window.innerHeight / 2;
            }
            this.style.top = this._top - this.size / 2 + "px";
        }
    }
}
customElements.define("spin-icon", Spinner);