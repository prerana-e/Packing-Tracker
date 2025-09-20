import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon, 
  TrashIcon,
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';
import { useColorSystem } from '../hooks/useColorSystem';

const BelongingItem = ({ belonging, onEdit, onDelete, onToggleStatus }) => {
  const { id, name, category, tags, status, priority = 'medium' } = belonging;
  const isPacked = status === 'packed';
  const { colors } = useTheme();
  const { getCategoryColors, getPriorityColors, getStatusColors } = useColorSystem();
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryColors = getCategoryColors(category);
  const priorityColors = getPriorityColors(priority);
  const statusColors = getStatusColors(status, category);

  const handleToggleClick = async () => {
    setIsAnimating(true);
    await onToggleStatus(id, isPacked ? 'unpacked' : 'packed');
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getSmartIcon = (itemName, category) => {
    const name = itemName.toLowerCase();
    
    // Electronics & Tech
    if (name.includes('phone') || name.includes('iphone') || name.includes('android')) return '📱';
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) return '💻';
    if (name.includes('tablet') || name.includes('ipad')) return '📱';
    if (name.includes('camera') || name.includes('dslr')) return '📷';
    if (name.includes('headphone') || name.includes('earphone') || name.includes('airpods')) return '🎧';
    if (name.includes('charger') || name.includes('cable') || name.includes('cord')) return '🔌';
    if (name.includes('battery') || name.includes('powerbank') || name.includes('power bank')) return '🔋';
    if (name.includes('speaker') || name.includes('bluetooth')) return '🔊';
    if (name.includes('watch') || name.includes('smartwatch') || name.includes('apple watch')) return '⌚';
    if (name.includes('kindle') || name.includes('e-reader')) return '📖';
    
    // Clothing & Accessories
    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('tshirt')) return '👕';
    if (name.includes('pants') || name.includes('jeans') || name.includes('trousers')) return '👖';
    if (name.includes('dress') || name.includes('gown')) return '👗';
    if (name.includes('jacket') || name.includes('coat') || name.includes('blazer')) return '🧥';
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) return '👟';
    if (name.includes('sock') || name.includes('socks')) return '🧦';
    if (name.includes('underwear') || name.includes('boxers') || name.includes('briefs')) return '🩲';
    if (name.includes('bra') || name.includes('lingerie')) return '👙';
    if (name.includes('hat') || name.includes('cap') || name.includes('beanie')) return '🧢';
    if (name.includes('glasses') || name.includes('sunglasses')) return '👓';
    if (name.includes('belt') || name.includes('wallet') || name.includes('purse')) return '👝';
    if (name.includes('jewelry') || name.includes('necklace') || name.includes('ring')) return '💍';
    
    // Toiletries & Personal Care
    if (name.includes('toothbrush') || name.includes('dental')) return '🪥';
    if (name.includes('toothpaste')) return '🦷';
    if (name.includes('shampoo') || name.includes('conditioner')) return '🧴';
    if (name.includes('soap') || name.includes('body wash')) return '🧼';
    if (name.includes('deodorant') || name.includes('antiperspirant')) return '�';
    if (name.includes('perfume') || name.includes('cologne') || name.includes('fragrance')) return '💐';
    if (name.includes('lotion') || name.includes('moisturizer') || name.includes('cream')) return '🧴';
    if (name.includes('razor') || name.includes('shaver')) return '🪒';
    if (name.includes('makeup') || name.includes('cosmetic') || name.includes('lipstick')) return '💄';
    if (name.includes('sunscreen') || name.includes('sunblock')) return '☀️';
    
    // Documents & Books
    if (name.includes('passport') || name.includes('visa')) return '�';
    if (name.includes('ticket') || name.includes('boarding pass')) return '🎫';
    if (name.includes('license') || name.includes('id') || name.includes('card')) return '🪪';
    if (name.includes('book') || name.includes('novel') || name.includes('textbook')) return '📚';
    if (name.includes('notebook') || name.includes('journal') || name.includes('diary')) return '📓';
    if (name.includes('document') || name.includes('paper') || name.includes('certificate')) return '📄';
    
    // Food & Kitchen
    if (name.includes('snack') || name.includes('chips') || name.includes('cookies')) return '🍪';
    if (name.includes('water') || name.includes('bottle')) return '🧴';
    if (name.includes('coffee') || name.includes('tea')) return '☕';
    if (name.includes('plate') || name.includes('bowl') || name.includes('dish')) return '🍽️';
    if (name.includes('cup') || name.includes('mug') || name.includes('glass')) return '🥤';
    if (name.includes('fork') || name.includes('spoon') || name.includes('knife') || name.includes('cutlery')) return '🍴';
    if (name.includes('thermos') || name.includes('flask')) return '🍶';
    
    // Bedding & Home
    if (name.includes('pillow') || name.includes('cushion')) return '🛏️';
    if (name.includes('blanket') || name.includes('sheet') || name.includes('duvet')) return '🛌';
    if (name.includes('towel')) return '🏖️';
    if (name.includes('lamp') || name.includes('light')) return '💡';
    if (name.includes('candle') || name.includes('incense')) return '🕯️';
    
    // Sports & Fitness
    if (name.includes('gym') || name.includes('workout') || name.includes('exercise')) return '🏋️';
    if (name.includes('yoga') || name.includes('mat')) return '🧘';
    if (name.includes('swim') || name.includes('goggles') || name.includes('swimsuit')) return '🏊';
    if (name.includes('bike') || name.includes('bicycle') || name.includes('helmet')) return '�';
    if (name.includes('ball') || name.includes('sport')) return '⚽';
    
    // Travel & Transportation
    if (name.includes('suitcase') || name.includes('luggage') || name.includes('bag')) return '🧳';
    if (name.includes('backpack') || name.includes('daypack')) return '🎒';
    if (name.includes('map') || name.includes('gps')) return '🗺️';
    if (name.includes('umbrella')) return '☂️';
    if (name.includes('key') || name.includes('keychain')) return '🔑';
    
    // Medical & Health
    if (name.includes('medicine') || name.includes('pill') || name.includes('medication')) return '�';
    if (name.includes('thermometer')) return '🌡️';
    if (name.includes('bandage') || name.includes('band-aid') || name.includes('first aid')) return '🩹';
    if (name.includes('vitamin') || name.includes('supplement')) return '💊';
    
    // Office & Stationery
    if (name.includes('pen') || name.includes('pencil')) return '✏️';
    if (name.includes('marker') || name.includes('highlighter')) return '🖊️';
    if (name.includes('scissors')) return '✂️';
    if (name.includes('tape') || name.includes('glue')) return '📎';
    
    // Miscellaneous
    if (name.includes('gift') || name.includes('present')) return '🎁';
    if (name.includes('toy') || name.includes('game')) return '🎮';
    if (name.includes('plant') || name.includes('flower')) return '🌱';
    if (name.includes('trash') || name.includes('garbage')) return '🗑️';
    if (name.includes('tool') || name.includes('screwdriver') || name.includes('hammer')) return '🔧';
    
    // Fall back to category-based icons if no specific match
    switch (category.toLowerCase()) {
      case 'electronics': return '📱';
      case 'clothes': return '👕';
      case 'documents': return '📄';
      case 'books': return '📚';
      case 'bedding': return '🛏️';
      case 'kitchenware': return '🍽️';
      case 'toiletries': return '🧴';
      case 'sports': return '🏋️';
      case 'travel': return '�';
      case 'medical': return '💊';
      default: return '📦';
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group
        ${statusColors.border} ${statusColors.bg}
        hover:shadow-xl ${statusColors.glow}
        ${isAnimating ? 'animate-bounce' : ''}
        hover:-translate-y-1
      `}
      onClick={handleToggleClick}
    >
      {/* Priority indicator */}
      {priority === 'high' && (
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${priorityColors.indicator} ${priorityColors.pulse || ''}`} />
      )}
      
      {/* Category gradient background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300
        ${categoryColors.gradient}
      `} />
      
      {/* Packing success animation overlay */}
      {isAnimating && isPacked && (
        <div className={`absolute inset-0 opacity-20 animate-pulse ${categoryColors.accent}`} />
      )}
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header with icon and name */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-2xl transition-transform duration-300 ${isAnimating ? 'animate-spin' : ''} group-hover:scale-110`}>
              {getSmartIcon(name, category)}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className={`
                text-lg font-semibold truncate transition-all duration-300
                ${isPacked 
                  ? `${colors.text.secondary} line-through transform scale-95` 
                  : `${statusColors.text} group-hover:scale-105`
                }
              `}>
                {name}
              </h3>
              <p className={`text-sm capitalize transition-colors duration-300 ${categoryColors.text} font-medium`}>
                {category}
                {priority === 'high' && <span className="ml-1">🔥</span>}
                {priority === 'low' && <span className="ml-1">📅</span>}
              </p>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`
                    inline-block px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 transform hover:scale-105
                    ${categoryColors.accent} ${categoryColors.text}
                    animate-fadeIn border ${categoryColors.border}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border transition-all duration-300 transform
              ${isPacked 
                ? `${colors.success.bg} ${colors.success.text} ${colors.success.border} scale-105 shadow-md` 
                : `${statusColors.accent} ${statusColors.text} ${statusColors.border}`
              }
              group-hover:shadow-md
            `}>
              {isPacked ? (
                <CheckCircleIconSolid className={`h-3 w-3 transition-transform duration-300 ${isAnimating ? 'animate-pulse' : ''}`} />
              ) : (
                <ArchiveBoxIcon className="h-3 w-3 transition-transform duration-300 group-hover:scale-110" />
              )}
              <span className="transition-all duration-300">
                {isPacked ? 'Packed ✓' : 'Unpacked'}
              </span>
            </span>
            
            {/* Priority indicator badge */}
            {priority !== 'medium' && (
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full font-bold border
                ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}
                ${priority === 'high' ? priorityColors.pulse || '' : ''}
              `}>
                {priority === 'high' ? '!' : priority === 'low' ? '~' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleClick();
            }}
            className={`
              p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
              ${isPacked 
                ? `${colors.text.muted} hover:${colors.text.secondary} hover:${colors.bg.active}` 
                : `${colors.success.text} hover:${colors.success.text} hover:${colors.success.bg}`
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
            title={isPacked ? 'Mark as unpacked' : 'Mark as packed'}
          >
            {isPacked ? (
              <XCircleIcon className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'animate-pulse' : ''}`} />
            ) : (
              <CheckCircleIcon className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(belonging);
            }}
            className={`
              p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
              ${colors.text.muted} hover:${colors.text.secondary} hover:${colors.bg.active}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
            title="Edit item"
          >
            <PencilIcon className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className={`
              p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
              ${colors.text.muted} hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            `}
            title="Delete item"
          >
            <TrashIcon className="h-5 w-5 transition-all duration-300 hover:scale-110 hover:rotate-12" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BelongingItem;
