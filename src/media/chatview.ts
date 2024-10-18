declare function acquireVsCodeApi(): {
    postMessage(message: any): void;
    setState(state: any): void;
    getState(): any;
};

interface VSCodeAPI {
    postMessage(message: any): void;
    setState(state: any): void;
    getState(): any;
}

interface ChatMessage {
    type: string;
    sender?: string;
    value: string;
}

let vscode: VSCodeAPI;

function initializeChatView() {
    vscode = acquireVsCodeApi();
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    const userInput = document.getElementById('user-input') as HTMLInputElement;

    if (!chatOutput || !userInput) {
        console.error('Required DOM elements not found');
        return;
    }

    userInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            const message = userInput.value;
            vscode.postMessage({ type: 'userInput', value: message });
            const fragment = document.createRange().createContextualFragment(message);
            appendMessage('You', fragment);
            userInput.value = '';
        }
    });

    window.addEventListener('message', (event: MessageEvent) => {
        const message = event.data as ChatMessage;
        switch (message.type) {
            case 'addMessage':
                if (message.sender && message.value) {
                    const fragment = document.createRange().createContextualFragment(message.value);
                    appendMessage(message.sender, fragment);
                }
                break;
            case 'updateMessage': // New case for handling updates
                if (message.sender && message.value) {
                    // Assuming you have a function to update the existing message
                    const fragment = document.createRange().createContextualFragment(message.value);
                    updateMessage(message.sender, fragment);
                }
                break;
            case 'finalizeMessage': // Optional: Handle final message if needed
                if (message.sender && message.value) {
                    const fragment = document.createRange().createContextualFragment(message.value);
                    appendMessage(message.sender, fragment); // You can append or replace the message
                }
                break;
            default:
                console.warn("Unknown message type:", message.type);
                break;
        }

    });}

function updateMessage(sender: string, message: string|DocumentFragment) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }

    // Find all message elements in the chat output
    const messageElements = chatOutput.querySelectorAll('div.message.bot-message');
    let latestMessageElement = messageElements[messageElements.length - 1];

    // Update the latest message, or append a new one if none found
    if (latestMessageElement) {
        if (message instanceof DocumentFragment) {
            latestMessageElement.innerHTML = '';
            latestMessageElement.appendChild(message);
        } else {
            latestMessageElement.textContent = message;
        }
    } else {
        // If no previous message found, create a new one
        const newMessageElement = document.createElement('div');
        if (message instanceof DocumentFragment) {
            newMessageElement.appendChild(message);
        } else {
            newMessageElement.textContent = message;
        }
        chatOutput.appendChild(newMessageElement);
    }

    // Ensure chat output is scrolled to the bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
}


function appendMessage(sender: string, message: string|DocumentFragment) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'Coder' ? 'bot-message' : 'user-message');
    if (message instanceof DocumentFragment) {
        messageElement.appendChild(message);
    } else {
        messageElement.textContent = message;
    }
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

initializeChatView();
