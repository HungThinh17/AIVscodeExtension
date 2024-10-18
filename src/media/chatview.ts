
import * as commonmark from 'commonmark';
import hljs from 'highlight.js';

import javascript from 'highlight.js/lib/languages/javascript';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import rust from 'highlight.js/lib/languages/rust';
import delphi from 'highlight.js/lib/languages/delphi'; // Pascal is part of Delphi in highlight.js

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('delphi', delphi); // This will handle Pascal

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
const parser = new commonmark.Parser();
const renderer = new commonmark.HtmlRenderer();

function formatMessage(message: string): HTMLElement {
    let retElement = document.createElement('div');
    const parsed = parser.parse(message);
    
    // Convert the parsed content to HTML
    let htmlContent = renderer.render(parsed);
    
    // Use a regular expression to find code blocks
    const codeBlockRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
    
    htmlContent = htmlContent.replace(codeBlockRegex, (match, codeContent) => {
        // Unescape HTML entities
        const unescapedCode = codeContent
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        
        // Auto-detect language and highlight
        const highlighted = hljs.highlightAuto(unescapedCode);
        
        // Return the highlighted code wrapped in pre and code tags
        return `<pre><code class="hljs ${highlighted.language}">${highlighted.value}</code></pre>`;
    });
    
    retElement.innerHTML = htmlContent;
    return retElement;
}

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
            const messageElement = formatMessage(message);
            appendMessage('You', messageElement);
            userInput.value = '';
        }
    });

    window.addEventListener('message', (event: MessageEvent) => {
        const message = event.data as ChatMessage;
        switch (message.type) {
            case 'addMessage':
                if (message.sender && message.value) {
                    const messageElement = formatMessage(message.value);
                    appendMessage(message.sender, messageElement);
                }
                break;
            case 'updateMessage': // New case for handling updates
                if (message.sender && message.value) {
                    // Assuming you have a function to update the existing message
                    const messageElement = formatMessage(message.value);
                    updateMessage(message.sender, messageElement);
                }
                break;
            case 'finalizeMessage': // Optional: Handle final message if needed
                if (message.sender && message.value) {
                    const messageElement = formatMessage(message.value);
                    appendMessage(message.sender, messageElement); // You can append or replace the message
                }
                break;
            default:
                console.warn("Unknown message type:", message.type);
                break;
        }

    });
}

function updateMessage(sender: string, message: string | HTMLElement) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }

    // Find all message elements in the chat output
    const messageElements = chatOutput.querySelectorAll(sender === 'Coder'? 'div.bot-message-content': 'div.user-message');
    let latestMessageElement = messageElements[messageElements.length - 1];

    // Update the latest message, or append a new one if none found
    if (latestMessageElement) {
        if (message instanceof HTMLElement) {
            latestMessageElement.innerHTML = '';
            latestMessageElement.appendChild(message);
        } else {
            latestMessageElement.textContent = message;
        }
    } else {
        // If no previous message found, create a new one
        const newMessageElement = document.createElement(sender === 'Coder'? 'div.bot-message-content': 'div.user-message');
        if (message instanceof HTMLElement) {
            newMessageElement.appendChild(message);
        } else {
            newMessageElement.textContent = message;
        }
        chatOutput.appendChild(newMessageElement);
    }

    // Ensure chat output is scrolled to the bottom
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

function buildBotMessage(message: HTMLElement): HTMLElement {
    const botMessage = document.createElement('div');
    botMessage.innerHTML = `
        <div class="bot-message-content">
            ${message}
        </div>
        <hr class="message-separator">
        <div class="interaction-buttons">
            <button class="interaction-button like-button" aria-label="Like">
                <i class="far fa-thumbs-up"></i>
            </button>
            <button class="interaction-button dislike-button" aria-label="Dislike">
                <i class="far fa-thumbs-down"></i>
            </button>
        </div>
    `;
    return botMessage;
}

function appendMessage(sender: string, message: string | HTMLElement) {
    const chatOutput = document.getElementById('chat-output') as HTMLDivElement;
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'Coder' ? 'bot-message' : 'user-message');
    if (message instanceof HTMLElement) {
        messageElement.appendChild(sender === 'Coder' ? buildBotMessage(message) : message);
    } else {
        messageElement.textContent = message;
    }
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

initializeChatView();
