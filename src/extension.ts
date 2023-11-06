import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('nebulacoder.generateCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = editor.selection.active;
            const line = editor.document.lineAt(position.line).text;

            const commentLine = getMostRecentCommentLineAboveCursor(editor, position);

            if (commentLine) {
                const commentTextWithHash = commentLine.trim();
                const commentText = commentTextWithHash.substring(1);

                const entireDocumentContent = editor.document.getText();

                vscode.window.showInformationMessage(`Processing: ${commentText}`);

                const pythonProcess = spawn('python', ['python_script.py', commentText, entireDocumentContent], {
                    cwd: __dirname,
                });

                let pythonOutput = '';
                let errorMessage = '';

                pythonProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    pythonOutput += output;
                });

                pythonProcess.stderr.on('data', (data) => {
                    const errorOutput = data.toString();
                    if (!errorOutput.includes('ERROR')) {
                        errorMessage += errorOutput;
                    }
                    logToOutput(`Update: ${errorOutput}`);
                });

                pythonProcess.on('close', (code) => {

                    insertOutputUnderComments(editor, pythonOutput, position);

                    if (errorMessage) {
                        showResult(`Python Script Result:\n${pythonOutput}\nIgnored Errors:\n${errorMessage}`);
                    } else {
                        showResult(`Python Script Result:\n${pythonOutput}`);
                    }
                });
            } else {
                vscode.window.showInformationMessage('No Python comments found above the cursor.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

function logToOutput(message: string) {
    vscode.window.showInformationMessage(message);
}

function insertOutputUnderComments(editor: vscode.TextEditor, output: string, position: vscode.Position) {
    editor.edit((editBuilder) => {
        editBuilder.insert(position, '\n' + output);
    });
}

function showResult(result: string) {
    vscode.window.showInformationMessage(result);
}

function getMostRecentCommentLineAboveCursor(editor: vscode.TextEditor, position: vscode.Position): string | undefined {
    for (let line = position.line - 1; line >= 0; line--) {
        const text = editor.document.lineAt(line).text;
        if (text.trim().startsWith('#')) {
            return text;
        }
    }
    return undefined;
}
