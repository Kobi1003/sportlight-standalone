import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand
} from "@aws-sdk/client-bedrock-agent-runtime";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, sessionId } = req.body;

    const client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: sessionId || "web-user",
      inputText: message
    });

    const response = await client.send(command);

    let reply = "";
    for await (const chunk of response.completion) {
      if (chunk.chunk?.bytes) {
        reply += Buffer.from(chunk.chunk.bytes).toString();
      }
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bedrock error" });
  }
}
