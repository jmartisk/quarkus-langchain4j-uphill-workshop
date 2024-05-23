import {css, LitElement} from 'lit';
import '@vaadin/icon';
import '@vaadin/button';
import '@vaadin/text-field';
import '@vaadin/text-area';
import '@vaadin/form-layout';
import '@vaadin/progress-bar';
import '@vaadin/checkbox';
import '@vaadin/horizontal-layout';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';

export class DemoChat extends LitElement {
    static styles = css`
      .button {
        cursor: pointer;
      }
    `;

    static properties = {
        _insideStreaming: {type: Boolean}
    }

    constructor() {
        super();
        this._insideStreaming = false;
    }

    connectedCallback() {
        const chatBot = document.getElementsByTagName("chat-bot")[0];

        const socket = new WebSocket("ws://" + window.location.host + "/customer-support-agent");

        socket.onmessage = (event) => {
            if(event.data === "<BEGIN-STREAMING>") {
                this._insideStreaming = true;
                chatBot.sendMessage("", {
                    right: false
                });
            } else if(event.data === "<END-STREAMING>") {
                this._insideStreaming = false;
            }
            else if(this._insideStreaming) {
                chatBot.messages[chatBot.messages.length - 1].message += event.data;
            } else {
                chatBot.sendMessage(event.data, {
                    right: false
                });
            }
        }

        chatBot.addEventListener("sent", function (e) {
            if (e.detail.message.right === true) {
                // User message
                socket.send(e.detail.message.message);
                chatBot.sendMessage("", {
                    right: false,
                    loading: true
                });
            }
        });
    }
}

customElements.define('demo-chat', DemoChat);