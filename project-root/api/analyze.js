import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const { contractAddress } = req.body;

  if (!contractAddress) {
    res.status(400).json({ error: "Contract address is required" });
    return;
  }

  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  try {
    // Fetch contract details using Alchemy
    const alchemyUrl = `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`;
    const response = await axios.post(alchemyUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getCode",
      params: [contractAddress, "latest"],
    });

    const contractCode = response.data.result;

    if (!contractCode || contractCode === "0x") {
      res.status(404).json({ error: "Invalid or non-existent contract address" });
      return;
    }

    // Analyze contract code with OpenAI
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `
      Analyze the following Ethereum smart contract code: ${contractCode}.
      Provide a summary of its functionality, potential risks, and investment opportunities.
    `;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 300,
    });

    res.status(200).json({
      analysis: completion.data.choices[0].text.trim(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
