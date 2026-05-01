import * as vscode from 'vscode';

/** Defines the contract for an agent's configuration. */
export interface AgentConfig {
  /** Must match `id` in package.json chatParticipants */
  id: string;
  /** System-level instructions injected as the first LLM message */
  systemPrompt: string;
  /** Map of slash-command name → prompt prefix appended before user message */
  commands: Record<string, string>;
  /** Welcome message shown when user first @mentions the agent */
  welcomeMessage: string;
  /** Suggested follow-ups shown after each response */
  followups: vscode.ChatFollowup[];
  /** Path segments for the icon, relative to extensionUri */
  iconSegments: string[];
  /** Names of languageModelTools this agent is allowed to use */
  allowedTools?: string[];
}

/**
 * Factory: createSqlAgent
 *
 * Implements the April 2026 GitHub Copilot Chat Participant pattern:
 * - welcomeMessageProvider    → greets the user on first mention
 * - followupProvider          → suggests next steps after every response
 * - Tool-aware LLM messages   → passes available tool schemas to the LLM
 * - LanguageModelToolCallPart loop → handles multi-turn tool calling
 * - Model family selection    → prefers gpt-4o, falls back to first available
 */
export function createSqlAgent(
  config: AgentConfig,
  context: vscode.ExtensionContext
): vscode.ChatParticipant {

  // ── Handler ─────────────────────────────────────────────────────────────
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<vscode.ChatResult> => {

    // Help command — static markdown, no LLM call
    if (request.command === 'help') {
      stream.markdown(config.commands['help'] ?? '_No help text available._');
      return {};
    }

    // ── Select model ────────────────────────────────────────────────────
    // Use the model explicitly selected by the user in the Chat UI
    const model = request.model;


    if (!model) {
      stream.markdown(
        '⚠️ **No Copilot language model available.**\n\n' +
        'Please ensure GitHub Copilot Chat is installed and you are signed in.'
      );
      return {};
    }

    // ── Build prompt ────────────────────────────────────────────────────
    const commandPrefix = request.command
      ? (config.commands[request.command] ?? '')
      : '';
    const userMessage = commandPrefix
      ? `${commandPrefix}${request.prompt}`
      : request.prompt;

    // ── Build message history ───────────────────────────────────────────
    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(config.systemPrompt),
    ];

    for (const turn of chatContext.history) {
      if (turn instanceof vscode.ChatRequestTurn) {
        messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
      } else if (turn instanceof vscode.ChatResponseTurn) {
        const text = turn.response
          .map((p) =>
            p instanceof vscode.ChatResponseMarkdownPart ? p.value.value : ''
          )
          .join('');
        if (text) {
          messages.push(vscode.LanguageModelChatMessage.Assistant(text));
        }
      }
    }

    messages.push(vscode.LanguageModelChatMessage.User(userMessage));

    // ── Resolve allowed tools from the registry ─────────────────────────
    const allTools = vscode.lm.tools;
    const tools: vscode.LanguageModelChatTool[] = allTools
      .filter((t) =>
        !config.allowedTools || config.allowedTools.includes(t.name)
      )
      .map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema ?? {},
      }));

    // ── Agentic tool-calling loop (2026 pattern) ─────────────────────────
    // The LLM may request multiple tool calls in sequence; we loop until
    // it produces a final text response with no pending tool calls.
    const toolCallResults = new Map<string, string>();
    let iterationCount = 0;
    const MAX_ITERATIONS = 10; // safety cap

    while (iterationCount < MAX_ITERATIONS) {
      iterationCount++;

      try {
        const response = await model.sendRequest(
          messages,
          { tools: tools.length > 0 ? tools : undefined },
          token
        );

        let hasToolCall = false;
        const accumulatedText: string[] = [];
        const pendingToolCalls: vscode.LanguageModelToolCallPart[] = [];

        // Stream the response parts
        for await (const part of response.stream) {
          if (part instanceof vscode.LanguageModelTextPart) {
            accumulatedText.push(part.value);
            stream.markdown(part.value);
          } else if (part instanceof vscode.LanguageModelToolCallPart) {
            hasToolCall = true;
            pendingToolCalls.push(part);
          }
        }

        // If no tool calls, the LLM is done — exit the loop
        if (!hasToolCall) {
          break;
        }

        // Append LLM's assistant turn (including tool call requests)
        const assistantParts: (vscode.LanguageModelTextPart | vscode.LanguageModelToolCallPart)[] = [];
        if (accumulatedText.length > 0) {
          assistantParts.push(
            new vscode.LanguageModelTextPart(accumulatedText.join(''))
          );
        }
        assistantParts.push(...pendingToolCalls);
        messages.push(
          vscode.LanguageModelChatMessage.Assistant(assistantParts)
        );

        // Execute each tool call and collect results
        const toolResultParts: vscode.LanguageModelToolResultPart[] = [];
        for (const toolCall of pendingToolCalls) {
          stream.progress(`Running tool: ${toolCall.name}…`);

          try {
            const toolResult = await vscode.lm.invokeTool(
              toolCall.name,
              { input: toolCall.input, toolInvocationToken: request.toolInvocationToken },
              token
            );

            const resultText = toolResult.content
              .map((p) =>
                p instanceof vscode.LanguageModelTextPart ? p.value : ''
              )
              .join('');

            toolCallResults.set(toolCall.callId, resultText);
            toolResultParts.push(
              new vscode.LanguageModelToolResultPart(toolCall.callId, toolResult.content)
            );
          } catch (toolErr) {
            const errMsg =
              toolErr instanceof Error ? toolErr.message : String(toolErr);
            toolResultParts.push(
              new vscode.LanguageModelToolResultPart(toolCall.callId, [
                new vscode.LanguageModelTextPart(
                  `Tool error: ${errMsg}. Please proceed without this tool result or suggest an alternative approach.`
                ),
              ])
            );
          }
        }

        // Append tool results as a User turn (the 2026 tool-result pattern)
        messages.push(vscode.LanguageModelChatMessage.User(toolResultParts));

      } catch (err) {
        if (err instanceof vscode.LanguageModelError) {
          stream.markdown(`\n\n⚠️ **LLM Error** \`${err.code}\`: ${err.message}`);
        } else {
          throw err;
        }
        break;
      }
    }

    if (iterationCount >= MAX_ITERATIONS) {
      stream.markdown(
        '\n\n⚠️ _Agent reached the maximum iteration limit. The response may be incomplete._'
      );
    }

    return {};
  };

  // ── Register participant ────────────────────────────────────────────────
  const participant = vscode.chat.createChatParticipant(config.id, handler);

  // followupProvider — suggests next steps after each response (stable API)
  participant.followupProvider = {
    provideFollowups(
      _result: vscode.ChatResult,
      _context: vscode.ChatContext,
      _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.ChatFollowup[]> {
      return config.followups;
    },
  };

  // Set icon (falls back gracefully if file is missing)
  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    ...config.iconSegments
  );

  context.subscriptions.push(participant);
  return participant;
}
