import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Register the hello world command
    const helloWorldCommand = vscode.commands.registerCommand('vietcode.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from VietCode!');
    });

    // Register the generate code command
    const generateCodeCommand = vscode.commands.registerCommand('vietcode.generateCode', () => {
        vscode.window.showInformationMessage('Code generation logic would go here!');
    });

    // Register the tree view provider
    context.subscriptions.push(vscode.window.registerTreeDataProvider('vietcodeSidebar', new VietCodeViewProvider(context)));
    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(generateCodeCommand);
}

export function deactivate() {}

class VietCodeViewProvider implements vscode.TreeDataProvider<VietCodeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<VietCodeItem | undefined | void> = new vscode.EventEmitter<VietCodeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<VietCodeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    getTreeItem(element: VietCodeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: VietCodeItem): Thenable<VietCodeItem[]> {
        if (element) {
            return Promise.resolve([]); // No child items
        }
        // Create items for the top-level view, passing the context
        return Promise.resolve([
            new VietCodeItem('Generate Code', vscode.TreeItemCollapsibleState.None, 'vietcode.generateCode', this.context), // Pass the context
        ]);
    }
}

class VietCodeItem extends vscode.TreeItem {
    iconPath: { light: string; dark: string }; // Declare iconPath without initializing it

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId: string,
        private readonly context: vscode.ExtensionContext // Add context as a private member
    ) {
        super(label, collapsibleState);

        // Set the command property correctly
        this.command = {
            command: commandId,
            title: label,
        };

        // Initialize the iconPath here
        this.iconPath = {
            light: this.context.asAbsolutePath('resources/vietcode.svg'), // Specify the path to your icon
            dark: this.context.asAbsolutePath('resources/vietcode.svg')   // Specify the path to your icon
        };
    }
}
