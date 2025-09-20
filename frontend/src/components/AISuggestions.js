import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAIsuggestions } from '../hooks/useAISuggestions';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  XMarkIcon,
  PlusIcon,
  CloudIcon,
  CalendarDaysIcon,
  MapPinIcon,
  KeyIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const AISuggestions = ({ belongings, onAddSuggestion, className = '' }) => {
  const { colors } = useTheme();
  const { 
    initializeAI, 
    getAIPoweredSuggestions, 
    getSmartCombinedSuggestions, 
    generatePackingTips,
    isLoading 
  } = useAIsuggestions();
  
  const [suggestions, setSuggestions] = useState([]);
  const [tips, setTips] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [context, setContext] = useState({
    weather: '',
    temperature: '',
    duration: '',
    destination: '',
    month: new Date().getMonth() + 1
  });

  useEffect(() => {
    const loadSuggestions = async () => {
      if (isAIEnabled) {
        // Use real AI suggestions
        const result = await getAIPoweredSuggestions(context);
        setSuggestions(result.suggestions || []);
        setTips(result.tips || []);
      } else {
        // Use fallback suggestions
        const newSuggestions = getSmartCombinedSuggestions(context);
        const newTips = generatePackingTips(belongings);
        setSuggestions(newSuggestions);
        setTips(newTips);
      }
    };

    loadSuggestions();
  }, [context, belongings, isAIEnabled, getAIPoweredSuggestions, getSmartCombinedSuggestions, generatePackingTips]);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      const success = initializeAI(apiKey.trim());
      if (success) {
        setIsAIEnabled(true);
        setShowApiKeyInput(false);
        // Store API key in localStorage (encrypted in real app)
        localStorage.setItem('openai_api_key', apiKey.trim());
      }
    }
  };

  const handleContextUpdate = (field, value) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      const success = initializeAI(savedApiKey);
      if (success) {
        setIsAIEnabled(true);
      }
    }
  }, [initializeAI]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '📝';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/30';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/30';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  if (!isExpanded) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            w-full p-3 rounded-lg border transition-all duration-300 transform hover:scale-[1.02]
            ${colors.bg.card} ${colors.border.primary} ${colors.text.primary}
            hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
            dark:hover:from-blue-900/20 dark:hover:to-purple-900/20
          `}
        >
          <div className="flex items-center gap-3">
            {isAIEnabled ? (
              <CpuChipIcon className="h-5 w-5 text-green-500" />
            ) : (
              <SparklesIcon className="h-5 w-5 text-blue-500" />
            )}
            <span className="font-medium">
              {isAIEnabled ? 'Get AI-Powered Packing Suggestions' : 'Get Smart Packing Suggestions'}
            </span>
            <div className={`ml-auto text-white text-xs px-2 py-1 rounded-full ${
              isAIEnabled ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {isAIEnabled ? 'AI Enabled' : 'Smart'}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className={`
        rounded-lg border transition-all duration-300
        ${colors.bg.card} ${colors.border.primary}
        shadow-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isAIEnabled ? (
              <CpuChipIcon className="h-6 w-6 text-green-500" />
            ) : (
              <SparklesIcon className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${colors.text.primary}`}>
                {isAIEnabled ? 'AI Packing Assistant' : 'Smart Packing Assistant'}
              </h3>
              <p className={`text-xs ${colors.text.muted}`}>
                {isAIEnabled ? 'Powered by OpenAI GPT' : 'Rule-based suggestions'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAIEnabled && (
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`
                  p-2 rounded-full transition-all duration-200 
                  ${showApiKeyInput ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500'}
                  hover:bg-blue-50 dark:hover:bg-blue-900/50
                `}
                title="Enable AI with OpenAI API Key"
              >
                <KeyIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className={`p-1 rounded-full transition-colors ${colors.text.muted} hover:${colors.text.secondary} hover:${colors.bg.active}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && !isAIEnabled && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <h4 className={`text-sm font-medium mb-2 ${colors.text.secondary}`}>
              Enable Real AI Suggestions
            </h4>
            <p className={`text-xs mb-3 ${colors.text.muted}`}>
              Enter your OpenAI API key to get intelligent, context-aware packing suggestions powered by GPT.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onPaste={(e) => {
                    // Allow paste operation
                    e.stopPropagation();
                  }}
                  onCopy={(e) => {
                    // Allow copy operation
                    e.stopPropagation();
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  className={`
                    w-full px-3 py-2 pr-10 text-sm rounded border transition-colors
                    ${colors.bg.secondary} ${colors.border.secondary} ${colors.text.primary}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`
                    absolute right-2 top-1/2 transform -translate-y-1/2
                    p-1 rounded transition-colors text-gray-400 hover:text-gray-600
                  `}
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                onClick={handleApiKeySubmit}
                disabled={!apiKey.trim()}
                className={`
                  px-4 py-2 text-sm font-medium rounded transition-all duration-200
                  ${apiKey.trim() 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Enable AI
              </button>
            </div>
            <p className={`text-xs mt-2 ${colors.text.muted}`}>
              Your API key is stored locally and used only for generating suggestions.
            </p>
          </div>
        )}

        {/* Context Inputs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className={`text-sm font-medium mb-3 ${colors.text.secondary}`}>
            Tell me about your trip for {isAIEnabled ? 'AI-powered' : 'smart'} suggestions:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Destination (e.g., Hawaii, NYC)"
                value={context.destination}
                onChange={(e) => handleContextUpdate('destination', e.target.value)}
                className={`
                  flex-1 px-3 py-1.5 text-sm rounded border transition-colors
                  ${colors.bg.secondary} ${colors.border.secondary} ${colors.text.primary}
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
              <input
                type="number"
                placeholder="Days (e.g., 5)"
                value={context.duration}
                onChange={(e) => handleContextUpdate('duration', e.target.value)}
                className={`
                  flex-1 px-3 py-1.5 text-sm rounded border transition-colors
                  ${colors.bg.secondary} ${colors.border.secondary} ${colors.text.primary}
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </div>
            <div className="flex items-center gap-2">
              <CloudIcon className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Weather (e.g., sunny, rainy)"
                value={context.weather}
                onChange={(e) => handleContextUpdate('weather', e.target.value)}
                className={`
                  flex-1 px-3 py-1.5 text-sm rounded border transition-colors
                  ${colors.bg.secondary} ${colors.border.secondary} ${colors.text.primary}
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Generating AI suggestions...
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${colors.text.secondary}`}>
              {isAIEnabled ? (
                <CpuChipIcon className="h-4 w-4 text-green-500" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isAIEnabled ? 'AI-Powered Suggestions' : 'Smart Suggestions'}
            </h4>
            <div className="grid gap-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => onAddSuggestion(suggestion)}
                  className={`
                    flex items-center justify-between p-3 rounded border transition-all duration-300 cursor-pointer
                    ${getPriorityColor(suggestion.priority)}
                    hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]
                    group
                  `}
                  title={`Click to add "${suggestion.name}" to your packing list`}
                >
                  <div className="flex items-center gap-3 flex-1 pointer-events-none">
                    <span className="text-lg">{getPriorityIcon(suggestion.priority)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${colors.text.primary}`}>
                          {suggestion.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${colors.primary.bg} ${colors.primary.text}`}>
                          {suggestion.category}
                        </span>
                      </div>
                      <p className={`text-xs ${colors.text.muted}`}>
                        {suggestion.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pointer-events-none">
                    <button
                      className={`
                        p-1.5 rounded-full transition-all duration-200 transform group-hover:scale-110
                        text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50
                        group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50
                        pointer-events-auto
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSuggestion(suggestion);
                      }}
                      title="Add to packing list"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packing Tips */}
        {tips.length > 0 && (
          <div className="p-4">
            <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${colors.text.secondary}`}>
              <LightBulbIcon className="h-4 w-4" />
              Smart Packing Tips
            </h4>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`
                    p-2 rounded text-sm transition-colors
                    ${colors.bg.active} ${colors.text.secondary}
                  `}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
