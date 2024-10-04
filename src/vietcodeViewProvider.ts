import * as vscode from 'vscode';
import { VietCodeItem } from './vietcodeItem';

// VietCodeViewProvider definition
export class VietCodeViewProvider implements vscode.TreeDataProvider<VietCodeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<VietCodeItem | undefined | void> = new vscode.EventEmitter<VietCodeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<VietCodeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    getTreeItem(element: VietCodeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: VietCodeItem): Thenable<VietCodeItem[]> {
        if (element) {
            return Promise.resolve([]); // No child items for now
        }
        // Create items for the top-level view
        return Promise.resolve([
            new VietCodeItem('Generate Code', vscode.TreeItemCollapsibleState.None, 'vietcode.generateCode', 'code'),
            new VietCodeItem('Hello World', vscode.TreeItemCollapsibleState.None, 'vietcode.helloWorld', 'symbol-event')
        ]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}