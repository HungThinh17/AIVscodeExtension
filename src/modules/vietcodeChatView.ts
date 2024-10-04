import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

export class ChatWebviewView implements vscode.WebviewViewProvider {
    private webviewView: vscode.WebviewView | undefined;

    constructor(private context: vscode.ExtensionContext) {}

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

        // Replace ${webview.cspSource} with the actual CSP source
        htmlContent = htmlContent.replace(
            /\$\{webview\.cspSource\}/g,
            this.webviewView?.webview.cspSource || ''
        );

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

    private handleUserInput(input: string) {
        // Process user input here
        // For now, let's just echo it back
        this.webviewView?.webview.postMessage({ type: 'addMessage', sender: 'Bot', value: `You said: ${input}` });
    }

    public addMessage(sender: string, message: string) {
        this.webviewView?.webview.postMessage({ type: 'addMessage', sender, value: message });
    }
}
