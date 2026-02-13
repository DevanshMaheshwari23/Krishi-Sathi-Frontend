import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader, 
  Volume2, 
  VolumeX,
  Languages,
  Sprout,
  Bug,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

export const SathiPage = () => {
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    language,
    sendMessage, 
    playAudio, 
    stopAudio,
    clearChat,
    setLanguage,
    getCropAdvice,
    analyzePest
  } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    setShowQuickActions(false);

    try {
      await sendMessage(message);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (action: string) => {
    setShowQuickActions(false);

    if (action === 'crop-advice') {
      const crop = prompt('Enter crop name (e.g., Wheat, Rice):');
      if (crop) {
        try {
          await getCropAdvice(crop);
        } catch (error) {
          toast.error('Failed to get crop advice');
        }
      }
    } else if (action === 'pest-analysis') {
      const description = prompt('Describe the pest/disease issue:');
      if (description) {
        try {
          await analyzePest(description);
        } catch (error) {
          toast.error('Failed to analyze pest issue');
        }
      }
    }
  };

  const handleAudioToggle = (messageId: string, text: string, isPlaying?: boolean) => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(messageId, text);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[var(--background)]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 animate-pulse rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 animate-pulse rounded-full bg-[var(--secondary)]/10 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">
                    Sathi AI
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    {language === 'hi' ? 'आपका कृषि सहायक' : 'Your farming assistant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                >
                  <Languages className="h-4 w-4" />
                  <span className="font-medium">{language === 'en' ? 'EN' : 'हिं'}</span>
                </Button>

                {/* Clear Chat */}
                {messages.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Clear all messages?')) {
                        clearChat();
                        setShowQuickActions(true);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border)]">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && showQuickActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex h-full flex-col items-center justify-center px-4 text-center"
              >
                <Sparkles className="mb-6 h-20 w-20 text-[var(--primary)]" />
                <h2 className="mb-3 font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">
                  {language === 'hi' ? 'नमस्ते! मैं साथी हूँ' : 'Welcome to Sathi AI'}
                </h2>
                <p className="mb-8 max-w-2xl text-lg text-[var(--text-muted)]">
                  {language === 'hi' 
                    ? 'खेती, फसल, कीट प्रबंधन या बाजार भाव के बारे में कुछ भी पूछें!'
                    : 'Ask me anything about farming, crops, pest management, or market prices!'}
                </p>

                {/* Quick Actions */}
                <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      icon: Sprout,
                      title: language === 'hi' ? 'फसल सलाह' : 'Crop Advice',
                      description: language === 'hi' ? 'खेती के सुझाव पाएं' : 'Get cultivation tips',
                      action: 'crop-advice',
                      gradient: 'from-green-500 to-emerald-500'
                    },
                    {
                      icon: Bug,
                      title: language === 'hi' ? 'कीट विश्लेषण' : 'Pest Analysis',
                      description: language === 'hi' ? 'कीट समस्या का समाधान' : 'Identify pest issues',
                      action: 'pest-analysis',
                      gradient: 'from-red-500 to-orange-500'
                    },
                    {
                      icon: MessageCircle,
                      title: language === 'hi' ? 'सामान्य प्रश्न' : 'General Query',
                      description: language === 'hi' ? 'कुछ भी पूछें' : 'Ask anything',
                      action: 'general',
                      gradient: 'from-blue-500 to-cyan-500'
                    }
                  ].map((action, index) => (
                    <motion.button
                      key={action.action}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => action.action !== 'general' && handleQuickAction(action.action)}
                      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:scale-105 hover:border-[var(--border-hover)] hover:shadow-md"
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10",
                        action.gradient
                      )} />
                      
                      <div className="relative">
                        <div className={cn(
                          "mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br shadow-lg",
                          action.gradient
                        )}>
                          <action.icon className="h-7 w-7 text-white" />
                        </div>
                        
                        <h3 className="mb-2 text-lg font-bold text-[var(--text)]">{action.title}</h3>
                        <p className="text-sm text-[var(--text-muted)]">{action.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  "flex max-w-3xl items-start gap-3",
                  message.role === 'user' && "flex-row-reverse"
                )}>
                  {/* Avatar */}
                  <div className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] shadow-lg",
                    message.role === 'user'
                      ? 'bg-[var(--primary)]'
                      : 'bg-gradient-to-br from-[var(--secondary)] to-orange-500'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div className={cn(
                    "group relative rounded-[var(--radius-lg)] px-5 py-4 shadow-sm",
                    message.role === 'user'
                      ? 'bg-[var(--primary)] text-white'
                      : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
                  )}>
                    {message.role === 'model' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}

                    {/* Audio Button (AI messages only) */}
                    {message.role === 'model' && (
                      <button
                        onClick={() => handleAudioToggle(message.id, message.content, message.isAudioPlaying)}
                        className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] shadow-lg opacity-0 transition-all hover:bg-[var(--surface-hover)] group-hover:opacity-100 border border-[var(--border)]"
                      >
                        {message.isAudioPlaying ? (
                          <VolumeX className="h-4 w-4 text-[var(--text)]" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-[var(--text)]" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--secondary)] to-orange-500 shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-muted)]">
                        {language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
        >
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={language === 'hi' ? 'खेती के बारे में कुछ पूछें...' : 'Ask me about farming...'}
                className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border)]"
                rows={1}
                style={{ maxHeight: '120px', minHeight: '48px' }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              variant="default"
              size="sm"
              className="h-12 w-12 rounded-[var(--radius-md)]"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-between px-2">
            <p className="text-xs text-[var(--text-muted)]">
              {language === 'hi' 
                ? '⌨️ Enter से भेजें • Shift+Enter से नई लाइन'
                : '⌨️ Press Enter to send • Shift+Enter for new line'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Powered by</span>
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-xs font-semibold text-transparent">
                Gemini AI
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
