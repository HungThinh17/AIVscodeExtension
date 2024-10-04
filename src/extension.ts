import * as vscode from 'vscode';

// VietCodeItem definition
class VietCodeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId: string,
        public readonly iconPath?: string
    ) {
        super(label, collapsibleState);

        this.command = {
            command: commandId,
            title: label,
        };
    }
}

// VietCodeViewProvider definition
class VietCodeViewProvider implements vscode.TreeDataProvider<VietCodeItem> {
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
