const THEMES = {
  animals: [
    'elephant', 'penguin', 'octopus', 'giraffe', 'dolphin', 'parrot', 'kangaroo',
    'chameleon', 'flamingo', 'hedgehog', 'jellyfish', 'lobster', 'peacock',
    'porcupine', 'raccoon', 'seahorse', 'toucan', 'walrus', 'cheetah', 'cobra',
    'gorilla', 'hamster', 'iguana', 'jaguar', 'koala', 'leopard', 'moose',
    'narwhal', 'ostrich', 'rabbit', 'scorpion', 'turtle', 'vulture',
    'armadillo', 'bat', 'beaver', 'buffalo', 'camel', 'coyote', 'crab',
    'crocodile', 'eagle', 'falcon', 'fox', 'frog', 'hummingbird', 'hyena',
    'mantis', 'orca', 'pelican', 'piranha', 'salamander', 'sloth', 'stingray',
    'swan', 'woodpecker', 'yak',
  ],
  food: [
    'pizza', 'sushi', 'hamburger', 'taco', 'waffle', 'pretzel', 'pancake',
    'burrito', 'croissant', 'dumpling', 'fondue', 'guacamole', 'lasagna',
    'nachos', 'omelette', 'popcorn', 'quesadilla', 'ramen',
    'sandwich', 'tiramisu', 'brownie', 'cheesecake', 'donut', 'eclair',
    'falafel', 'gumbo', 'hummus', 'kebab', 'muffin', 'paella',
    'bagel', 'biscuit', 'calzone', 'caviar', 'churro', 'clam chowder',
    'cornbread', 'ceviche', 'empanada', 'granola', 'jambalaya', 'kimchi',
    'lobster roll', 'meatball', 'pho', 'pierogi', 'risotto', 'samosa',
    'scone', 'souffle', 'tempura', 'wonton',
  ],
  places: [
    'beach', 'hospital', 'library', 'airport', 'volcano', 'castle', 'museum',
    'aquarium', 'bakery', 'cathedral', 'desert', 'factory', 'glacier',
    'harbor', 'island', 'jungle', 'lighthouse', 'mountain', 'nursery',
    'observatory', 'palace', 'quarry', 'stadium', 'temple',
    'university', 'vineyard', 'waterfall', 'zoo', 'canyon', 'dungeon',
    'arcade', 'attic', 'bazaar', 'boardwalk', 'cave', 'cemetery',
    'circus', 'courtroom', 'diner', 'dock', 'greenhouse', 'igloo',
    'laundromat', 'marketplace', 'oasis', 'pharmacy', 'pier', 'planetarium',
    'prison', 'saloon', 'sawmill', 'shipwreck', 'subway', 'swamp',
    'theater', 'treehouse', 'warehouse', 'windmill',
  ],
  objects: [
    'umbrella', 'telescope', 'skateboard', 'candle', 'piano', 'hammer',
    'backpack', 'compass', 'doorbell', 'envelope', 'flashlight', 'guitar',
    'headphones', 'keyboard', 'lantern', 'microphone', 'notebook', 'parachute',
    'quilt', 'refrigerator', 'scissors', 'toothbrush', 'vacuum', 'wheelchair',
    'xylophone', 'binoculars', 'calendar', 'diamond', 'escalator', 'fountain',
    'anchor', 'balloon', 'boomerang', 'catapult', 'chandelier', 'corkscrew',
    'dreamcatcher', 'hourglass', 'lasso', 'megaphone', 'pendulum', 'periscope',
    'pinwheel', 'propeller', 'slingshot', 'snowglobe', 'stethoscope',
    'sundial', 'trampoline', 'treadmill', 'tripod', 'typewriter',
  ],
  professions: [
    'astronaut', 'detective', 'plumber', 'surgeon', 'pirate', 'wizard',
    'architect', 'barista', 'carpenter', 'dentist', 'electrician', 'firefighter',
    'gardener', 'hairdresser', 'journalist', 'knight', 'librarian', 'mechanic',
    'navigator', 'optician', 'photographer', 'ranger', 'scientist', 'teacher',
    'veterinarian', 'waiter', 'zookeeper', 'blacksmith', 'comedian', 'drummer',
    'accountant', 'auctioneer', 'beekeeper', 'butcher', 'cashier', 'chef',
    'choreographer', 'diplomat', 'diver', 'florist', 'geologist', 'jeweler',
    'lifeguard', 'locksmith', 'magician', 'monk', 'paleontologist', 'pharmacist',
    'pilot', 'puppeteer', 'shepherd', 'tattoo artist', 'translator', 'umpire',
  ],
  activities: [
    'swimming', 'painting', 'camping', 'dancing', 'cooking', 'skiing',
    'bowling', 'climbing', 'diving', 'fencing', 'gardening', 'hiking',
    'juggling', 'kayaking', 'meditation', 'origami', 'photography',
    'quilting', 'running', 'skateboarding', 'tennis', 'unicycling',
    'volleyball', 'wrestling', 'yoga', 'archery', 'baking', 'cycling',
    'fishing', 'beekeeping', 'birdwatching', 'blacksmithing', 'calligraphy',
    'canoeing', 'ceramics', 'chess', 'composting', 'embroidery',
    'geocaching', 'glassblowing', 'horseback riding', 'ice skating',
    'karate', 'kite flying', 'knitting', 'parkour', 'pottery',
    'sledding', 'stargazing', 'surfing', 'tattooing', 'woodworking',
  ],
  movies: [
    'The Shawshank Redemption', 'The Godfather', '12 Angry Men',
    "Schindler's List", 'The Lord of the Rings',
    'Pulp Fiction', 'The Good, The Bad, and The Ugly', 'Forrest Gump', 'Fight Club',
    'Inception', 'The Matrix', 'Goodfellas', 'Interstellar',
    "One Flew Over the Cuckoo's Nest", 'Se7en', "It's a Wonderful Life",
    'The Silence of the Lambs', 'Saving Private Ryan', 'The Green Mile', 'Star Wars',
    'Back to the Future', 'Spirited Away', 'The Pianist', 'Gladiator', 'Psycho',
    'The Lion King', 'The Departed', 'The Prestige', 'Casablanca',
    'The Usual Suspects', 'Alien', 'Django Unchained', 'Rear Window',
    'Apocalypse Now', 'WALL-E', 'Memento', 'Dune', 'Raiders of the Lost Ark',
    'Avengers', 'Spider-Man: Into the Spider-Verse', 'The Shining',
    'Inglorious Basterds', 'Good Will Hunting', 'Coco', 'Toy Story', 'Braveheart',
    'American Beauty', 'Joker', 'Requiem for a Dream',
    'Eternal Sunshine of the Spotless Mind', '2001: A Space Odyssey', 'Reservoir Dogs',
    'Heat', 'Scarface', 'Up', 'Full Metal Jacket', 'Die Hard', 'A Clockwork Orange',
    'The Wolf of Wall Street', 'Oppenheimer', 'The Truman Show',
    'Shutter Island', 'Batman Begins', 'Taxi Driver', 'Jurassic Park',
    'There Will Be Blood', 'The Sixth Sense', 'Casino', 'No Country for Old Men',
    'The Thing', 'Top Gun', 'Kill Bill: Vol. 1', 'A Beautiful Mind', 'Finding Nemo',
    'Monty Python and the Holy Grail',
    'V for Vendetta', 'Catch Me If You Can', 'Inside Out', 'Trainspotting',
    'Harry Potter', 'Dead Poets Society', 'Fargo', 'Million Dollar Baby',
    'Mad Max: Fury Road', 'Gran Torino', 'The Grand Budapest Hotel',
    '12 Years a Slave', 'Ratatouille', 'Blade Runner', 'How to Train Your Dragon',
    'Gone Girl', 'Monsters, Inc.', 'Jaws', 'Rocky',
    'Pirates of the Caribbean', 'The Terminator',
    'The Big Lebowski', 'The Incredibles',
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
