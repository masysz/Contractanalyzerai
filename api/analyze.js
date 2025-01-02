import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { contractAddress } = req.body;

    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    try {
      const response = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getCode',
        params: [contractAddress, 'latest'],
      });

      const contractCode = response.data.result;

      if (contractCode === '0x') {
        return res.json({ message: 'No contract found at this address.' });
      }

      return res.json({ contractAddress, contractCode });
    } catch (error) {
      console.error('Error fetching contract code:', error.message);
      return res.status(500).json({ error: 'Failed to fetch contract code.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
}
