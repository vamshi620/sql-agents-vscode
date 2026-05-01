import * as vscode from 'vscode';
import { IGetWorkspaceSqlFilesInput } from './toolInputs';

/**
 * Tool: sql_agents_get_workspace_sql_files
 *
 * Finds all SQL-related files in the workspace.
 * Useful when the agent needs project-level context.
 */
export class GetWorkspaceSqlFilesTool
  implements vscode.LanguageModelTool<IGetWorkspaceSqlFilesInput>
{
  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IGetWorkspaceSqlFilesInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    const pattern = options.input.includePattern ?? '**/*.{sql,ddl,tsql,psql}';
    return {
      invocationMessage: `Scanning workspace for SQL files (pattern: ${pattern})`,
      confirmationMessages: {
        title: 'Scan Workspace for SQL Files',
        message: new vscode.MarkdownString(
          `Allow the SQL agent to scan the workspace for SQL files?\n\n` +
          `**Pattern:** \`${pattern}\``
        ),
      },
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IGetWorkspaceSqlFilesInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const pattern = options.input.includePattern ?? '**/*.{sql,ddl,tsql,psql}';
    const exclude = '**/node_modules/**';

    const uris = await vscode.workspace.findFiles(pattern, exclude, 200, token);

    if (uris.length === 0) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          'No SQL files found in the workspace matching the specified pattern. ' +
          'The user may not have SQL files in this project, or the pattern may need adjustment.'
        ),
      ]);
    }

    const files = uris.map((uri) => {
      const rel = vscode.workspace.asRelativePath(uri);
      return `- ${rel}`;
    });

    const output = [
      `Found ${files.length} SQL file(s) in the workspace:`,
      '',
      ...files,
    ].join('\n');

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(output),
    ]);
  }
}
