class SidePanel extends HTMLElement {
    constructor(size, bool, parent, target) {
        super();
        this.bool = bool || false;
        this.parent = parent || "";
        this.size = size;
        this.target = target || "";

        const shadowRoot = this.attachShadow({
            mode: "open"
        });
        shadowRoot.innerHTML = `<style>
        :host{
            width:${this.size}px;
            height:calc(100vh - 145px);
            position:absolute;
            overflow:hidden;
            transition:left 0.4s;
        }
        .box{
            box-sizing:border-box;
            
            position:relative;
            width:100%;
            height:100%;
        }
        </style>
        <div class="box"></div>
        `;

        this.box = shadowRoot.querySelector(".box");
    }
    connectedCallback() {

    }
    static get observedAttributes() {
        return ["bool", "size", "parent"];
    }
    attributeChangedCallback(name, oldValue, newValue, nameSpaceURI) {
        if (name === "size") {
            this.size = newValue;
            this.style.width = newValue + "px";
        }
        if (name === "parent") {
            this.parent = newValue;
        }
        if (name === "bool") {
            if (newValue === "false") {
                this.style.left = "-" + this.getAttribute("size") + "px";
            } else {
                if (!this.box.childNodes.length && this.getAttribute("target")) {
                    const content = document.getElementById(this.getAttribute("target"));
                    content.style.display = "block";
                    this.box.appendChild(content);
                    const parentID = this.getAttribute("parent");
                    if (parentID && document.getElementById(parentID)) {
                        const parent = document.getElementById(parentID);
                        this.style.top = parent.getBoundingClientRect().top + window.scrollY + "px";
                        this.style.height = parent.getBoundingClientRect().height + "px";
                    }
                }
                this.style.left = 0;
            }
        }
    }
}
customElements.define("side-panel", SidePanel);