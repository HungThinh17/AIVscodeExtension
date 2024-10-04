import * as vscode from 'vscode';
import { ChatViewItem, VietCodeItem } from './vietcodeItem';
import { ChatWebviewView } from './vietcodeChatView';


export class VietCodeViewProvider implements vscode.TreeDataProvider<VietCodeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<VietCodeItem | undefined | void> = new vscode.EventEmitter<VietCodeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<VietCodeItem | undefined | void> = this._onDidChangeTreeData.event;
    private chatWebviewView: ChatWebviewView;

    constructor(private context: vscode.ExtensionContext) {
        this.chatWebviewView = new ChatWebviewView(context);
    }

    getTreeItem(element: VietCodeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: VietCodeItem): Thenable<VietCodeItem[]> {
        if (element) {
            if (element.label === 'Show Info') {
                return Promise.resolve([
                    new VietCodeItem('Project Details', vscode.TreeItemCollapsibleState.None, 'vietcode.showProjectDetails', 'info'),
                    new VietCodeItem('Recent Activities', vscode.TreeItemCollapsibleState.None, 'vietcode.showRecentActivities', 'history')
                ]);
            } else if (element.label === 'Input') {
                return Promise.resolve([
                    new VietCodeItem('Generate Code', vscode.TreeItemCollapsibleState.None, 'vietcode.generateCode', 'code'),
                    new ChatViewItem('Chat', vscode.TreeItemCollapsibleState.None, 'comment-discussion')
                ]);
            }
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new VietCodeItem('Show Info', vscode.TreeItemCollapsibleState.Expanded, '', 'info'),
            new VietCodeItem('Input', vscode.TreeItemCollapsibleState.Expanded, '', 'keyboard')
        ]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getChatWebviewView(): ChatWebviewView {
        return this.chatWebviewView;
    }
}