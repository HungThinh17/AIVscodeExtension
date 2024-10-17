import * as vscode from 'vscode';
import { EventEmitter } from 'events';

// VietCodeItem definition
export class VietCodeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId: string,
        public readonly iconPath?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.command = {
            command: commandId,
            title: label,
        };
    }
}

export class ChatViewItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId: string,
        public readonly iconPath?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.command = {
            command: 'vietcode.focusChat',
            title: 'Focus Chat',
            arguments: []
        };
    }
}

export async function callOllamaModel(promptText: string, emitter: EventEmitter): Promise<void> {
    const apiEndpoint = "http://localhost:11434/api/generate"; // Ollama API URL
    const model = "llama2"; // Model name

    const requestBody = {
        model: model,
        prompt: promptText
    };

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Error: ${response.status} - ${errorDetails}`);
        }

        // Check if the response is JSON
        // if (contentType && contentType.includes("application/json")) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { done: streamDone, value } = await reader!.read();
                done = streamDone;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const chunkResponses = chunk.trim().split('\n'); // Split the chunk into individual JSON objects

                    for (const chunkResponse of chunkResponses) {
                        if (chunkResponse) {
                            try {
                                const data = JSON.parse(chunkResponse);
                                if (data.response) {
                                    emitter.emit('data', data.response); // Emit the response for UI update
                                }
                                if (data.done) {
                                    done = true; // Stop reading when done is true
                                }
                            } catch (error) {
                                console.error("__vietcode JSON parse error: ", error);
                            }
                        }
                    }
                }
            }
            emitter.emit('end'); // Emit an end event once done
        // } else {
        //     // Log non-JSON response
        //     const responseText = await response.text();
        //     console.error("__vietcode Non-JSON response: " + responseText);
        //     throw new Error("Unexpected non-JSON response from Ollama API.");
        // }
    } catch (error: any) {
        console.error("__vietcode Error: " + error.message);
        emitter.emit('error', error.message); // Emit error for UI error handling
    }
}

