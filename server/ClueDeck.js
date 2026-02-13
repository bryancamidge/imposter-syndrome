const CLUE_LISTS = {
  general: [
    // Nature
    'forest', 'ocean', 'river', 'sky', 'storm', 'thunder', 'rainbow', 'sunrise',
    'moonlight', 'shadow', 'fire', 'ice', 'stone', 'leaf', 'flower', 'seed',
    'root', 'branch', 'cloud', 'wave', 'wind', 'snow', 'rain', 'dust',
    // Colors & Senses
    'golden', 'crimson', 'silver', 'dark', 'bright', 'loud', 'quiet', 'sweet',
    'bitter', 'sharp', 'smooth', 'rough', 'warm', 'cold', 'soft', 'heavy',
    'light', 'deep', 'tall', 'tiny', 'giant', 'ancient', 'wild', 'gentle',
    // Actions & Movement
    'jump', 'spin', 'crash', 'fly', 'crawl', 'hide', 'chase', 'escape',
    'build', 'break', 'grow', 'shrink', 'shine', 'fade', 'burn', 'freeze',
    'splash', 'whisper', 'shout', 'dance', 'fight', 'sleep', 'hunt', 'guard',
    // Objects & Things
    'crown', 'shield', 'sword', 'rope', 'chain', 'wheel', 'mirror', 'mask',
    'flag', 'bell', 'cage', 'key', 'lock', 'map', 'trap', 'bridge',
    'tower', 'wall', 'gate', 'path', 'ladder', 'net', 'arrow', 'target',
    // People & Creatures
    'king', 'queen', 'warrior', 'thief', 'ghost', 'dragon', 'fairy', 'monster',
    'dwarf', 'angel', 'demon', 'hero', 'villain', 'alien', 'robot',
    'hunter', 'sailor', 'farmer', 'soldier', 'merchant', 'prince', 'witch',
    // Time & Space
    'midnight', 'dawn', 'dusk', 'forever', 'instant', 'future', 'past',
    'north', 'south', 'east', 'west', 'above', 'below', 'inside', 'outside',
    'center', 'edge', 'corner', 'surface', 'bottom', 'peak', 'horizon', 'orbit',
    // Food & Drink
    'honey', 'spice', 'sugar', 'salt', 'pepper', 'juice', 'cream', 'bread',
    'fruit', 'meat', 'cheese', 'soup', 'stew', 'feast', 'crumb', 'slice',
    // Materials & Textures
    'crystal', 'velvet', 'steel', 'silk', 'leather', 'marble', 'glass', 'wood',
    'iron', 'copper', 'pearl', 'ruby', 'emerald', 'sand', 'clay', 'wax',
    // Miscellaneous
    'treasure', 'poison', 'medicine', 'weapon', 'armor', 'spell', 'curse', 'blessing',
    'signal', 'warning', 'symbol', 'pattern', 'rhythm', 'melody', 'harmony', 'noise',
    'spark', 'flame', 'smoke', 'ash', 'mist', 'fog', 'steam',
  ],

  fantasy: [
    'dragon', 'wizard', 'potion', 'dungeon', 'throne', 'enchanted', 'quest', 'rune',
    'goblin', 'elf', 'orc', 'dwarf', 'knight', 'sorcerer', 'castle', 'kingdom',
    'magic', 'scroll', 'wand', 'crystal', 'amulet', 'curse', 'blessing', 'prophecy',
    'dragon', 'phoenix', 'unicorn', 'griffin', 'troll', 'vampire', 'werewolf', 'fairy',
    'sword', 'shield', 'armor', 'bow', 'staff', 'dagger', 'helm', 'cloak',
    'forest', 'cavern', 'tower', 'bridge', 'gate', 'tomb', 'shrine', 'altar',
    'gold', 'gem', 'treasure', 'crown', 'ring', 'chalice', 'mirror', 'orb',
    'shadow', 'flame', 'frost', 'storm', 'lightning', 'darkness', 'dawn', 'moonlight',
    'ancient', 'forbidden', 'legendary', 'mystical', 'cursed', 'sacred', 'fallen', 'eternal',
    'summon', 'banish', 'transform', 'heal', 'destroy', 'enchant', 'forge', 'awaken',
    'demon', 'spirit', 'ghost', 'wraith', 'golem', 'chimera', 'hydra', 'kraken',
    'tavern', 'market', 'arena', 'prison', 'library', 'forge', 'harbor', 'ruins',
  ],

  everyday: [
    'kitchen', 'bedroom', 'bathroom', 'garden', 'garage', 'office', 'school', 'store',
    'phone', 'computer', 'television', 'radio', 'camera', 'clock', 'lamp', 'chair',
    'breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'water', 'milk', 'tea',
    'car', 'bus', 'train', 'bicycle', 'walk', 'drive', 'park', 'traffic',
    'morning', 'afternoon', 'evening', 'night', 'weekend', 'holiday', 'birthday', 'meeting',
    'family', 'friend', 'neighbor', 'teacher', 'doctor', 'boss', 'child', 'parent',
    'money', 'work', 'home', 'shopping', 'cooking', 'cleaning', 'sleeping', 'reading',
    'happy', 'tired', 'busy', 'hungry', 'late', 'early', 'quick', 'slow',
    'shirt', 'shoes', 'jacket', 'hat', 'bag', 'wallet', 'glasses', 'umbrella',
    'door', 'window', 'stairs', 'floor', 'roof', 'fence', 'sidewalk', 'street',
    'mail', 'package', 'bill', 'receipt', 'ticket', 'schedule', 'list', 'note',
    'pet', 'plant', 'weather', 'rain', 'sunshine', 'snow', 'wind', 'cloud',
  ],

  science: [
    'atom', 'molecule', 'cell', 'gene', 'protein', 'virus', 'bacteria', 'enzyme',
    'gravity', 'orbit', 'planet', 'star', 'galaxy', 'comet', 'asteroid', 'nebula',
    'laser', 'radar', 'signal', 'frequency', 'wavelength', 'spectrum', 'particle', 'quantum',
    'volcano', 'earthquake', 'glacier', 'fossil', 'mineral', 'crystal', 'magnet', 'current',
    'experiment', 'theory', 'hypothesis', 'data', 'formula', 'equation', 'variable', 'constant',
    'oxygen', 'carbon', 'hydrogen', 'nitrogen', 'iron', 'copper', 'gold', 'silver',
    'telescope', 'microscope', 'satellite', 'rocket', 'circuit', 'battery', 'engine', 'reactor',
    'evolution', 'mutation', 'adaptation', 'extinction', 'ecosystem', 'habitat', 'species', 'predator',
    'temperature', 'pressure', 'density', 'energy', 'force', 'mass', 'velocity', 'friction',
    'brain', 'nerve', 'muscle', 'bone', 'blood', 'heart', 'lung', 'skin',
    'climate', 'ocean', 'atmosphere', 'radiation', 'electric', 'magnetic', 'thermal', 'nuclear',
    'robot', 'algorithm', 'network', 'code', 'digital', 'binary', 'sensor', 'processor',
  ],

  emotional: [
    'joy', 'sorrow', 'anger', 'fear', 'love', 'hate', 'hope', 'despair',
    'courage', 'doubt', 'pride', 'shame', 'guilt', 'envy', 'trust', 'betrayal',
    'peace', 'chaos', 'freedom', 'trapped', 'lonely', 'together', 'lost', 'found',
    'dream', 'nightmare', 'memory', 'forgotten', 'secret', 'truth', 'lie', 'promise',
    'gentle', 'fierce', 'calm', 'restless', 'patient', 'anxious', 'confident', 'fragile',
    'warm', 'cold', 'bright', 'dark', 'silent', 'loud', 'empty', 'full',
    'beginning', 'ending', 'forever', 'moment', 'yesterday', 'tomorrow', 'journey', 'arrival',
    'heart', 'soul', 'spirit', 'mind', 'voice', 'touch', 'sight', 'whisper',
    'comfort', 'pain', 'healing', 'wound', 'strength', 'weakness', 'growth', 'decay',
    'wonder', 'boredom', 'surprise', 'shock', 'relief', 'tension', 'passion', 'apathy',
    'belonging', 'exile', 'shelter', 'storm', 'sunrise', 'sunset', 'shadow', 'glow',
    'innocent', 'wise', 'wild', 'tame', 'broken', 'whole', 'sacred', 'mundane',
  ],

  adjectives: [
    // Size & Shape
    'tiny', 'enormous', 'round', 'flat', 'narrow', 'wide', 'tall', 'short',
    // Temperature & Texture
    'freezing', 'boiling', 'smooth', 'rough', 'sticky', 'slippery', 'fuzzy', 'crisp',
    // Appearance
    'beautiful', 'ugly', 'shiny', 'dull', 'colorful', 'pale', 'transparent', 'opaque',
    // Personality
    'clever', 'foolish', 'brave', 'cowardly', 'generous', 'greedy', 'honest', 'sneaky',
    // Age & Time
    'ancient', 'modern', 'fresh', 'stale', 'young', 'old', 'new', 'worn',
    // Intensity
    'fierce', 'mild', 'extreme', 'subtle', 'massive', 'faint', 'powerful', 'weak',
    // Mood
    'cheerful', 'gloomy', 'calm', 'frantic', 'peaceful', 'hostile', 'playful', 'serious',
    // Quality
    'perfect', 'flawed', 'rare', 'common', 'genuine', 'fake', 'valuable', 'worthless',
    // Physical
    'heavy', 'light', 'thick', 'thin', 'rigid', 'flexible', 'hollow', 'solid',
    // Sensory
    'fragrant', 'putrid', 'loud', 'silent', 'sweet', 'sour', 'bright', 'dim',
    // State
    'alive', 'dead', 'broken', 'whole', 'frozen', 'melted', 'empty', 'crowded',
    // General
    'strange', 'normal', 'secret', 'obvious', 'dangerous', 'safe', 'lucky', 'cursed',
  ],

  adverbs: [
    // Speed
    'quickly', 'slowly', 'suddenly', 'gradually', 'instantly', 'eventually', 'hastily', 'leisurely',
    // Volume & Sound
    'loudly', 'quietly', 'silently', 'softly', 'clearly', 'faintly', 'sharply', 'gently',
    // Manner
    'carefully', 'recklessly', 'gracefully', 'clumsily', 'boldly', 'timidly', 'fiercely', 'calmly',
    // Certainty
    'definitely', 'maybe', 'probably', 'possibly', 'certainly', 'barely', 'hardly', 'absolutely',
    // Frequency
    'always', 'never', 'sometimes', 'often', 'rarely', 'constantly', 'occasionally', 'repeatedly',
    // Emotion
    'happily', 'sadly', 'angrily', 'fearfully', 'proudly', 'shyly', 'eagerly', 'reluctantly',
    // Degree
    'completely', 'partially', 'extremely', 'slightly', 'totally', 'merely', 'deeply', 'nearly',
    // Direction
    'forward', 'backward', 'upward', 'downward', 'inward', 'outward', 'sideways', 'around',
    // Stealth
    'secretly', 'openly', 'invisibly', 'obviously', 'mysteriously', 'plainly', 'covertly', 'blatantly',
    // Time
    'already', 'soon', 'recently', 'formerly', 'presently', 'afterward', 'meanwhile', 'finally',
    // Quality
    'perfectly', 'poorly', 'brilliantly', 'terribly', 'beautifully', 'horribly', 'wonderfully', 'awkwardly',
    // Social
    'together', 'alone', 'publicly', 'privately', 'formally', 'casually', 'politely', 'rudely',
  ],
};

class ClueDeck {
  constructor(listName) {
    this.listName = listName || 'general';
    this.usedThisRound = new Set();
  }

  static getLists() {
    return Object.keys(CLUE_LISTS);
  }

  setList(listName) {
    if (CLUE_LISTS[listName]) {
      this.listName = listName;
      this.usedThisRound.clear();
    }
  }

  draw(count) {
    const wordList = CLUE_LISTS[this.listName] || CLUE_LISTS.general;
    const available = wordList.filter(w => !this.usedThisRound.has(w));

    if (available.length < count) {
      this.usedThisRound.clear();
      return this.draw(count);
    }

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const hand = shuffled.slice(0, count);
    hand.forEach(w => this.usedThisRound.add(w));
    return hand;
  }

  resetRound() {
    this.usedThisRound.clear();
  }
}

module.exports = ClueDeck;
