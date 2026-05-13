import { NextResponse } from 'next/server';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import Groq from "groq-sdk";

// Polyfill EventSource for Node.js
import { EventSource } from "eventsource";
(global as any).EventSource = EventSource;

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
    try {
        const { query, target_user_id, jwt_token } = await req.json();

        if (!process.env.MCP_SERVER_URL) {
            return NextResponse.json({ error: "Missing MCP_SERVER_URL in environment" }, { status: 500 });
        }
        
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: "Missing GROQ_API_KEY in environment" }, { status: 500 });
        }

        // 1. Connect to the Render MCP Server via SSE
        const transport = new SSEClientTransport(new URL(process.env.MCP_SERVER_URL));
        const mcpClient = new Client({ name: "NeuroBoost-NextJS", version: "1.0.0" }, { capabilities: {} });
        
        await mcpClient.connect(transport);

        // 2. System Prompt
        const systemInstruction = `You are a professional Medical/Clinical Data Assistant.
The user is inquiring about patient ID: ${target_user_id}.
When asked about patient metrics, use the provided functions to fetch the data.
Use this jwt_token for authorization in your function calls: ${jwt_token}`;

        // 3. Fetch MCP tools
        const { tools } = await mcpClient.listTools();
        
        // Convert MCP tool schemas to Groq/OpenAI function declarations
        const groqTools = tools.map(t => ({
            type: "function" as const,
            function: {
                name: t.name,
                description: t.description || "",
                parameters: {
                    type: "object",
                    properties: {
                        user_id: { type: "string", description: "The target patient UUID" },
                        jwt_token: { type: "string", description: "The JWT authorization token" },
                        limit: { type: "integer", description: "Optional record limit" }
                    },
                    required: ["user_id", "jwt_token"]
                }
            }
        }));

        const messages: any[] = [
            { role: "system", content: systemInstruction },
            { role: "user", content: query }
        ];

        // 4. First completion pass with tools
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: groqTools,
            tool_choice: "auto",
        });

        let responseMessage = completion.choices[0].message;
        
        // --- Fallback for Groq Llama-3.3 tool call bug ---
        // Sometimes Llama outputs <|python_tag|>{...} instead of triggering the actual tool_calls array.
        if ((!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) && responseMessage.content && responseMessage.content.includes('<|python_tag|>')) {
            try {
                const jsonStr = responseMessage.content.split('<|python_tag|>')[1].trim();
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === "function" && parsed.name) {
                    responseMessage.tool_calls = [{
                        id: "call_" + Math.random().toString(36).substring(7),
                        type: "function",
                        function: {
                            name: parsed.name,
                            arguments: JSON.stringify(parsed.parameters)
                        }
                    }];
                    responseMessage.content = null; // Clean up the raw text
                }
            } catch (e) {
                console.error("Failed to parse fallback python_tag", e);
            }
        }

        // Check if Groq wants to call a tool
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            // Append the assistant's tool call request to the history
            messages.push(responseMessage);
            
            const toolCall = responseMessage.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);
            
            // 5. Execute the tool on the Python MCP Server
            const toolResult = await mcpClient.callTool({
                name: toolCall.function.name,
                arguments: {
                    user_id: target_user_id,
                    jwt_token: jwt_token,
                    limit: args.limit || 5
                }
            });

            // 6. Send the tool result back to Groq
            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: JSON.stringify(toolResult.content),
            });

            const finalCompletion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages,
            });
            
            return NextResponse.json({ answer: finalCompletion.choices[0].message.content });
        }

        return NextResponse.json({ answer: responseMessage.content });

    } catch (error: any) {
        console.error("MCP Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
