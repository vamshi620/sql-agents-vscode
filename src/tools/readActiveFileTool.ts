import * as vscode from 'vscode';
import { IReadActiveFileInput } from './toolInputs';

/**
 * Tool: sql_agents_read_active_file
 *
 * Reads the content of the currently active editor document.
 * This enables agents to analyse open SQL files without the user pasting code.
 *
 * 2026 Pattern: implements LanguageModelTool<T> with prepareInvocation + invoke.
 */
export class ReadActiveFileTool
  implements vscode.LanguageModelTool<IReadActiveFileInput>
{
  /**
   * prepareInvocation — shown to the user BEFORE the tool runs.
   * Returns a confirmation title/message so the user knows what's happening.
   */
  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IReadActiveFileInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    const editor = vscode.window.activeTextEditor;
    const fileName = editor
      ? vscode.workspace.asRelativePath(editor.document.uri)
      : 'the active file';

    return {
      invocationMessage: `Reading SQL file: ${fileName}`,
      confirmationMessages: {
        title: 'Read Active SQL File',
        message: new vscode.MarkdownString(
          `Allow the SQL agent to read **${fileName}** to analyse its content?`
        ),
      },
    };
  }

  /**
   * invoke — the actual tool logic.
   * Returns a LanguageModelToolResult containing the file content as text.
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IReadActiveFileInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      throw new Error(
        'No active editor found. The user must have a SQL file open in VS Code. ' +
        'Ask the user to open the file they want to analyse.'
      );
    }

    const doc = editor.document;
    const { startLine, endLine } = options.input;
    const lineCount = doc.lineCount;

    const start = startLine !== undefined ? Math.max(0, startLine) : 0;
    const end =
      endLine !== undefined ? Math.min(endLine, lineCount - 1) : lineCount - 1;

    let content: string;
    if (start === 0 && end === lineCount - 1) {
      content = doc.getText();
    } else {
      const range = new vscode.Range(start, 0, end, doc.lineAt(end).text.length);
      content = doc.getText(range);
    }

    const relativePath = vscode.workspace.asRelativePath(doc.uri);
    const result = [
      `File: ${relativePath}`,
      `Language: ${doc.languageId}`,
      `Lines: ${lineCount}`,
      ``,
      '```sql',
      content,
      '```',
    ].join('\n');

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(result),
    ]);
  }
}
