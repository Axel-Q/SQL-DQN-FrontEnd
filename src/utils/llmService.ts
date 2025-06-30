interface QueryHistoryItem {
  theme: string;
  concept: string;
  narrative: string;
  timestamp: number;
  // coefficient: number;
}

// Create a function to manage the query history
function getQueryHistory(): QueryHistoryItem[] {
  try {
    const saved = localStorage.getItem('query_history');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load query history:', error);
    return [];
  }
}

function saveQueryHistory(history: QueryHistoryItem[]): void {
  try {
    // Only save history if setup is complete
    if (localStorage.getItem('setup_complete') === 'true') {
      // Keep only the most recent 5 items to avoid large prompts
      const trimmedHistory = history.slice(-5);
      localStorage.setItem('query_history', JSON.stringify(trimmedHistory));
    }
  } catch (error) {
    console.error('Failed to save query history:', error);
  }
}

// Function to mark setup as complete
export function markSetupComplete(): void {
  localStorage.setItem('setup_complete', 'true');
}

// Function to clear history
export function clearQueryHistory(): void {
  localStorage.removeItem('query_history');
}

// Add event listener to clear history when page is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearQueryHistory();
  });
}

export async function getGeneratedQuery(
  theme: string,
  concept: string,
  coefficient: number,
  input: Record<string, Record<string, any>>,
  expected: Array<Record<string, any>>
): Promise<string> {
  // Quick fix to avoid null or undefined input causing TypeError
  const safeInput = input || {};

  // Get query history
  const queryHistory = getQueryHistory();
  
  // Create history context string if we have previous queries - only using narratives
  const historyContext = queryHistory.length > 0 
    ? queryHistory.map((item, index) => 
        `[${index + 1}] ${item.narrative}`
      ).join('\n\n')
    : "No previous queries found. Ignore this line.";

  // console.log('History Context:', historyContext);
  // Create a list of tables with columns in a friendly format
  const tableContents = Object.entries(safeInput)
    .map(([tableName, tableRows]) => {
      // For each row, build a multiline object-like string
      const rowStrings = tableRows
        ?.map((row: Record<string, any>) => {
          const fields = Object.entries(row)
            .map(([key, value]) => {
              // Wrap string values in quotes, otherwise leave as-is
              const formattedValue = typeof value === 'string' ? `"${value}"` : value;
              return `    ${key}: ${formattedValue},`;
            })
            .join('\n');
          return `{\n${fields}\n},\n`;
        })
        .join('') || '';

      return `Table "${tableName}":\n${rowStrings}\n`;
    })
    .join('\n');
  console.log('Table contents:', tableContents);

  // Convert the expected result to a string, whether array or single string
  const expectedResult = Array.isArray(expected)
    ? expected.map((item) => JSON.stringify(item)).join(',\n')
    : expected;
  console.log('Expected result:', expectedResult);

  // Build the LLM prompt content
  const content =
    'You are a creative storyteller with knowledge of SQL database queries. ' +
    'Generate an **engaging narrative within 50 words** based on a given theme that continues the ongoing storyline. ' +
    'Your story must include:\n\n' +
    `1. A continuation of the previous narrative: ${historyContext}\n` +
    `2. A challenge or mission that can only be solved by running a ${concept} SQL query ` +
    'against the following contents:\n' +
    `${tableContents}\n\n` +
    "3. A direct prompt asking the user (the 'player') to provide the SQL query that " +
    'returns the specified expected result.\n\n' +
    '[Details to incorporate into the story]\n' +
    `- Theme: ${theme}\n` +
    `- Expected Result:\n[${expectedResult}]\n\n` +
    '[Format of your response]\n' +
    "1. Provide a narrative or storyline set within 50 words in bullets in the specified theme that continues from the previous storyline.\n" +
    "2. Do NOT provide the SQL query yourself; only ask the player to supply it.\n\n" +
    `3. Ask different question according to the difficulty coefficient ${coefficient}, while 0.1 is the easiest and 1.0 is the most difficult.\n\n` +
    '[Example Guidance]\n' +
    "- If the theme is 'Cyberpunk,' your story might refer to futuristic cities, neon lights, or secret hacking missions.\n" +
    " - Conclude with a direct question like:\n" +
    "'Neo has discovered three individuals who show signs of rebellion. He needs a query that will list these rebels. " +
    "What SQL command can you use to retrieve only those entries from the table(s)?'\n";

  // Post to your LLM endpoint
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [{ role: 'user', content }],
    }),
  });

  const data = await response.json();
  const generatedQuery = data.choices[0].message.content;
  
  // console.log('Generated query:', generatedQuery);
  // Store this query in history
  queryHistory.push({
    theme,
    concept,
    narrative: generatedQuery,
    timestamp: Date.now()
  });
  saveQueryHistory(queryHistory);

  return generatedQuery;
}

interface ErrorMessageParams {
  userQuery: string;
  errorMessage: string;
  concept: string;
  theme: string;
}

export async function generateErrorMessage({
  userQuery,
  errorMessage,
  concept,
  theme
}: ErrorMessageParams): Promise<string> {
  const content = 
    'You are an SQL tutor helping a student. ' +
    'Provide a helpful, informative explanation of what went wrong with their SQL query. ' +
    'Or if the error message is none, just give a hint of how to solve the problem.'+
    'Be encouraging and educational. ' +
    'Include a hint about how to fix the issue without giving the full answer. ' +
    'Keep your response under 100 words. ' +
    'Format your response in conversational language. ' +
    '\n\n' +
    `Theme: ${theme}\n` +
    `SQL Concept being practiced: ${concept}\n` +
    `User's SQL Query: \`${userQuery}\`\n` +
    `Error message: ${errorMessage}\n`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating helpful error message:', error);
    return errorMessage; // Return the original error message as fallback
  }
}