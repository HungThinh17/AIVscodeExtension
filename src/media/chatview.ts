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

export function initializeChatView() {
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
            appendMessage('User', message);
            userInput.value = '';
        }
    });

    window.addEventListener('message', (event: MessageEvent) => {
        const message = event.data as ChatMessage;
        switch (message.type) {
            case 'addMessage':
                if (message.sender && message.value) {
                    appendMessage(message.sender, message.value);
                }
                break;
            case 'updateMessage': // New case for handling updates
                if (message.sender && message.value) {
                    // Assuming you have a function to update the existing message
                    updateMessage(message.sender, message.value);
                }
                break;
            case 'finalizeMessage': // Optional: Handle final message if needed
                if (message.sender && message.value) {
                    appendMessage(message.sender, message.value); // You can append or replace the message
                }
                break;
            default:
                console.warn("Unknown message type:", message.type);
                break;
        }
    });
}

function updateMessage(sender: string, message: string) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }

    // Find all message elements in the chat output
    const messageElements = chatOutput.querySelectorAll('div');
    let latestMessageElement: HTMLElement | null = null;

    // Iterate through messages to find the latest one from the sender
    for (let i = messageElements.length - 1; i >= 0; i--) {
        const element = messageElements[i];
        // Check if the element's text starts with the sender's name
        if (element.textContent && element.textContent.startsWith(`${sender}:`)) {
            latestMessageElement = element; // Store reference to the latest message
            break; // Exit loop once the latest message is found
        }
    }

    // Update the latest message, or append a new one if none found
    if (latestMessageElement) {
        latestMessageElement.textContent = `${sender}: ${message}`; // Update the latest message text
    } else {
        // If no previous message found, create a new one
        const newMessageElement = document.createElement('div');
        newMessageElement.textContent = `${sender}: ${message}`;
        chatOutput.appendChild(newMessageElement);
    }

    // Ensure chat output is scrolled to the bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
}


function appendMessage(sender: string, message: string) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

export const ChatView = {
    initializeChatView: initializeChatView
};
