import * as vscode from 'vscode';

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

