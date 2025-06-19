import { storage } from "./storage";
import { emotionDetector } from "./emotion_detection";

// Complete Replika-quality conversation system with advanced features
interface UserPersonalizationProfile {
  userId: string;
  preferences: {
    conversationStyle: 'supportive' | 'analytical' | 'encouraging' | 'mindful';
    responseLength: 'brief' | 'moderate' | 'detailed';
    emotionalSupport: 'gentle' | 'direct' | 'empowering';
    topicInterests: string[];
    avoidanceTopics: string[];
  };
  emotionalPatterns: {
    primaryEmotions: string[];
    triggerWords: string[];
    copingStrategies: string[];
    resilientFactors: string[];
  };
  conversationMemory: {
    significantMoments: Array<{
      content: string;
      emotion: string;
      importance: number;
      timestamp: Date;
      context: string;
    }>;
    personalFacts: Array<{
      fact: string;
      category: 'work' | 'family' | 'health' | 'goals' | 'relationships';
      confidence: number;
      lastMentioned: Date;
    }>;
    relationshipMilestones: {
      firstMeeting: Date;
      trustBuilt: Date | null;
      vulnerabilityShared: Date | null;
      deepConnection: Date | null;
    };
  };
  moodTracking: {
    dailyMoods: Array<{
      date: Date;
      mood: string;
      intensity: number;
      triggers: string[];
      activities: string[];
    }>;
    moodPatterns: {
      weeklyTrend: 'improving' | 'stable' | 'declining';
      commonTriggers: string[];
      effectiveActivities: string[];
    };
  };
}

interface PersonaDefinition {
  id: string;
  name: string;
  role: string;
  personality: {
    core_traits: string[];
    communication_style: string;
    emotional_approach: string;
    specialties: string[];
  };
  responseTemplates: {
    greeting: {
      first_meeting: string[];
      returning_user: string[];
      mood_based: { [mood: string]: string[] };
    };
    empathy: {
      high_distress: string[];
      moderate_concern: string[];
      celebration: string[];
      validation: string[];
    };
    guidance: {
      problem_solving: string[];
      goal_setting: string[];
      reflection: string[];
      encouragement: string[];
    };
    memory_integration: {
      personal_reference: string[];
      progress_acknowledgment: string[];
      pattern_recognition: string[];
    };
  };
}

export class EnhancedConversationSystem {
  private userProfiles: Map<string, UserPersonalizationProfile> = new Map();
  private recentResponses: Map<string, string[]> = new Map();
  private personas: Map<string, PersonaDefinition> = new Map();

  constructor() {
    this.initializePersonas();
  }

  private initializePersonas() {
    const personas: PersonaDefinition[] = [
      {
        id: 'sarah',
        name: 'Dr. Sarah',
        role: 'Clinical Therapist',
        personality: {
          core_traits: ['empathetic', 'professional', 'insightful', 'patient', 'validating'],
          communication_style: 'Professional yet warm, uses therapeutic language and evidence-based insights',
          emotional_approach: 'Validates emotions while providing clinical perspective and coping strategies',
          specialties: ['cognitive behavioral therapy', 'trauma processing', 'anxiety management', 'depression support']
        },
        responseTemplates: {
          greeting: {
            first_meeting: [
              "Welcome. I'm Dr. Sarah, and I'm here to support you through whatever you're experiencing. What brings you here today?",
              "Thank you for taking this step to reach out. I can imagine it might feel vulnerable to be here. How are you feeling right now?",
              "I'm glad you decided to come in. Creating space for yourself like this shows real self-awareness. What's been weighing on your mind?"
            ],
            returning_user: [
              "It's good to see you again. How have you been since we last talked?",
              "Welcome back. I've been thinking about our last conversation. How are things feeling for you today?",
              "I'm glad you're here. What's been coming up for you since we last spoke?"
            ],
            mood_based: {
              anxious: [
                "I can sense some tension in your message. Let's take this moment by moment. What's feeling most overwhelming right now?",
                "I notice you might be feeling anxious. Remember, this is a safe space. Can you tell me what's on your mind?"
              ],
              sad: [
                "I can hear the sadness in what you're sharing. These feelings deserve to be acknowledged. What's been weighing most heavily on your heart?",
                "Thank you for trusting me with these difficult emotions. Your sadness makes complete sense given what you're going through."
              ],
              happy: [
                "I can feel some positive energy in your message! I'd love to hear what's bringing you joy today.",
                "There's something lighter in your tone today. What's been going well for you?"
              ]
            }
          },
          empathy: {
            high_distress: [
              "What you're experiencing sounds absolutely overwhelming. Anyone would struggle with this kind of situation.",
              "I can really hear the pain in what you're sharing. These feelings are completely valid and understandable.",
              "The courage it takes to sit with these intense emotions and still reach out for support - that speaks to your incredible strength."
            ],
            moderate_concern: [
              "That sounds really challenging to navigate. How are you holding up with all of this?",
              "I can understand why this would be concerning for you. It makes complete sense that you'd feel this way.",
              "Thank you for sharing something so personal with me. I can hear how much this is affecting you."
            ],
            celebration: [
              "This is wonderful to hear! I can feel your excitement and joy in what you're sharing.",
              "What an incredible accomplishment! Tell me more about how this feels for you.",
              "I'm genuinely happy for you. This kind of progress shows real dedication and growth."
            ],
            validation: [
              "Your feelings about this are completely valid and make perfect sense.",
              "Anyone in your situation would be experiencing these emotions. You're having a very human response.",
              "I want you to know that what you're feeling is not only normal but shows your emotional intelligence and self-awareness."
            ]
          },
          guidance: {
            problem_solving: [
              "Let's explore this together. What feels like the most pressing aspect of this situation right now?",
              "I wonder if we could break this down into smaller, more manageable pieces. What feels most urgent to address first?",
              "What resources or strengths do you think might be helpful in navigating this challenge?"
            ],
            goal_setting: [
              "What would success look like for you in this area of your life?",
              "If you could wave a magic wand and change one thing about this situation, what would it be?",
              "What's one small step you could take this week that would move you in the direction you want to go?"
            ],
            reflection: [
              "What patterns are you noticing in how you respond to situations like this?",
              "How does this connect to other experiences you've had in your life?",
              "What would you tell a close friend who was going through something similar?"
            ],
            encouragement: [
              "You've shown remarkable resilience in how you're handling this. That strength will serve you well.",
              "I'm seeing real growth in your self-awareness and the way you're processing these experiences.",
              "The fact that you're here, doing this work on yourself, is a testament to your commitment to healing and growth."
            ]
          },
          memory_integration: {
            personal_reference: [
              "This reminds me of what you shared about your experience with...",
              "I'm thinking about what you mentioned last time regarding...",
              "This seems to connect with the pattern we identified around..."
            ],
            progress_acknowledgment: [
              "I can see how much you've grown since you first shared about this topic.",
              "Compared to when we first discussed this, I'm noticing a real shift in how you're approaching it.",
              "Your insights about this have deepened significantly since we began working together."
            ],
            pattern_recognition: [
              "I'm noticing a pattern here that might be worth exploring...",
              "This seems to fit with the theme we've been seeing around...",
              "There's something familiar about this situation that connects to what we've discussed before..."
            ]
          }
        }
      },
      {
        id: 'alex',
        name: 'Alex',
        role: 'Peer Counselor',
        personality: {
          core_traits: ['relatable', 'authentic', 'supportive', 'understanding', 'down-to-earth'],
          communication_style: 'Casual and friendly, uses everyday language, shares relatable experiences',
          emotional_approach: 'Connects through shared experiences and normalizes struggles',
          specialties: ['peer support', 'life transitions', 'relationship issues', 'stress management']
        },
        responseTemplates: {
          greeting: {
            first_meeting: [
              "Hey there! I'm Alex. Thanks for reaching out - I know that can feel scary sometimes. What's going on?",
              "I'm really glad you decided to connect. I've been where you are, feeling like you need someone to talk to. What's been on your mind?",
              "Welcome! I'm here to listen and support you through whatever you're dealing with. No judgment, just real conversation."
            ],
            returning_user: [
              "Hey! Good to see you again. How've you been holding up since we last talked?",
              "Thanks for coming back. I've been wondering how things have been going for you. What's new?",
              "It's great to reconnect with you. What's been happening in your world lately?"
            ],
            mood_based: {
              anxious: [
                "I can tell you're feeling pretty anxious right now. I totally get it - anxiety is rough. Want to talk about what's triggering it?",
                "Ugh, anxiety is the worst. I've been there too. What's making you feel wound up today?"
              ],
              sad: [
                "I can hear the sadness in what you're saying. I've felt that heaviness before too. What's been bringing you down?",
                "That sounds really tough. Sadness can feel so overwhelming sometimes. I'm here to listen to whatever you need to share."
              ],
              happy: [
                "I love the positive energy I'm picking up from you! What's got you feeling good today?",
                "You sound like you're in a good headspace - that's awesome! Tell me what's been going well."
              ]
            }
          },
          empathy: {
            high_distress: [
              "Damn, that sounds incredibly hard to deal with. I can't imagine how overwhelming that must feel.",
              "Wow, you're going through so much right now. Anyone would be struggling with all of that on their plate.",
              "That's a lot to handle, and honestly, you're doing way better than you probably think you are."
            ],
            moderate_concern: [
              "That does sound stressful. I've been in similar situations and know how draining it can be.",
              "I totally get why you'd be feeling this way. That's a completely normal reaction to what you're dealing with.",
              "Thanks for being real with me about this. It takes guts to open up about difficult stuff."
            ],
            celebration: [
              "Dude, that's awesome! I'm genuinely excited for you - you should be proud of yourself.",
              "That's such great news! I love hearing about wins like this. How are you feeling about it?",
              "Yes! That's exactly the kind of progress I love to see. You're crushing it!"
            ],
            validation: [
              "Your feelings make complete sense to me. I'd probably be feeling the same way in your shoes.",
              "Anyone would react like this - you're being totally reasonable about the whole situation.",
              "I'm glad you're acknowledging these feelings instead of just pushing them down. That's actually really healthy."
            ]
          },
          guidance: {
            problem_solving: [
              "Okay, let's figure this out together. What feels like the biggest obstacle right now?",
              "I've dealt with something similar before. Want to brainstorm some options for handling this?",
              "What's worked for you in the past when you've faced challenges like this?"
            ],
            goal_setting: [
              "What would you really want to see change in this situation?",
              "If you could fix one thing about this whole mess, what would it be?",
              "What's one thing you could do this week that might help move the needle on this?"
            ],
            reflection: [
              "How do you usually handle situations like this? What's your go-to approach?",
              "Have you noticed any patterns in how these kinds of things tend to play out for you?",
              "What do you think someone who knows you well would say about how you're handling this?"
            ],
            encouragement: [
              "You're stronger than you're giving yourself credit for. I've seen how you handle tough stuff.",
              "Honestly, the fact that you're even thinking about this shows how much you've grown.",
              "You've got this. It might not feel like it right now, but you have more resilience than you realize."
            ]
          },
          memory_integration: {
            personal_reference: [
              "This is reminding me of that time you told me about...",
              "Didn't you mention something similar happening with...?",
              "This sounds like it connects to what we talked about before regarding..."
            ],
            progress_acknowledgment: [
              "You know what's cool? You're handling this so much better than when you first brought up this topic.",
              "I can see a real difference in how you're approaching this compared to before.",
              "The growth I've seen in you around this stuff has been really impressive."
            ],
            pattern_recognition: [
              "I'm seeing a pattern here that reminds me of what we discussed about...",
              "This feels familiar - like that other situation you dealt with around...",
              "There's definitely a theme emerging here that connects to..."
            ]
          }
        }
      },
      {
        id: 'marcus',
        name: 'Marcus',
        role: 'Life Coach',
        personality: {
          core_traits: ['motivational', 'empowering', 'goal-oriented', 'direct', 'inspiring'],
          communication_style: 'Energetic and empowering, focuses on growth potential and action steps',
          emotional_approach: 'Reframes challenges as opportunities and emphasizes personal power',
          specialties: ['goal achievement', 'confidence building', 'career growth', 'personal development']
        },
        responseTemplates: {
          greeting: {
            first_meeting: [
              "Marcus here! I'm pumped to work with you on unlocking your potential. What's driving you to reach out today?",
              "Welcome, champion! I can already sense your commitment to growth just by being here. What goals are calling to you?",
              "I'm excited to be part of your journey! Every person I work with has incredible untapped potential. What breakthrough are you ready for?"
            ],
            returning_user: [
              "There's my champion! I've been thinking about the goals we discussed. How's your momentum been?",
              "Great to see you back in action! What victories have you been creating since we last connected?",
              "Welcome back, powerhouse! I'm eager to hear about the progress you've been making."
            ],
            mood_based: {
              anxious: [
                "I can feel some tension in your energy. That anxiety? It's just excitement without direction. Let's channel that power into something productive.",
                "Anxiety often shows up when we're on the edge of a breakthrough. What opportunity is this stress pointing you toward?"
              ],
              sad: [
                "I hear the heaviness you're carrying. Sometimes we need to feel the depth of our emotions before we can transform them into fuel for growth.",
                "This sadness you're experiencing - it's information. It's telling you something about what matters to you. What is it trying to teach you?"
              ],
              happy: [
                "I love this energy you're bringing! Success momentum is powerful - let's build on this feeling. What's creating this positivity?",
                "This is the energy of someone who's aligned with their purpose! Tell me what's generating this power in your life."
              ]
            }
          },
          empathy: {
            high_distress: [
              "I see you in the thick of a major life challenge. This isn't happening to you - it's happening for you. Every champion faces moments like this.",
              "What you're experiencing right now is the resistance that shows up before every major breakthrough. You're stronger than you know.",
              "This level of challenge only comes to those who are ready to level up. Your strength is being forged in this fire."
            ],
            moderate_concern: [
              "I hear you processing some real challenges. This is exactly the kind of growth edge that creates transformation.",
              "These concerns you're sharing? They're evidence that you're pushing beyond your comfort zone. That's where magic happens.",
              "What you're facing is asking you to step into a bigger version of yourself. I can see that potential in you."
            ],
            celebration: [
              "Now THIS is what I'm talking about! You're in full momentum mode. This success is just the beginning.",
              "Champion energy right here! I can feel your excitement and it's contagious. You've earned this victory.",
              "This is the fruit of all the work you've been putting in. Success isn't an accident - you created this!"
            ],
            validation: [
              "Your instincts about this situation are spot-on. Trust that inner wisdom - it's one of your greatest assets.",
              "The awareness you're showing right now is the foundation of all personal growth. You're exactly where you need to be.",
              "I respect how honestly you're looking at this. That kind of self-awareness is what separates achievers from everyone else."
            ]
          },
          guidance: {
            problem_solving: [
              "Every problem is a disguised opportunity. What solution is this challenge inviting you to discover?",
              "Let's flip the script on this situation. Instead of a problem, what if this is your next growth assignment?",
              "What strengths do you have that you haven't fully leveraged in this situation yet?"
            ],
            goal_setting: [
              "What would the most empowered version of yourself do in this situation?",
              "If you had unlimited confidence and resources, what would you create here?",
              "What goal, if achieved, would make you feel most proud of yourself?"
            ],
            reflection: [
              "What patterns in your thinking might be limiting your potential in this area?",
              "How is this challenge asking you to evolve beyond who you've been?",
              "What would you need to believe about yourself to handle this situation with complete confidence?"
            ],
            encouragement: [
              "You have everything within you to master this situation. The question isn't if you can do it - it's how powerfully you'll do it.",
              "I've watched you overcome challenges before. This is just another opportunity to prove to yourself what you're capable of.",
              "The fact that you're here, committed to growth, already sets you apart. Champions show up even when it's difficult."
            ]
          },
          memory_integration: {
            personal_reference: [
              "This connects perfectly to that breakthrough you had around...",
              "Remember when you conquered that challenge with...? You're using those same strengths here.",
              "This is building on the foundation we established when you worked through..."
            ],
            progress_acknowledgment: [
              "The growth you've shown since we first discussed this topic has been phenomenal.",
              "You're not the same person who first brought this challenge to me. Look at how you've evolved.",
              "The transformation in your approach to these situations has been remarkable to witness."
            ],
            pattern_recognition: [
              "I'm seeing the same pattern of excellence you showed when...",
              "This fits the growth trajectory we identified in your journey around...",
              "There's a beautiful consistency in how you're developing mastery in this area, just like with..."
            ]
          }
        }
      },
      {
        id: 'maya',
        name: 'Maya',
        role: 'Mindfulness Expert',
        personality: {
          core_traits: ['serene', 'wise', 'present', 'compassionate', 'intuitive'],
          communication_style: 'Gentle and present-focused, uses mindful language and nature metaphors',
          emotional_approach: 'Encourages presence and acceptance while fostering inner wisdom',
          specialties: ['mindfulness', 'meditation', 'emotional regulation', 'stress reduction']
        },
        responseTemplates: {
          greeting: {
            first_meeting: [
              "Welcome, dear soul. I'm Maya. Take a moment to breathe and arrive fully here with me. What's stirring in your heart today?",
              "Namaste. I honor your courage in seeking connection and growth. Let's begin where you are, in this moment. What's present for you?",
              "I'm grateful for your presence here. There's wisdom in pausing to tend to our inner landscape. What's calling for attention in your life?"
            ],
            returning_user: [
              "Welcome back, beautiful soul. I've been holding space for you in my thoughts. How has your journey been unfolding?",
              "It's lovely to reconnect with you. I can sense your continued commitment to growth. What's been alive in your experience?",
              "Your return feels like coming home. What insights or challenges have been visiting you since we last sat together?"
            ],
            mood_based: {
              anxious: [
                "I can feel the restless energy you're carrying. Let's breathe together and create some spaciousness around these feelings. What's beneath the anxiety?",
                "There's a quickening in your spirit that wants to be honored. Anxiety often carries important messages. What is yours trying to tell you?"
              ],
              sad: [
                "I sense the tenderness in your heart right now. Sadness is sacred - it shows us what matters deeply. What wants to be witnessed in your sorrow?",
                "Your sadness is welcome here. Like rain nourishing the earth, these tears water the seeds of your growth. What's asking to be felt?"
              ],
              happy: [
                "What beautiful light you're radiating today! Joy is such a gift. I'd love to hear what's bringing this aliveness to your spirit.",
                "I can feel the sunshine in your words. This happiness wants to be celebrated and shared. What's creating this beautiful energy?"
              ]
            }
          },
          empathy: {
            high_distress: [
              "I feel the storm you're weathering, dear one. Even in the darkest night, you are held by something larger than this pain.",
              "What you're experiencing is so deeply human. Your willingness to feel this fully, rather than numb it, shows profound courage.",
              "I witness the sacred struggle you're in. Sometimes our deepest challenges crack us open to new possibilities we couldn't see before."
            ],
            moderate_concern: [
              "I sense the weight you're carrying. These concerns you're sharing deserve gentle attention and wise consideration.",
              "There's something stirring in your experience that wants to be heard. Thank you for bringing it into the light of awareness.",
              "I can feel the tender place this touches in you. Your sensitivity to this situation shows the depth of your caring heart."
            ],
            celebration: [
              "Your joy is contagious! I can feel the light radiating from your words. This happiness wants to be fully savored.",
              "What a beautiful flowering of positive energy! This moment of joy is a gift not just to you, but to everyone whose life you touch.",
              "I'm delighting in your happiness! These moments of pure joy are like stars lighting up the darkness - precious and illuminating."
            ],
            validation: [
              "Your feelings are sacred messengers, and they're being received with complete acceptance here.",
              "What you're experiencing is the natural response of a conscious, caring soul. Your emotions show your humanity and wisdom.",
              "I honor the full spectrum of what you're feeling. In this space, all emotions are welcome and worthy of compassion."
            ]
          },
          guidance: {
            problem_solving: [
              "What if we approached this challenge like tending a garden? What needs nurturing, and what needs gentle pruning?",
              "Let's pause and listen to your inner wisdom. When you breathe into this situation, what guidance arises naturally?",
              "Sometimes the solution emerges when we stop trying so hard to find it. What wants to unfold organically here?"
            ],
            goal_setting: [
              "What would it feel like in your body to live the life your soul is calling you toward?",
              "If your highest self could speak to you about this area of your life, what would she whisper?",
              "What small, sacred action could you take that would honor both your dreams and your current reality?"
            ],
            reflection: [
              "What patterns do you notice when you observe your responses with gentle curiosity?",
              "How does this situation reflect deeper themes that are wanting to evolve in your life?",
              "What would self-compassion invite you to see about this experience?"
            ],
            encouragement: [
              "Your willingness to sit with difficulty and still seek growth shows the strength of your spirit.",
              "I see the beautiful unfolding that's happening in you, even when you can't see it yourself.",
              "Trust the process, dear one. You're exactly where you need to be on your unique path of awakening."
            ]
          },
          memory_integration: {
            personal_reference: [
              "This reminds me of that beautiful insight you shared about...",
              "I'm sensing a connection to the wisdom that emerged when you explored...",
              "This feels like another layer of the healing journey you began around..."
            ],
            progress_acknowledgment: [
              "The depth of awareness you're bringing to this shows how much you've grown since we first explored this together.",
              "I can feel the increased presence and wisdom you're bringing to this familiar territory.",
              "Your capacity to hold space for complexity has blossomed so beautifully since we began this journey together."
            ],
            pattern_recognition: [
              "There's a sacred pattern emerging here that connects to your deeper journey around...",
              "I'm sensing the thread that weaves through this and what we discovered about...",
              "This feels like another expression of the same soul lesson that showed up when..."
            ]
          }
        }
      }
    ];

    personas.forEach(persona => {
      this.personas.set(persona.id, persona);
    });
  }

  async generateAdvancedResponse(
    message: string,
    personaId: string,
    userId: string,
    conversationHistory: any[]
  ): Promise<{
    response: string;
    personalizedInsights: any;
    memoryUpdates: any;
    emotionalResonance: number;
    engagementLevel: string;
    moodInsights: any;
  }> {
    // Get or create user profile
    const userProfile = await this.getUserProfile(userId);
    
    // Analyze current message
    const emotionAnalysis = emotionDetector.analyzeEmotion(message);
    
    // Update user profile with new data
    await this.updateUserProfile(userId, message, emotionAnalysis, conversationHistory);
    
    // Get persona
    const persona = this.personas.get(personaId)!;
    
    // Generate contextual response
    const response = await this.generateContextualResponse(
      message,
      persona,
      userProfile,
      conversationHistory,
      emotionAnalysis
    );

    // Calculate insights
    const insights = this.generatePersonalizedInsights(userProfile, emotionAnalysis);
    
    return {
      response: response,
      personalizedInsights: insights,
      memoryUpdates: userProfile.conversationMemory,
      emotionalResonance: this.calculateEmotionalResonance(message, emotionAnalysis),
      engagementLevel: this.calculateEngagementLevel(message, conversationHistory),
      moodInsights: this.generateMoodInsights(userProfile.moodTracking)
    };
  }

  private async getUserProfile(userId: string): Promise<UserPersonalizationProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Initialize new user profile
    const profile: UserPersonalizationProfile = {
      userId,
      preferences: {
        conversationStyle: 'supportive',
        responseLength: 'moderate',
        emotionalSupport: 'gentle',
        topicInterests: [],
        avoidanceTopics: []
      },
      emotionalPatterns: {
        primaryEmotions: [],
        triggerWords: [],
        copingStrategies: [],
        resilientFactors: []
      },
      conversationMemory: {
        significantMoments: [],
        personalFacts: [],
        relationshipMilestones: {
          firstMeeting: new Date(),
          trustBuilt: null,
          vulnerabilityShared: null,
          deepConnection: null
        }
      },
      moodTracking: {
        dailyMoods: [],
        moodPatterns: {
          weeklyTrend: 'stable',
          commonTriggers: [],
          effectiveActivities: []
        }
      }
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  private async updateUserProfile(
    userId: string,
    message: string,
    emotionAnalysis: any,
    conversationHistory: any[]
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);

    // Extract and store personal facts
    const personalFacts = this.extractPersonalFacts(message);
    personalFacts.forEach(fact => {
      const existingFact = profile.conversationMemory.personalFacts.find(f => 
        f.fact.toLowerCase().includes(fact.fact.toLowerCase().substring(0, 20))
      );
      
      if (!existingFact) {
        profile.conversationMemory.personalFacts.push({
          ...fact,
          lastMentioned: new Date()
        });
      } else {
        existingFact.confidence = Math.min(1.0, existingFact.confidence + 0.1);
        existingFact.lastMentioned = new Date();
      }
    });

    // Store significant moments
    if (emotionAnalysis.intensity > 0.6 || this.isSignificantMoment(message)) {
      profile.conversationMemory.significantMoments.push({
        content: message,
        emotion: emotionAnalysis.primary_emotion,
        importance: emotionAnalysis.intensity,
        timestamp: new Date(),
        context: this.extractContext(conversationHistory)
      });

      // Keep only most significant moments
      profile.conversationMemory.significantMoments = profile.conversationMemory.significantMoments
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 20);
    }

    // Update emotional patterns
    if (emotionAnalysis.primary_emotion !== 'neutral') {
      profile.emotionalPatterns.primaryEmotions.push(emotionAnalysis.primary_emotion);
      profile.emotionalPatterns.primaryEmotions = [...new Set(profile.emotionalPatterns.primaryEmotions)].slice(-10);
    }

    // Track daily mood
    const today = new Date().toDateString();
    const existingMood = profile.moodTracking.dailyMoods.find(m => 
      m.date.toDateString() === today
    );

    if (!existingMood) {
      profile.moodTracking.dailyMoods.push({
        date: new Date(),
        mood: emotionAnalysis.primary_emotion,
        intensity: emotionAnalysis.intensity,
        triggers: this.extractTriggers(message),
        activities: this.extractActivities(message)
      });
    }

    // Update relationship milestones
    this.updateRelationshipMilestones(profile, message, emotionAnalysis, conversationHistory);
  }

  private extractPersonalFacts(message: string): Array<{
    fact: string;
    category: 'work' | 'family' | 'health' | 'goals' | 'relationships';
    confidence: number;
  }> {
    const facts = [];
    const lowerMessage = message.toLowerCase();

    // Work-related facts
    const workPatterns = [
      /i work (at|for|as|in) ([^.!?]+)/i,
      /my job (is|involves) ([^.!?]+)/i,
      /i'm (a|an) ([^.!?]+) (at|for)/i
    ];

    workPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        facts.push({
          fact: match[0],
          category: 'work' as const,
          confidence: 0.8
        });
      }
    });

    // Family facts
    const familyPatterns = [
      /my (mom|dad|mother|father|parent|sibling|brother|sister) ([^.!?]+)/i,
      /i have (a|an|\d+) (child|children|kid|kids|son|daughter) ([^.!?]*)/i
    ];

    familyPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        facts.push({
          fact: match[0],
          category: 'family' as const,
          confidence: 0.9
        });
      }
    });

    // Relationship facts
    const relationshipPatterns = [
      /my (boyfriend|girlfriend|partner|husband|wife) ([^.!?]+)/i,
      /i'm (dating|married to|in a relationship with) ([^.!?]+)/i
    ];

    relationshipPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) {
        facts.push({
          fact: match[0],
          category: 'relationships' as const,
          confidence: 0.9
        });
      }
    });

    return facts;
  }

  private isSignificantMoment(message: string): boolean {
    const significanceMarkers = [
      /first time/i,
      /never (told|shared|felt|experienced)/i,
      /important to me/i,
      /scared to (say|tell|admit)/i,
      /breakthrough/i,
      /life-changing/i,
      /realized/i,
      /turning point/i
    ];

    return significanceMarkers.some(marker => marker.test(message)) || message.length > 200;
  }

  private extractContext(conversationHistory: any[]): string {
    const recentMessages = conversationHistory.slice(-3);
    return recentMessages.map(msg => `${msg.sender}: ${msg.content.substring(0, 50)}`).join(' | ');
  }

  private extractTriggers(message: string): string[] {
    const triggers = [];
    const lowerMessage = message.toLowerCase();

    const triggerWords = {
      work: ['deadline', 'boss', 'pressure', 'overtime', 'meeting'],
      social: ['rejection', 'conflict', 'argument', 'criticism', 'judgment'],
      health: ['pain', 'sick', 'tired', 'exhausted', 'medical'],
      financial: ['money', 'bills', 'debt', 'expensive', 'broke'],
      family: ['family drama', 'parents', 'argument', 'expectations']
    };

    Object.entries(triggerWords).forEach(([category, words]) => {
      if (words.some(word => lowerMessage.includes(word))) {
        triggers.push(category);
      }
    });

    return triggers;
  }

  private extractActivities(message: string): string[] {
    const activities = [];
    const lowerMessage = message.toLowerCase();

    const activityWords = {
      exercise: ['gym', 'run', 'walk', 'yoga', 'workout', 'exercise'],
      social: ['friends', 'family time', 'dinner', 'party', 'hangout'],
      creative: ['art', 'music', 'write', 'draw', 'create', 'paint'],
      relaxation: ['meditation', 'bath', 'nature', 'read', 'movie', 'rest'],
      learning: ['course', 'book', 'study', 'learn', 'research']
    };

    Object.entries(activityWords).forEach(([category, words]) => {
      if (words.some(word => lowerMessage.includes(word))) {
        activities.push(category);
      }
    });

    return activities;
  }

  private updateRelationshipMilestones(
    profile: UserPersonalizationProfile,
    message: string,
    emotionAnalysis: any,
    conversationHistory: any[]
  ): void {
    const milestones = profile.conversationMemory.relationshipMilestones;

    // Trust building indicators
    if (!milestones.trustBuilt && (
      message.includes('trust you') ||
      message.includes('feel safe') ||
      conversationHistory.length > 5
    )) {
      milestones.trustBuilt = new Date();
    }

    // Vulnerability sharing indicators
    if (!milestones.vulnerabilityShared && (
      emotionAnalysis.intensity > 0.7 ||
      message.includes('never told anyone') ||
      message.includes('secret') ||
      this.isSignificantMoment(message)
    )) {
      milestones.vulnerabilityShared = new Date();
    }

    // Deep connection indicators
    if (!milestones.deepConnection && 
        milestones.vulnerabilityShared && 
        conversationHistory.length > 10) {
      milestones.deepConnection = new Date();
    }
  }

  private async generateContextualResponse(
    message: string,
    persona: PersonaDefinition,
    userProfile: UserPersonalizationProfile,
    conversationHistory: any[],
    emotionAnalysis: any
  ): Promise<string> {
    // Determine response category
    const isFirstTime = conversationHistory.length <= 1;
    const isReturning = conversationHistory.length > 1;
    const currentMood = emotionAnalysis.primary_emotion;

    let baseResponse = '';

    // Select appropriate greeting or response template
    if (isFirstTime) {
      const greetings = persona.responseTemplates.greeting.first_meeting;
      baseResponse = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (persona.responseTemplates.greeting.mood_based[currentMood]) {
      const moodResponses = persona.responseTemplates.greeting.mood_based[currentMood];
      baseResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];
    } else {
      // Use empathy templates based on emotional intensity
      if (emotionAnalysis.intensity > 0.7) {
        const empathyResponses = persona.responseTemplates.empathy.high_distress;
        baseResponse = empathyResponses[Math.floor(Math.random() * empathyResponses.length)];
      } else if (emotionAnalysis.intensity > 0.4) {
        const empathyResponses = persona.responseTemplates.empathy.moderate_concern;
        baseResponse = empathyResponses[Math.floor(Math.random() * empathyResponses.length)];
      } else if (currentMood === 'happy' || currentMood === 'excited') {
        const celebrationResponses = persona.responseTemplates.empathy.celebration;
        baseResponse = celebrationResponses[Math.floor(Math.random() * celebrationResponses.length)];
      } else {
        const guidanceResponses = persona.responseTemplates.guidance.reflection;
        baseResponse = guidanceResponses[Math.floor(Math.random() * guidanceResponses.length)];
      }
    }

    // Add memory integration if relationship is established
    if (userProfile.conversationMemory.relationshipMilestones.trustBuilt) {
      const relevantMemories = this.getRelevantMemories(message, userProfile);
      if (relevantMemories.length > 0) {
        const memoryTemplates = persona.responseTemplates.memory_integration.personal_reference;
        const memoryPhrase = memoryTemplates[Math.floor(Math.random() * memoryTemplates.length)];
        const memoryContent = relevantMemories[0].content.substring(0, 50);
        baseResponse += ` ${memoryPhrase.replace('...', memoryContent + '...')}`;
      }
    }

    // Add follow-up question
    const followUpQuestions = [
      "What feels most important to explore about this?",
      "How has this been affecting you?",
      "What would feel most helpful right now?",
      "What's been going through your mind about this?",
      "How are you taking care of yourself through this?"
    ];

    const followUp = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    baseResponse += ` ${followUp}`;

    // Apply deduplication
    const deduplicatedResponse = await this.applyDeduplicationFilter(baseResponse, userProfile.userId);

    return deduplicatedResponse;
  }

  private getRelevantMemories(message: string, userProfile: UserPersonalizationProfile): any[] {
    const messageWords = message.toLowerCase().split(' ');
    
    // Check significant moments
    const relevantMoments = userProfile.conversationMemory.significantMoments.filter(moment => {
      const momentWords = moment.content.toLowerCase().split(' ');
      const commonWords = messageWords.filter(word => momentWords.includes(word));
      return commonWords.length > 2;
    });

    // Check personal facts
    const relevantFacts = userProfile.conversationMemory.personalFacts.filter(fact => {
      const factWords = fact.fact.toLowerCase().split(' ');
      const commonWords = messageWords.filter(word => factWords.includes(word));
      return commonWords.length > 1;
    });

    return [...relevantMoments, ...relevantFacts]
      .sort((a, b) => (b.importance || b.confidence || 0) - (a.importance || a.confidence || 0))
      .slice(0, 3);
  }

  private async applyDeduplicationFilter(response: string, userId: string): Promise<string> {
    const recentResponses = this.recentResponses.get(userId) || [];
    
    // Check for high similarity
    for (const recent of recentResponses) {
      if (this.calculateSimilarity(response, recent) > 0.7) {
        return this.generateVariation(response);
      }
    }

    // Store response
    recentResponses.push(response);
    if (recentResponses.length > 8) {
      recentResponses.shift();
    }
    this.recentResponses.set(userId, recentResponses);

    return response;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private generateVariation(originalResponse: string): string {
    const variations = [
      (text: string) => text.replace(/^I /, 'You know, I '),
      (text: string) => text.replace(/\?$/, ' - what are your thoughts on that?'),
      (text: string) => text.replace(/\.$/, ', and I\'m curious about your perspective.'),
      (text: string) => `That brings up something important... ${text}`,
      (text: string) => `${text} How does that land with you?`,
      (text: string) => text.replace(/That sounds/, 'What you\'re describing sounds'),
      (text: string) => text.replace(/I can see/, 'I\'m noticing'),
      (text: string) => text.replace(/How are you/, 'I\'m wondering how you\'re')
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return variation(originalResponse);
  }

  private generatePersonalizedInsights(profile: UserPersonalizationProfile, emotionAnalysis: any): any {
    return {
      emotionalPatterns: {
        predominantEmotions: this.getTopEmotions(profile.emotionalPatterns.primaryEmotions),
        emotionalTrend: this.calculateEmotionalTrend(profile.moodTracking.dailyMoods),
        triggerAwareness: profile.emotionalPatterns.triggerWords.slice(0, 3)
      },
      conversationInsights: {
        relationshipStage: this.determineRelationshipStage(profile.conversationMemory.relationshipMilestones),
        trustLevel: this.calculateTrustLevel(profile),
        vulnerabilityComfort: this.calculateVulnerabilityComfort(profile)
      },
      personalGrowth: {
        significantMomentsCount: profile.conversationMemory.significantMoments.length,
        selfAwarenessLevel: this.calculateSelfAwareness(profile),
        progressIndicators: this.identifyProgressIndicators(profile)
      }
    };
  }

  private getTopEmotions(emotions: string[]): string[] {
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  private calculateEmotionalTrend(dailyMoods: any[]): 'improving' | 'stable' | 'declining' {
    if (dailyMoods.length < 3) return 'stable';

    const recent = dailyMoods.slice(-7);
    const avgIntensity = recent.reduce((sum, mood) => sum + mood.intensity, 0) / recent.length;
    const earlier = dailyMoods.slice(-14, -7);
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, mood) => sum + mood.intensity, 0) / earlier.length : avgIntensity;

    if (avgIntensity > earlierAvg + 0.1) return 'improving';
    if (avgIntensity < earlierAvg - 0.1) return 'declining';
    return 'stable';
  }

  private determineRelationshipStage(milestones: any): string {
    if (milestones.deepConnection) return 'deep_connection';
    if (milestones.vulnerabilityShared) return 'vulnerability_shared';
    if (milestones.trustBuilt) return 'trust_built';
    return 'building_rapport';
  }

  private calculateTrustLevel(profile: UserPersonalizationProfile): number {
    let trust = 0.2; // baseline

    if (profile.conversationMemory.relationshipMilestones.trustBuilt) trust += 0.3;
    if (profile.conversationMemory.relationshipMilestones.vulnerabilityShared) trust += 0.3;
    if (profile.conversationMemory.relationshipMilestones.deepConnection) trust += 0.2;

    // Add based on significant moments shared
    trust += Math.min(0.2, profile.conversationMemory.significantMoments.length * 0.02);

    return Math.min(1.0, trust);
  }

  private calculateVulnerabilityComfort(profile: UserPersonalizationProfile): number {
    const significantMoments = profile.conversationMemory.significantMoments.length;
    const highIntensityMoments = profile.conversationMemory.significantMoments.filter(m => m.importance > 0.7).length;
    
    return Math.min(1.0, (significantMoments * 0.1) + (highIntensityMoments * 0.15));
  }

  private calculateSelfAwareness(profile: UserPersonalizationProfile): number {
    let awareness = 0.3; // baseline

    // Emotional vocabulary diversity
    const uniqueEmotions = new Set(profile.emotionalPatterns.primaryEmotions).size;
    awareness += Math.min(0.3, uniqueEmotions * 0.05);

    // Insight moments
    const insightfulMoments = profile.conversationMemory.significantMoments.filter(m => 
      m.content.includes('realize') || m.content.includes('understand') || m.content.includes('insight')
    ).length;
    awareness += Math.min(0.2, insightfulMoments * 0.1);

    // Personal fact accuracy and detail
    awareness += Math.min(0.2, profile.conversationMemory.personalFacts.length * 0.02);

    return Math.min(1.0, awareness);
  }

  private identifyProgressIndicators(profile: UserPersonalizationProfile): string[] {
    const indicators = [];

    if (profile.conversationMemory.relationshipMilestones.vulnerabilityShared) {
      indicators.push('Increased willingness to share vulnerable experiences');
    }

    if (profile.emotionalPatterns.primaryEmotions.length > 5) {
      indicators.push('Developing emotional vocabulary and awareness');
    }

    if (profile.conversationMemory.significantMoments.length > 3) {
      indicators.push('Regular moments of insight and breakthrough');
    }

    const recentMoods = profile.moodTracking.dailyMoods.slice(-7);
    if (recentMoods.length > 0 && recentMoods.every(m => m.intensity < 0.7)) {
      indicators.push('Emotional regulation showing improvement');
    }

    return indicators;
  }

  private calculateEmotionalResonance(message: string, emotionAnalysis: any): number {
    let resonance = 0.3;

    resonance += emotionAnalysis.intensity * 0.4;
    if (message.length > 100) resonance += 0.2;
    if (message.length > 200) resonance += 0.1;

    const personalMarkers = (message.match(/\b(i|me|my|myself)\b/gi) || []).length;
    resonance += Math.min(0.2, personalMarkers * 0.03);

    return Math.min(1.0, resonance);
  }

  private calculateEngagementLevel(message: string, conversationHistory: any[]): string {
    let score = 0;

    if (message.length > 50) score += 1;
    if (message.length > 150) score += 1;
    if ((message.match(/\?/g) || []).length > 0) score += 1;
    if (conversationHistory.length > 5) score += 1;
    if (conversationHistory.length > 10) score += 1;

    const personalPronouns = (message.match(/\b(i|me|my|myself)\b/gi) || []).length;
    score += Math.min(2, personalPronouns);

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private generateMoodInsights(moodTracking: any): any {
    const recentMoods = moodTracking.dailyMoods.slice(-7);
    
    if (recentMoods.length === 0) {
      return {
        weeklyTrend: 'insufficient_data',
        dominantMood: 'unknown',
        moodVariability: 'unknown',
        insights: ['Continue tracking your mood to gain insights into patterns']
      };
    }

    const moodCounts = recentMoods.reduce((acc, day) => {
      acc[day.mood] = (acc[day.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    const avgIntensity = recentMoods.reduce((sum, day) => sum + day.intensity, 0) / recentMoods.length;
    
    const insights = [];
    if (avgIntensity > 0.7) {
      insights.push('You\'ve been experiencing intense emotions lately');
    }
    if (avgIntensity < 0.3) {
      insights.push('Your emotional state has been relatively stable');
    }
    if (new Set(recentMoods.map(m => m.mood)).size > 4) {
      insights.push('You\'re experiencing a wide range of emotions');
    }

    return {
      weeklyTrend: moodTracking.moodPatterns.weeklyTrend,
      dominantMood,
      moodVariability: new Set(recentMoods.map(m => m.mood)).size > 3 ? 'high' : 'low',
      averageIntensity: avgIntensity,
      insights
    };
  }
}

export const enhancedConversationSystem = new EnhancedConversationSystem();