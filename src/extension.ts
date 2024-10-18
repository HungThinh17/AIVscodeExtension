import * as vscode from 'vscode';
import { VietCodeViewProvider } from './modules/vietcodeViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Create an instance of VietCodeViewProvider
    const vietCodeViewProvider = new VietCodeViewProvider(context);

    const chatview = vscode.window.registerWebviewViewProvider('vietCodeChatView', vietCodeViewProvider.getChatWebviewView())
    const focusChat = vscode.commands.registerCommand('vietcode.focusChat', () => {
        vscode.commands.executeCommand('vietCodeChatView.focus');
    })

    context.subscriptions.push(chatview);
    context.subscriptions.push(focusChat);
}

export function deactivate() {}
