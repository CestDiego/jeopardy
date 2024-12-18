const depths = ["Light", "Medium", "Deep"] as const;
export type Depth = (typeof depths)[number];

export const questions: { text: string; depth: Depth }[] = [
  {
    text: "What's a childhood memory that still makes you smile?",
    depth: "Light",
  },
  {
    text: "If you could master one skill instantly, what would it be and why?",
    depth: "Medium",
  },
  {
    text: "What's the most significant way in which you've grown as a person in the last year?",
    depth: "Deep",
  },
  {
    text: "If you could have dinner with any historical figure, who would it be and why?",
    depth: "Medium",
  },
  {
    text: "What's a belief you held strongly in the past that you've since changed your mind about?",
    depth: "Deep",
  },
  { text: "What's your favorite way to spend a lazy Sunday?", depth: "Light" },
  {
    text: "What's a book that has significantly influenced your worldview?",
    depth: "Medium",
  },
  {
    text: "What's the hardest lesson you've had to learn in life so far?",
    depth: "Deep",
  },
  {
    text: "If you could live in any fictional world, which one would you choose?",
    depth: "Light",
  },
  { text: "What's a goal you're currently working towards?", depth: "Medium" },
  {
    text: "What's your biggest fear, and how does it impact your life?",
    depth: "Deep",
  },
  { text: "What's your go-to comfort food?", depth: "Light" },
  {
    text: "How do you think technology will change our lives in the next 10 years?",
    depth: "Medium",
  },
  {
    text: "What's a moral dilemma you've faced, and how did you resolve it?",
    depth: "Deep",
  },
  {
    text: "If you could have any superpower, what would it be?",
    depth: "Light",
  },
  {
    text: "What's a hobby you'd like to pick up if you had more time?",
    depth: "Medium",
  },
  {
    text: "How has your relationship with your parents evolved as you've grown older?",
    depth: "Deep",
  },
  { text: "What's your favorite season and why?", depth: "Light" },
  { text: "How do you define success for yourself?", depth: "Medium" },
  {
    text: "What's a personal value you refuse to compromise on?",
    depth: "Deep",
  },
  {
    text: "What's the best piece of advice you've ever received?",
    depth: "Medium",
  },
  {
    text: "If you could change one thing about the world, what would it be?",
    depth: "Deep",
  },
  { text: "What's your favorite childhood game?", depth: "Light" },
  { text: "How do you handle stress and pressure?", depth: "Medium" },
  {
    text: "What's a decision you've made that has completely changed the course of your life?",
    depth: "Deep",
  },
  {
    text: "If you could travel anywhere in the world right now, where would you go?",
    depth: "Light",
  },
  {
    text: "What's a skill you have that most people don't know about?",
    depth: "Medium",
  },
  {
    text: "How do you think your life experiences have shaped your personality?",
    depth: "Deep",
  },
  { text: "What's your favorite type of music?", depth: "Light" },
  { text: "How do you approach making difficult decisions?", depth: "Medium" },
  {
    text: "What's a personal challenge you're currently facing?",
    depth: "Deep",
  },
  { text: "What's your ideal weekend getaway?", depth: "Light" },
  {
    text: "How do you think your generation differs from previous ones?",
    depth: "Medium",
  },
  { text: "What's a life-changing experience you've had?", depth: "Deep" },
  {
    text: "If you could have dinner with three people, living or dead, who would they be?",
    depth: "Medium",
  },
  { text: "What do you think is the meaning of life?", depth: "Deep" },
  { text: "What's your favorite movie and why?", depth: "Light" },
  { text: "How do you define happiness?", depth: "Medium" },
  {
    text: "What's a personal belief that you hold that others might find controversial?",
    depth: "Deep",
  },
  {
    text: "What's your favorite way to relax after a long day?",
    depth: "Light",
  },
  {
    text: "How do you think social media has impacted society?",
    depth: "Medium",
  },
  {
    text: "What's a mistake you've made that taught you an important lesson?",
    depth: "Deep",
  },
  {
    text: "If you could learn any language instantly, which one would it be?",
    depth: "Light",
  },
  { text: "What's a cause you're passionate about?", depth: "Medium" },
  { text: "How has your definition of love changed over time?", depth: "Deep" },
  { text: "What's your favorite childhood cartoon?", depth: "Light" },
  {
    text: "How do you think education systems could be improved?",
    depth: "Medium",
  },
  {
    text: "What's a personal weakness you're working on improving?",
    depth: "Deep",
  },
  {
    text: "If you could have a conversation with your younger self, what advice would you give?",
    depth: "Deep",
  },
  {
    text: "What's your favorite holiday and how do you celebrate it?",
    depth: "Light",
  },
  {
    text: "How do you think climate change will affect future generations?",
    depth: "Medium",
  },
  {
    text: "What's a belief or opinion you've changed your mind about?",
    depth: "Deep",
  },
  { text: "What's your favorite board game?", depth: "Light" },
  { text: "How do you maintain a work-life balance?", depth: "Medium" },
  {
    text: "What's a personal goal you've set for yourself this year?",
    depth: "Medium",
  },
  {
    text: "If you could change one decision from your past, what would it be?",
    depth: "Deep",
  },
  { text: "What's your favorite type of cuisine?", depth: "Light" },
  {
    text: "How do you think artificial intelligence will impact job markets in the future?",
    depth: "Medium",
  },
  {
    text: "What's a personal philosophy or mantra you live by?",
    depth: "Deep",
  },
  {
    text: "If you could instantly become an expert in one subject, what would it be?",
    depth: "Medium",
  },
  {
    text: "What's a childhood dream you still hope to achieve?",
    depth: "Deep",
  },
  { text: "What's your favorite way to exercise?", depth: "Light" },
  {
    text: "How do you think space exploration will evolve in the next 50 years?",
    depth: "Medium",
  },
  {
    text: "What's the most valuable lesson you've learned from a failure?",
    depth: "Deep",
  },
  {
    text: "If you could have a conversation with any animal, which would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think the concept of privacy will change in the future?",
    depth: "Medium",
  },
  {
    text: "What's a personal boundary you've had to set in your life?",
    depth: "Deep",
  },
  { text: "What's your favorite ice cream flavor?", depth: "Light" },
  {
    text: "How do you think virtual reality will impact entertainment and social interaction?",
    depth: "Medium",
  },
  {
    text: "What's a personal trait you've inherited from your parents?",
    depth: "Deep",
  },
  {
    text: "If you could be any fictional character for a day, who would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think the role of government will change in the next 20 years?",
    depth: "Medium",
  },
  {
    text: "What's a personal sacrifice you've made for someone else?",
    depth: "Deep",
  },
  { text: "What's your favorite childhood snack?", depth: "Light" },
  {
    text: "How do you think renewable energy will transform society?",
    depth: "Medium",
  },
  {
    text: "What's a personal insecurity you've overcome or are working to overcome?",
    depth: "Deep",
  },
  {
    text: "If you could instantly learn to play any musical instrument, which would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think genetic engineering will impact healthcare in the future?",
    depth: "Medium",
  },
  {
    text: "What's a personal experience that has significantly shaped your worldview?",
    depth: "Deep",
  },
  { text: "What's your favorite way to spend time in nature?", depth: "Light" },
  {
    text: "How do you think the concept of work will evolve in the next 50 years?",
    depth: "Medium",
  },
  {
    text: "What's a personal belief you hold that you think more people should adopt?",
    depth: "Deep",
  },
  {
    text: "If you could have a lifetime supply of one food item, what would it be?",
    depth: "Light",
  },
  {
    text: "How do you think transportation will change in the next 30 years?",
    depth: "Medium",
  },
  {
    text: "What's a personal relationship you've had to end for your own well-being?",
    depth: "Deep",
  },
  { text: "What's your favorite type of weather?", depth: "Light" },
  {
    text: "How do you think education will be different for the next generation?",
    depth: "Medium",
  },
  {
    text: "What's a personal value you've had to defend against societal pressure?",
    depth: "Deep",
  },
  {
    text: "If you could instantly become fluent in any language, which would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think social norms will change in the next 20 years?",
    depth: "Medium",
  },
  {
    text: "What's a personal struggle you've overcome that you're proud of?",
    depth: "Deep",
  },
  { text: "What's your favorite childhood memory?", depth: "Light" },
  {
    text: "How do you think the concept of family will evolve in the future?",
    depth: "Medium",
  },
  {
    text: "What's a personal belief you've questioned recently?",
    depth: "Deep",
  },
  {
    text: "If you could have any animal as a pet, regardless of practicality, what would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think the role of religion in society will change in the future?",
    depth: "Medium",
  },
  {
    text: "What's a personal goal you've achieved that you're most proud of?",
    depth: "Deep",
  },
  {
    text: "What's your favorite way to celebrate your birthday?",
    depth: "Light",
  },
  {
    text: "How do you think the concept of identity will change with advancing technology?",
    depth: "Medium",
  },
  { text: "What's a personal fear you've had to confront?", depth: "Deep" },
  {
    text: "If you could instantly master any sport, which would you choose?",
    depth: "Light",
  },
  {
    text: "How do you think the concept of money will evolve in the next 50 years?",
    depth: "Medium",
  },
  {
    text: "What's a personal truth you've had to accept about yourself?",
    depth: "Deep",
  },
];
