import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { callOllamaModel } from './aiModel';

export class ChatWebviewView implements vscode.WebviewViewProvider {
    private webviewView: vscode.WebviewView | undefined;

    constructor(private context: vscode.ExtensionContext) { }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        webviewView.webview.html = this.getWebviewContent();
        this.setWebviewMessageListener(webviewView.webview);
    }

    private getWebviewContent() {
        const htmlPath = vscode.Uri.file(
            path.join(this.context.extensionPath, 'src/media', 'chatView.html')
        );
        let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf-8');
    
        // Get the local path to main script run in the webview, then get the URI of it for use in the webview
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, 'dist', 'chatview.js')
        );
        const scriptUri = this.webviewView?.webview.asWebviewUri(scriptPathOnDisk);
    
        // Get the local path to CSS file, then get the URI of it for use in the webview
        const cssPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, 'src/media', 'styles.css')
        );
        const cssUri = this.webviewView?.webview.asWebviewUri(cssPathOnDisk);
    
        // Replace placeholders in the HTML file
        htmlContent = htmlContent
            .replace(/\$\{webview\.cspSource\}/g, this.webviewView?.webview.cspSource || '')
            .replace(/\$\{scriptUri\}/g, scriptUri?.toString() || '')
            .replace(/\$\{cssUri\}/g, cssUri?.toString() || '');
    
        return htmlContent;
    }

    private setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                switch (message.type) {
                    case 'userInput':
                        this.handleUserInput(message.value);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleUserInput(input: string) {
        const emitter = new EventEmitter();
        let streamedResponse = '';
        let waitingInterval: NodeJS.Timeout;
        const messageQueue: string[] = []; // Message queue to handle messages
        let isProcessingQueue = false; // State variable to track queue processing
    
        const startWaitingEffect = () => {
            let dots = '.';
            this.webviewView?.webview.postMessage({
                type: 'addMessage',
                sender: 'Coder',
                value: dots
            });
    
            waitingInterval = setInterval(() => {
                dots = dots.length < 3 ? dots + '.' : '';
                this.webviewView?.webview.postMessage({
                    type: 'updateMessage',
                    sender: 'Coder',
                    value: dots
                });
            }, 200); // Update every 500ms
        }
    
        const clearWaitingEffect = () => {
            if (waitingInterval) {
                clearInterval(waitingInterval);
            }
        }
    
        const processQueue = () => {
            if (messageQueue.length > 0 && !isProcessingQueue) {
                const message = messageQueue.shift(); // Get the first message in the queue
                if (message) {
                    console.log("__Received message: ", message);
                    isProcessingQueue = true; // Set processing state to true
                    this.webviewView?.webview.postMessage({
                        type: 'updateMessage',
                        sender: 'Coder',
                        value: message
                    });
    
                    // Reset processing state after a brief delay to allow UI to update
                    setTimeout(() => {
                        isProcessingQueue = false; // Reset state after sending message
                        processQueue(); // Process the next message
                    }, 100); // Adjust delay as needed
                }
            }
        }
    
        // Start the waiting effect
        startWaitingEffect();
        const queueInterval = setInterval(processQueue, 100); // Regularly check for new messages
    
        emitter.on('data', (response) => {
            console.log("Received response: ", response);
            clearWaitingEffect();
            streamedResponse += response;
            messageQueue.push(streamedResponse); // Queue the message for sending
        });
    
        emitter.on('end', () => {
            console.log("All data received.");
            clearWaitingEffect();
            messageQueue.push(streamedResponse); // Add final message to the queue
        });
    
        emitter.on('error', (errorMessage) => {
            console.error("Error: ", errorMessage);
            clearWaitingEffect();
            messageQueue.push(`Error: ${errorMessage}`); // Queue error message
        });
    
        try {
            await callOllamaModel(input, emitter);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            clearWaitingEffect();
            messageQueue.push(`Error: ${errorMessage}`); // Queue error message
        }
    
        // Clear the queue interval when processing is complete
        emitter.on('end', () => {
            // Clean up resources
            emitter.removeAllListeners();
            clearWaitingEffect();
            clearInterval(queueInterval)
        });
    }
    
    public addMessage(sender: string, message: string) {
        this.webviewView?.webview.postMessage({ type: 'addMessage', sender, value: message });
    }
}
