import * as vscode from 'vscode';
import { VietCodeViewProvider } from './vietcodeViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Create an instance of VietCodeViewProvider
    const vietCodeViewProvider = new VietCodeViewProvider(context);

    // Register the tree view provider
    const treeView = vscode.window.createTreeView('vietcodeSidebar', {
        treeDataProvider: vietCodeViewProvider
    });

    // Register commands
    const helloWorldCommand = vscode.commands.registerCommand('vietcode.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from VietCode!');
    });

    const generateCodeCommand = vscode.commands.registerCommand('vietcode.generateCode', () => {
        vscode.window.showInformationMessage('Generate Code command triggered!');
        // Your logic for generating code goes here
    });

    // Manage subscriptions
    context.subscriptions.push(treeView);
    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(generateCodeCommand);
}

export function deactivate() {}
