import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testAnthropicAPI() {
  try {
    console.log('Testing Anthropic API connection...');
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Hello, can you respond with "API test successful"?' }]
    });
    
    console.log('API test successful:', response.content[0]);
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
}

testAnthropicAPI();