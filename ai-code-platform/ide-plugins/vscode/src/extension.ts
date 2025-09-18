import * as vscode from 'vscode';
import axios from 'axios';

interface ApiConfig {
    baseUrl: string;
    apiKey: string;
}

class AICodePlatformProvider {
    private config: ApiConfig;

    constructor() {
        this.config = this.getConfiguration();
    }

    private getConfiguration(): ApiConfig {
        const config = vscode.workspace.getConfiguration('aiCodePlatform');
        return {
            baseUrl: config.get('apiUrl', 'http://localhost:8000'),
            apiKey: config.get('apiKey', '')
        };
    }

    private async makeApiRequest(endpoint: string, data: any) {
        try {
            const response = await axios.post(`${this.config.baseUrl}${endpoint}`, data, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'API request failed');
        }
    }

    async generateCode(description: string, language: string, context?: string): Promise<any> {
        return this.makeApiRequest('/api/v1/generate-code', {
            description,
            language,
            context: context ? { additional_info: context } : undefined
        });
    }

    async generateTests(code: string, language: string): Promise<any> {
        return this.makeApiRequest('/api/v1/generate-tests', {
            code,
            language,
            test_type: 'unit',
            coverage_target: 0.8
        });
    }

    async reviewCode(code: string, language: string): Promise<any> {
        return this.makeApiRequest('/api/v1/review-code', {
            code,
            language,
            severity_threshold: 'medium'
        });
    }

    async generateDocumentation(code: string, language: string): Promise<any> {
        return this.makeApiRequest('/api/v1/generate-docs', {
            code,
            language,
            doc_type: 'api'
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new AICodePlatformProvider();

    // Generate Code Command
    const generateCodeCommand = vscode.commands.registerCommand('aiCodePlatform.generateCode', async () => {
        const description = await vscode.window.showInputBox({
            prompt: 'Describe the code you want to generate',
            placeHolder: 'e.g., Create a function to sort a list of dictionaries by a specific key'
        });

        if (!description) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const language = editor.document.languageId;
        
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating code...',
                cancellable: false
            }, async () => {
                const result = await provider.generateCode(description, language);
                
                const position = editor.selection.active;
                await editor.edit(editBuilder => {
                    editBuilder.insert(position, result.code);
                });

                vscode.window.showInformationMessage('Code generated successfully!');
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to generate code: ${error.message}`);
        }
    });

    // Generate Tests Command
    const generateTestsCommand = vscode.commands.registerCommand('aiCodePlatform.generateTests', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const code = document.getText();
        const language = document.languageId;

        if (!code.trim()) {
            vscode.window.showErrorMessage('No code found in the current file');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating tests...',
                cancellable: false
            }, async () => {
                const result = await provider.generateTests(code, language);
                
                // Create new test file
                const fileName = document.fileName;
                const testFileName = fileName.replace(/\.(py|js|ts|java|cpp|go|rs|cs|php)$/, '.test.$1');
                
                const testUri = vscode.Uri.file(testFileName);
                const testDocument = await vscode.workspace.openTextDocument(testUri);
                const testEditor = await vscode.window.showTextDocument(testDocument);
                
                await testEditor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), result.tests);
                });

                vscode.window.showInformationMessage(`Tests generated! Coverage: ${(result.estimated_coverage * 100).toFixed(1)}%`);
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to generate tests: ${error.message}`);
        }
    });

    // Review Code Command
    const reviewCodeCommand = vscode.commands.registerCommand('aiCodePlatform.reviewCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const code = document.getText();
        const language = document.languageId;

        if (!code.trim()) {
            vscode.window.showErrorMessage('No code found in the current file');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Reviewing code...',
                cancellable: false
            }, async () => {
                const result = await provider.reviewCode(code, language);
                
                // Clear existing diagnostics
                const diagnosticCollection = vscode.languages.createDiagnosticCollection('aiCodePlatform');
                diagnosticCollection.clear();

                // Create diagnostics for issues
                const diagnostics: vscode.Diagnostic[] = result.issues.map((issue: any) => {
                    const line = Math.max(0, issue.line_number - 1);
                    const range = new vscode.Range(line, 0, line, Number.MAX_VALUE);
                    
                    let severity = vscode.DiagnosticSeverity.Information;
                    if (issue.severity === 'high' || issue.severity === 'critical') {
                        severity = vscode.DiagnosticSeverity.Error;
                    } else if (issue.severity === 'medium') {
                        severity = vscode.DiagnosticSeverity.Warning;
                    }

                    return new vscode.Diagnostic(range, `${issue.title}: ${issue.description}`, severity);
                });

                diagnosticCollection.set(document.uri, diagnostics);

                // Show summary
                const issueCount = result.issues.length;
                const qualityScore = result.quality_score.toFixed(1);
                vscode.window.showInformationMessage(
                    `Code review complete! Quality Score: ${qualityScore}/10, Issues: ${issueCount}`
                );
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to review code: ${error.message}`);
        }
    });

    // Generate Documentation Command
    const generateDocsCommand = vscode.commands.registerCommand('aiCodePlatform.generateDocs', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const code = document.getText();
        const language = document.languageId;

        if (!code.trim()) {
            vscode.window.showErrorMessage('No code found in the current file');
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating documentation...',
                cancellable: false
            }, async () => {
                const result = await provider.generateDocumentation(code, language);
                
                // Create new documentation file
                const fileName = document.fileName;
                const docFileName = fileName.replace(/\.(py|js|ts|java|cpp|go|rs|cs|php)$/, '_docs.md');
                
                const docUri = vscode.Uri.file(docFileName);
                const docDocument = await vscode.workspace.openTextDocument(docUri);
                const docEditor = await vscode.window.showTextDocument(docDocument);
                
                await docEditor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), result.documentation);
                });

                vscode.window.showInformationMessage('Documentation generated successfully!');
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to generate documentation: ${error.message}`);
        }
    });

    // Open Dashboard Command
    const openDashboardCommand = vscode.commands.registerCommand('aiCodePlatform.openDashboard', () => {
        const config = vscode.workspace.getConfiguration('aiCodePlatform');
        const dashboardUrl = config.get('apiUrl', 'http://localhost:8000').replace('/api', '');
        vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
    });

    // Auto-review on save
    const autoReviewDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('aiCodePlatform');
        const autoReview = config.get('autoReview', false);
        
        if (autoReview && document.languageId in ['python', 'javascript', 'typescript', 'java']) {
            vscode.commands.executeCommand('aiCodePlatform.reviewCode');
        }
    });

    // Register all commands
    context.subscriptions.push(
        generateCodeCommand,
        generateTestsCommand,
        reviewCodeCommand,
        generateDocsCommand,
        openDashboardCommand,
        autoReviewDisposable
    );

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(robot) AI Code Platform";
    statusBarItem.command = 'aiCodePlatform.openDashboard';
    statusBarItem.tooltip = 'Open AI Code Platform Dashboard';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    vscode.window.showInformationMessage('AI Code Platform extension activated!');
}

export function deactivate() {
    // Cleanup if needed
}