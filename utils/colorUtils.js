// utils/colorUtils.js - 색상 관련 유틸리티 함수들

export const getAccentColorClasses = (color) => {
  const colorMap = {
    gray: { text: 'text-gray-400', bg: 'bg-gray-500', ring: 'ring-gray-500' },
    white: { text: 'text-white', bg: 'bg-white', ring: 'ring-white' },
    green: { text: 'text-green-400', bg: 'bg-green-500', ring: 'ring-green-500' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500' }
  };
  return colorMap[color] || colorMap.gray;
};

// 🆕 이미지 경로 함수 추가
export const getTierImage = (stepId) => {
  const imageMap = {
    'virgen': '/images/character/virgen.png',
    'sizzlin-noob': '/images/character/sizzlin-noob.png',
    'flipstarter': '/images/character/flipstarter.png',
    'flame-juggler': '/images/character/flame-juggler.png',
    'grilluminati': '/images/character/grilluminati.png',
    'stake-wizard': '/images/character/stake-wizard.png',
    'heavy-eater': '/images/character/heavy-eater.png',
    'genesis-og': '/images/character/genesis-og.png'
  };
  return imageMap[stepId] || '/images/character/default.png';
};

// 기존 이모지 함수 (백업용)
export const getTierEmoji = (stepId) => {
  const emojiMap = {
    'virgen': '🐸',
    'sizzlin-noob': '🆕',
    'flipstarter': '🔁',
    'flame-juggler': '🔥',
    'grilluminati': '🧠',
    'stake-wizard': '🧙‍♂️',
    'heavy-eater': '🥩',
    'genesis-og': '🌌'
  };
  return emojiMap[stepId] || '❓';
};