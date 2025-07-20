import { Router } from 'express';
import { mayaHandler } from './personas/maya_handler';
import { sarahHandler } from './personas/sarah_handler';
import { alexHandler } from './personas/alex_handler';
import { marcusHandler } from './personas/marcus_handler';
import { claudeConversationSystem } from './claude_conversation_system';

const router = Router();

// Dedicated route for Maya - Spiritual Guide & Breathwork Mentor
router.post('/chat/maya', async (req, res) => {
  try {
    const { message, userId = 'anonymous', conversationHistory = [] } = req.body;
    
    // Get Maya's memory and emotional context
    const memory = claudeConversationSystem.getConversationMemory(userId, 'maya');
    const emotionalContext = await claudeConversationSystem.detectEmotions(message);
    
    // Generate response using Maya's isolated handler
    const response = await mayaHandler.generateResponse(
      message, 
      conversationHistory, 
      emotionalContext,
      memory
    );
    
    // Update memory with Maya-specific rules
    await claudeConversationSystem.updateConversationMemory(memory, message, emotionalContext, mayaHandler.getConfig().memoryRules);
    
    res.json({
      response,
      emotion: emotionalContext.detectedEmotions?.[0] || 'peaceful',
      persona: mayaHandler.getConfig(),
      features: mayaHandler.getConfig().features
    });
    
  } catch (error) {
    console.error('Maya route error:', error);
    res.status(500).json({ error: 'Maya is temporarily unavailable. Let\'s take a deep breath and try again.' });
  }
});

// Dedicated route for Dr. Sarah - Clinical Therapist
router.post('/chat/sarah', async (req, res) => {
  try {
    const { message, userId = 'anonymous', conversationHistory = [] } = req.body;
    
    // Get Sarah's memory and emotional context
    const memory = claudeConversationSystem.getConversationMemory(userId, 'sarah');
    const emotionalContext = await claudeConversationSystem.detectEmotions(message);
    
    // Generate response using Sarah's isolated handler
    const response = await sarahHandler.generateResponse(
      message, 
      conversationHistory, 
      emotionalContext,
      memory
    );
    
    // Update memory with Sarah-specific rules
    await claudeConversationSystem.updateConversationMemory(memory, message, emotionalContext, sarahHandler.getConfig().memoryRules);
    
    res.json({
      response,
      emotion: emotionalContext.detectedEmotions?.[0] || 'supported',
      persona: sarahHandler.getConfig(),
      features: sarahHandler.getConfig().features
    });
    
  } catch (error) {
    console.error('Sarah route error:', error);
    res.status(500).json({ error: 'Dr. Sarah is currently unavailable. Your feelings are valid, and I\'m here when you\'re ready.' });
  }
});

// Dedicated route for Alex - Peer Support Specialist
router.post('/chat/alex', async (req, res) => {
  try {
    const { message, userId = 'anonymous', conversationHistory = [] } = req.body;
    
    // Get Alex's memory and emotional context
    const memory = claudeConversationSystem.getConversationMemory(userId, 'alex');
    const emotionalContext = await claudeConversationSystem.detectEmotions(message);
    
    // Generate response using Alex's isolated handler
    const response = await alexHandler.generateResponse(
      message, 
      conversationHistory, 
      emotionalContext,
      memory
    );
    
    // Update memory with Alex-specific rules
    await claudeConversationSystem.updateConversationMemory(memory, message, emotionalContext, alexHandler.getConfig().memoryRules);
    
    res.json({
      response,
      emotion: emotionalContext.detectedEmotions?.[0] || 'understood',
      persona: alexHandler.getConfig(),
      features: alexHandler.getConfig().features
    });
    
  } catch (error) {
    console.error('Alex route error:', error);
    res.status(500).json({ error: 'Alex is taking a quick break! I\'ll be back soon with all the good vibes! 💜' });
  }
});

// Dedicated route for Marcus - Life Coach & Wellness Expert
router.post('/chat/marcus', async (req, res) => {
  try {
    const { message, userId = 'anonymous', conversationHistory = [] } = req.body;
    
    // Get Marcus's memory and emotional context
    const memory = claudeConversationSystem.getConversationMemory(userId, 'marcus');
    const emotionalContext = await claudeConversationSystem.detectEmotions(message);
    
    // Generate response using Marcus's isolated handler
    const response = await marcusHandler.generateResponse(
      message, 
      conversationHistory, 
      emotionalContext,
      memory
    );
    
    // Update memory with Marcus-specific rules
    await claudeConversationSystem.updateConversationMemory(memory, message, emotionalContext, marcusHandler.getConfig().memoryRules);
    
    res.json({
      response,
      emotion: emotionalContext.detectedEmotions?.[0] || 'motivated',
      persona: marcusHandler.getConfig(),
      features: marcusHandler.getConfig().features
    });
    
  } catch (error) {
    console.error('Marcus route error:', error);
    res.status(500).json({ error: 'Marcus is currently unavailable. Your potential is still there - let\'s reconnect soon!' });
  }
});

// Get all persona configurations
router.get('/personas/configs', (req, res) => {
  res.json({
    maya: mayaHandler.getConfig(),
    sarah: sarahHandler.getConfig(),
    alex: alexHandler.getConfig(),
    marcus: marcusHandler.getConfig()
  });
});

// Get specific persona information
router.get('/personas/:personaId/info', (req, res) => {
  const { personaId } = req.params;
  
  const handlers = {
    maya: mayaHandler,
    sarah: sarahHandler,
    alex: alexHandler,
    marcus: marcusHandler
  };
  
  const handler = handlers[personaId as keyof typeof handlers];
  
  if (!handler) {
    return res.status(404).json({ error: 'Persona not found' });
  }
  
  res.json({
    config: handler.getConfig(),
    status: 'active'
  });
});

export default router;