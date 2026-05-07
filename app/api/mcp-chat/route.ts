import { NextResponse } from 'next/server';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Polyfill EventSource for Node.js
import { EventSource } from "eventsource";
(global as any).EventSource = EventSource;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { query, target_user_id, jwt_token } = await req.json();

        if (!process.env.MCP_SERVER_URL) {
            return NextResponse.json({ error: "Missing MCP_SERVER_URL in environment" }, { status: 500 });
        }

        // 1. Connect to the Render MCP Server via SSE
        const transport = new SSEClientTransport(new URL(process.env.MCP_SERVER_URL));
        const mcpClient = new Client({ name: "NeuroBoost-NextJS", version: "1.0.0" }, { capabilities: {} });
        
        await mcpClient.connect(transport);

        // 2. Setup Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        
        // 3. System Prompt: Force AI to use the MCP tools for the specific user
        const systemInstruction = `You are a professional Medical/Clinical Data Assistant.
        The user you are answering is inquiring about patient ID: ${target_user_id}.
        You MUST use your provided tools to fetch the baseline, fatigue, and panic resistance for this patient to answer the query.
        Pass the patient ID and the jwt_token exactly as provided to your tools so the database allows access.
        The jwt_token to pass to your tools is: ${jwt_token}
        `;

        // 4. In a full production app, we would map the MCP tools to Gemini function declarations here.
        // For the sake of this phase, we will simulate the tool calling loop or just pass the tool schema.
        // FastMCP tools can be fetched dynamically from the server:
        const { tools } = await mcpClient.listTools();
        
        // Convert MCP tool schemas to Gemini function declarations
        const geminiTools = tools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: {
                type: "OBJECT",
                properties: {
                    user_id: { type: "STRING" },
                    jwt_token: { type: "STRING" },
                    limit: { type: "INTEGER" }
                },
                required: ["user_id"]
            }
        }));

        // Execute Gemini with tools
        const chat = model.startChat({
            tools: [{ functionDeclarations: geminiTools }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
        });

        const result = await chat.sendMessage(query);
        const response = result.response;
        
        // Check if Gemini wants to call a tool
        const functionCalls = response.functionCalls();
        
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            // 5. Execute the tool on the Python MCP Server
            const toolResult = await mcpClient.callTool({
                name: call.name,
                arguments: {
                    user_id: target_user_id,
                    jwt_token: jwt_token,
                    limit: call.args.limit || 5
                }
            });

            // 6. Send the tool result back to Gemini to get the final clinical answer
            const finalResult = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: { result: toolResult.content }
                }
            }]);
            
            return NextResponse.json({ answer: finalResult.response.text() });
        }

        return NextResponse.json({ answer: response.text() });

    } catch (error: any) {
        console.error("MCP Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
