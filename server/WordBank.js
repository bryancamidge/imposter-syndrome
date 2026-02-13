const THEMES = {
  animals: [
    'elephant', 'penguin', 'octopus', 'giraffe', 'dolphin', 'parrot', 'kangaroo',
    'chameleon', 'flamingo', 'hedgehog', 'jellyfish', 'lobster', 'peacock',
    'porcupine', 'raccoon', 'seahorse', 'toucan', 'walrus', 'cheetah', 'cobra',
    'gorilla', 'hamster', 'iguana', 'jaguar', 'koala', 'leopard', 'moose',
    'narwhal', 'ostrich', 'panther', 'rabbit', 'scorpion', 'turtle', 'vulture',
  ],
  food: [
    'pizza', 'sushi', 'hamburger', 'taco', 'waffle', 'pretzel', 'pancake',
    'burrito', 'croissant', 'dumpling', 'fondue', 'guacamole', 'lasagna',
    'macaroni', 'nachos', 'omelette', 'popcorn', 'quesadilla', 'ramen',
    'sandwich', 'tiramisu', 'brownie', 'cheesecake', 'donut', 'eclair',
    'falafel', 'gumbo', 'hummus', 'kebab', 'muffin', 'noodles', 'paella',
  ],
  places: [
    'beach', 'hospital', 'library', 'airport', 'volcano', 'castle', 'museum',
    'aquarium', 'bakery', 'cathedral', 'desert', 'factory', 'glacier',
    'harbor', 'island', 'jungle', 'lighthouse', 'mountain', 'nursery',
    'observatory', 'palace', 'quarry', 'rainforest', 'stadium', 'temple',
    'university', 'vineyard', 'waterfall', 'zoo', 'canyon', 'dungeon', 'fortress',
  ],
  objects: [
    'umbrella', 'telescope', 'skateboard', 'candle', 'piano', 'hammer',
    'backpack', 'compass', 'doorbell', 'envelope', 'flashlight', 'guitar',
    'headphones', 'keyboard', 'lantern', 'microphone', 'notebook', 'parachute',
    'quilt', 'refrigerator', 'scissors', 'toothbrush', 'vacuum', 'wheelchair',
    'xylophone', 'binoculars', 'calendar', 'diamond', 'escalator', 'fountain',
  ],
  professions: [
    'astronaut', 'detective', 'plumber', 'surgeon', 'pirate', 'wizard',
    'architect', 'barista', 'carpenter', 'dentist', 'electrician', 'firefighter',
    'gardener', 'hairdresser', 'journalist', 'knight', 'librarian', 'mechanic',
    'navigator', 'optician', 'photographer', 'ranger', 'scientist', 'teacher',
    'veterinarian', 'waiter', 'zookeeper', 'blacksmith', 'comedian', 'drummer',
  ],
  activities: [
    'swimming', 'painting', 'camping', 'dancing', 'cooking', 'skiing',
    'bowling', 'climbing', 'diving', 'fencing', 'gardening', 'hiking',
    'juggling', 'kayaking', 'meditation', 'origami', 'photography',
    'quilting', 'running', 'skateboarding', 'tennis', 'unicycling',
    'volleyball', 'wrestling', 'yoga', 'archery', 'baking', 'cycling',
    'drawing', 'fishing',
  ],
};

class WordBank {
  constructor() {
    this.usedWords = new Set();
  }

  getThemes() {
    return Object.keys(THEMES);
  }

  pickWords(theme, count) {
    const wordList = THEMES[theme];
    if (!wordList) throw new Error(`Unknown theme: ${theme}`);

    const available = wordList.filter(w => !this.usedWords.has(w));
    if (available.length < count) {
      // Reset if not enough words
      this.usedWords.clear();
      return this.pickWords(theme, count);
    }

    // Shuffle and pick
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    picked.forEach(w => this.usedWords.add(w));
    return picked;
  }

  reset() {
    this.usedWords.clear();
  }
}

module.exports = WordBank;
