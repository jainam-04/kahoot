import {
  Atom, Rocket, HeartPulse, Compass, Landmark, Film,
  Code, Terminal, Layers, Calculator, Shapes, Hash
} from 'lucide-react';

export const ALL_CURATED_QUIZZES = [
  // ==========================================
  // SCIENCE CATEGORY (3 Quizzes x 10 Questions)
  // ==========================================
  {
    _id: 'preset_sci_01',
    isPreset: true,
    title: 'General Science & Nature Challenge',
    description: 'Explore the foundations of chemistry, physics, and life science with 10 essential questions.',
    category: 'Science',
    difficulty: 'Medium',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-emerald-500 to-teal-600',
    icon: Atom,
    questions: [
      { questionText: 'What is the chemical symbol for Gold?', options: ['Gd', 'Au', 'Ag', 'Go'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What powerhouse organelle generates ATP in eukaryotic cells?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What gas do plants primarily absorb from the atmosphere for photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the approximate speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '3,000 km/s', '1,000,000 km/s'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the most abundant gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the pH value of pure distilled water at 25°C?', options: ['5', '7', '9', '0'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which particle in an atom carries a negative electrical charge?', options: ['Proton', 'Neutron', 'Electron', 'Positron'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Sound travels fastest through which state of matter?', options: ['Solid', 'Liquid', 'Gas', 'Vacuum'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Which law states that energy cannot be created or destroyed, only transformed?', options: ['First Law of Thermodynamics', 'Second Law of Motion', 'Law of Gravitation', 'Boyle\'s Law'], correctAnswer: 0, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_sci_02',
    isPreset: true,
    title: 'Space Exploration & Solar System',
    description: 'Journey through planets, galaxies, black holes, and NASA missions in this 10-question space quiz.',
    category: 'Science',
    difficulty: 'Hard',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-cyan-500 to-blue-600',
    icon: Rocket,
    questions: [
      { questionText: 'Which planet has the most confirmed moons in our Solar System?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the boundary around a black hole where nothing can escape called?', options: ['Photon Sphere', 'Accretion Disk', 'Event Horizon', 'Singularity'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which spacecraft was the first human-made object to enter interstellar space?', options: ['Voyager 1', 'Pioneer 10', 'New Horizons', 'Voyager 2'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What type of celestial body is Ceres, located in the asteroid belt?', options: ['Comet', 'Dwarf Planet', 'Meteoroid', 'Gas Giant'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the hottest planet in our solar system?', options: ['Mercury', 'Venus', 'Mars', 'Jupiter'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'How long does sunlight take to reach Earth on average?', options: ['8 minutes and 20 seconds', '1 minute', '30 seconds', '15 minutes'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the largest volcano in the solar system, located on Mars?', options: ['Mauna Kea', 'Mount Everest', 'Olympus Mons', 'Valles Marineris'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the primary element powering nuclear fusion in the Sun?', options: ['Helium', 'Hydrogen', 'Carbon', 'Oxygen'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which space telescope succeeded Hubble to observe infrared wavelengths?', options: ['James Webb Space Telescope', 'Spitzer', 'Kepler', 'Chandra'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Which major galaxy is closest to our Milky Way?', options: ['Triangulum', 'Andromeda', 'Centaurus A', 'Whirlpool'], correctAnswer: 1, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_sci_03',
    isPreset: true,
    title: 'Human Biology & Health Science',
    description: 'Test your understanding of the human anatomy, body systems, organs, and medical facts.',
    category: 'Science',
    difficulty: 'Easy',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-teal-500 to-emerald-600',
    icon: HeartPulse,
    questions: [
      { questionText: 'Which organ is responsible for pumping blood throughout the human body?', options: ['Lungs', 'Brain', 'Heart', 'Liver'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the largest organ in the human body by surface area?', options: ['Liver', 'Skin', 'Brain', 'Large Intestine'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'How many bones are present in an adult human skeleton?', options: ['186', '206', '256', '300'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which blood cells are primarily responsible for fighting infections?', options: ['Red Blood Cells', 'Platelets', 'White Blood Cells', 'Plasma'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which vitamin is synthesized by the human body when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correctAnswer: 3, timeLimit: 20 },
      { questionText: 'What is the normal resting human body temperature in Celsius?', options: ['35°C', '37°C', '39°C', '42°C'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which part of the human brain controls balance and motor coordination?', options: ['Cerebrum', 'Cerebellum', 'Brainstem', 'Hypothalamus'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the universal recipient blood type?', options: ['O Negative', 'AB Positive', 'A Positive', 'B Negative'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which organ produces bile to help break down fats during digestion?', options: ['Stomach', 'Pancreas', 'Liver', 'Gallbladder'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What molecules serve as the fundamental building blocks of proteins?', options: ['Fatty Acids', 'Amino Acids', 'Nucleotides', 'Glucose'], correctAnswer: 1, timeLimit: 20 }
    ]
  },

  // ==================================================
  // GENERAL KNOWLEDGE CATEGORY (3 Quizzes x 10 Qs)
  // ==================================================
  {
    _id: 'preset_gk_01',
    isPreset: true,
    title: 'World Geography & Famous Landmarks',
    description: 'Discover world capitals, mountain ranges, oceans, and sovereign borders across all continents.',
    category: 'General Knowledge',
    difficulty: 'Easy',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-blue-500 to-indigo-600',
    icon: Compass,
    questions: [
      { questionText: 'What is the official capital city of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which is the longest river in the world by continuous length?', options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which country has the highest number of natural lakes in the world?', options: ['Canada', 'Russia', 'USA', 'Finland'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Mount Everest is situated in which mountain range?', options: ['Andes', 'Alps', 'Himalayas', 'Rockies'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which is the smallest independent sovereign state in the world by area?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which desert is the largest hot desert in the world?', options: ['Gobi Desert', 'Sahara Desert', 'Kalahari Desert', 'Arabian Desert'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the capital city of Brazil?', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'In which ocean is the Mariana Trench, the deepest point on Earth, located?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which African nation was historically known as Abyssinia?', options: ['Ethiopia', 'Egypt', 'Nigeria', 'Kenya'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Which famous strait separates the European continent from Africa?', options: ['Strait of Malacca', 'Strait of Gibraltar', 'Bering Strait', 'Bosphorus Strait'], correctAnswer: 1, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_gk_02',
    isPreset: true,
    title: 'World History & Famous Eras',
    description: 'Test your knowledge on ancient civilizations, global revolutions, and pivotal moments in human history.',
    category: 'General Knowledge',
    difficulty: 'Medium',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-amber-500 to-red-600',
    icon: Landmark,
    questions: [
      { questionText: 'In which year did the Titanic sink on its maiden voyage?', options: ['1912', '1905', '1920', '1898'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Who served as the very first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'The ancient citadel of Machu Picchu was built by which civilization?', options: ['Mayan', 'Aztec', 'Inca', 'Olmec'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'In which year did World War II officially end?', options: ['1943', '1945', '1948', '1950'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Who composed the ancient Greek epic poems the Iliad and Odyssey?', options: ['Socrates', 'Plato', 'Homer', 'Aristotle'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which historic barrier fell in November 1989, ending the division of Germany?', options: ['Great Wall of China', 'Berlin Wall', 'Hadrian\'s Wall', 'Western Wall'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which military leader crowned himself Emperor of France in 1804?', options: ['Louis XIV', 'Napoleon Bonaparte', 'Charles de Gaulle', 'Robespierre'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which ancient wonder of the world stood tall at the port of Alexandria, Egypt?', options: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Colossus of Rhodes', 'Temple of Artemis'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Who was the first human being to step onto the surface of the Moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Michael Collins'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'The Magna Carta was originally signed in England in which year?', options: ['1215', '1066', '1492', '1776'], correctAnswer: 0, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_gk_03',
    isPreset: true,
    title: 'Global Pop Culture & Cinema Trivia',
    description: 'A fun and engaging trivia quiz covering iconic movies, award-winning music, games, and entertainment.',
    category: 'General Knowledge',
    difficulty: 'Easy',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-pink-500 to-rose-600',
    icon: Film,
    questions: [
      { questionText: 'Which movie won the first-ever Academy Award for Best Animated Feature in 2002?', options: ['Toy Story', 'Shrek', 'Monsters, Inc.', 'Finding Nemo'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which legendary artist is universally recognized as the "King of Pop"?', options: ['Prince', 'Michael Jackson', 'Elvis Presley', 'Freddie Mercury'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'In the Harry Potter universe, what animal form is Harry\'s Patronus?', options: ['Stag', 'Otter', 'Phoenix', 'Wolf'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the highest-grossing box office film of all time worldwide?', options: ['Titanic', 'Avengers: Endgame', 'Avatar', 'Star Wars: The Force Awakens'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which iconic game franchise features the characters Mario, Luigi, and Bowser?', options: ['Super Mario', 'Sonic the Hedgehog', 'The Legend of Zelda', 'Donkey Kong'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the name of the fictional continent where Game of Thrones primarily unfolds?', options: ['Middle-earth', 'Westeros', 'Narnia', 'Tamriel'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which actor portrayed Tony Stark / Iron Man across the Marvel Cinematic Universe?', options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which music video was the first ever to surpass 1 Billion views on YouTube?', options: ['Despacito', 'Gangnam Style', 'Baby', 'Shape of You'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'In The Lord of the Rings, what must be cast into Mount Doom to defeat Sauron?', options: ['The Arkenstone', 'The One Ring', 'The Elder Wand', 'The Silmaril'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which popular 90s sitcom centers on Rachel, Monica, Phoebe, Joey, Chandler, and Ross?', options: ['Seinfeld', 'How I Met Your Mother', 'Friends', 'The Big Bang Theory'], correctAnswer: 2, timeLimit: 20 }
    ]
  },

  // ==============================================
  // PROGRAMMING CATEGORY (3 Quizzes x 10 Questions)
  // ==============================================
  {
    _id: 'preset_prog_01',
    isPreset: true,
    title: 'JavaScript & Modern Web Mastery',
    description: 'Test your knowledge on ES6+, React, DOM, asynchronous event loops, and web standards.',
    category: 'Programming',
    difficulty: 'Medium',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-purple-500 to-indigo-600',
    icon: Code,
    questions: [
      { questionText: 'Which keyword in JavaScript declares a block-scoped reassignable variable?', options: ['var', 'let', 'const', 'global'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the result of evaluating typeof null in JavaScript?', options: ['null', 'undefined', 'object', 'boolean'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'Which React Hook is primarily used for handling side effects and data subscriptions?', options: ['useState', 'useContext', 'useEffect', 'useMemo'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What does DOM stand for in frontend engineering?', options: ['Document Object Model', 'Data Oriented Module', 'Digital Optimum Management', 'Document Order Method'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'Which HTTP status code signifies "Unauthorized" client access?', options: ['400', '401', '403', '404'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which built-in JS array method appends one or more elements to the end?', options: ['push()', 'pop()', 'unshift()', 'shift()'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What does Promise.all() do when supplied with an iterable of promises?', options: ['Executes them strictly in sequence', 'Resolves when all promises resolve, or rejects if any fail', 'Rejects if any promise succeeds', 'Silently suppresses rejected promises'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'In CSS Flexbox, which property aligns flex items along the main axis?', options: ['align-items', 'justify-content', 'flex-direction', 'align-content'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which data format is most standard for client-server API payloads?', options: ['YAML', 'JSON', 'XML', 'CSV'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which JS comparison operator checks equality without implicit type coercion?', options: ['==', '===', '=', '!='], correctAnswer: 1, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_prog_02',
    isPreset: true,
    title: 'Python Programming & Data Structures',
    description: 'Challenge your skills on Python syntax, dictionaries, lists, functions, and standard libraries.',
    category: 'Programming',
    difficulty: 'Easy',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-indigo-500 to-violet-600',
    icon: Terminal,
    questions: [
      { questionText: 'Which of the following built-in collection types is immutable in Python?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correctAnswer: 3, timeLimit: 20 },
      { questionText: 'What standard function returns the number of elements in a Python container?', options: ['count()', 'size()', 'len()', 'length()'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'How is a standard function declared in Python?', options: ['def myFunction():', 'function myFunction():', 'create myFunction():', 'fn myFunction():'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the arithmetic result of 3 ** 2 in Python?', options: ['6', '9', '8', '5'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which keyword is paired with "try" to catch exceptions in Python?', options: ['catch', 'except', 'finally', 'rescue'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What underlying data structure powers fast key lookup in Python dicts?', options: ['Linked List', 'Hash Table', 'Binary Search Tree', 'Stack'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the boolean evaluation of an empty list: bool([]) ?', options: ['True', 'False', 'None', 'SyntaxError'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which library is the industry standard for multidimensional numerical arrays in Python?', options: ['NumPy', 'Pandas', 'Flask', 'Django'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the purpose of the __init__ method in a Python class?', options: ['Class Destructor', 'Object Initializer / Constructor', 'Static Method decorator', 'Memory Garbage Collector'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which string method converts all characters in a string to lower case in Python?', options: ['toLowerCase()', 'lower()', 'casefold()', 'down()'], correctAnswer: 1, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_prog_03',
    isPreset: true,
    title: 'Computer Science & Backend Systems',
    description: 'Deep dive into algorithmic complexity, databases, network protocols, and software design.',
    category: 'Programming',
    difficulty: 'Hard',
    questionsCount: 10,
    timeLimit: 25,
    gradient: 'from-violet-600 to-pink-600',
    icon: Layers,
    questions: [
      { questionText: 'What is the average search time complexity of a balanced Binary Search Tree?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'Which HTTP method is designed to be idempotent and overwrite a full resource?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'In relational database systems, what does the ACID acronym stand for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Concurrency, Integrity, Delivery', 'Access, Control, Identity, Distribution', 'Async, Cache, Index, Database'], correctAnswer: 0, timeLimit: 25 },
      { questionText: 'Which data structure operates on a Last-In, First-Out (LIFO) order?', options: ['Queue', 'Stack', 'Array', 'Binary Heap'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'Which protocol maintains a persistent full-duplex TCP channel for real-time messages?', options: ['HTTP/1.1', 'WebSocket', 'FTP', 'SMTP'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'What does SQL stand for in data management?', options: ['Standard Query List', 'Structured Query Language', 'Sequential Question Logic', 'System Quantitative Language'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'Which sorting algorithm guarantees an O(n log n) worst-case time complexity?', options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Insertion Sort'], correctAnswer: 2, timeLimit: 25 },
      { questionText: 'In containerization (Docker), what is a container image?', options: ['A running container process', 'A lightweight, immutable executable standalone package template', 'A virtual machine hypervisor', 'A cloud load balancer'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'What is the standard default port number for encrypted HTTPS traffic?', options: ['80', '443', '8080', '22'], correctAnswer: 1, timeLimit: 25 },
      { questionText: 'Which design pattern guarantees that a class has only one single global instance?', options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Adapter Pattern'], correctAnswer: 1, timeLimit: 25 }
    ]
  },

  // ===============================================
  // MATHEMATICS CATEGORY (3 Quizzes x 10 Questions)
  // ===============================================
  {
    _id: 'preset_math_01',
    isPreset: true,
    title: 'Mental Arithmetic & Quick Math Blitz',
    description: 'Boost numerical agility with fast mental math, percentage shortcuts, and order of operations.',
    category: 'Mathematics',
    difficulty: 'Easy',
    questionsCount: 10,
    timeLimit: 15,
    gradient: 'from-amber-500 to-orange-600',
    icon: Calculator,
    questions: [
      { questionText: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctAnswer: 2, timeLimit: 15 },
      { questionText: 'What is 15% of 200?', options: ['20', '25', '30', '35'], correctAnswer: 2, timeLimit: 15 },
      { questionText: 'Solve: 7 × 8 - 14 = ?', options: ['42', '56', '44', '48'], correctAnswer: 0, timeLimit: 15 },
      { questionText: 'What is the value of 2 raised to the 6th power (2^6)?', options: ['32', '64', '128', '16'], correctAnswer: 1, timeLimit: 15 },
      { questionText: 'What is the fraction 3/4 expressed as a decimal?', options: ['0.25', '0.50', '0.75', '0.80'], correctAnswer: 2, timeLimit: 15 },
      { questionText: 'What is the mathematical product of (-6) × (-7)?', options: ['-42', '42', '-13', '13'], correctAnswer: 1, timeLimit: 15 },
      { questionText: 'If a car travels at a constant 60 km/h, how far does it travel in 2.5 hours?', options: ['120 km', '140 km', '150 km', '180 km'], correctAnswer: 2, timeLimit: 15 },
      { questionText: 'What is the Greatest Common Divisor (GCD) of 24 and 36?', options: ['4', '6', '12', '18'], correctAnswer: 2, timeLimit: 15 },
      { questionText: 'Calculate: (250 ÷ 5) × 3 = ?', options: ['150', '100', '75', '200'], correctAnswer: 0, timeLimit: 15 },
      { questionText: 'Solve the mental sum: 99 + 999 = ?', options: ['1088', '1098', '1099', '1100'], correctAnswer: 1, timeLimit: 15 }
    ]
  },
  {
    _id: 'preset_math_02',
    isPreset: true,
    title: 'Geometry & Algebra Fundamentals',
    description: 'Master core formulas for triangles, circles, polygons, and linear equations with 10 questions.',
    category: 'Mathematics',
    difficulty: 'Medium',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-orange-500 to-amber-600',
    icon: Shapes,
    questions: [
      { questionText: 'What is the sum of all interior angles in any planar triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'If 3x + 9 = 24, what is the value of x?', options: ['3', '5', '7', '9'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the geometric formula for the area of a circle with radius r?', options: ['2πr', 'πr²', 'πd', '4/3 πr³'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'In a right triangle with legs of length 3 and 4, what is the length of the hypotenuse?', options: ['5', '6', '7', '8'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the geometric name for a polygon with exactly 8 sides?', options: ['Hexagon', 'Heptagon', 'Octagon', 'Nonagon'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the perimeter of a rectangle with length 10 cm and width 4 cm?', options: ['28 cm', '40 cm', '14 cm', '20 cm'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the slope (m) of the linear equation y = 4x - 7?', options: ['-7', '4', '7', '-4'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the total volume of a cube with edge length of 5 cm?', options: ['25 cm³', '75 cm³', '100 cm³', '125 cm³'], correctAnswer: 3, timeLimit: 20 },
      { questionText: 'If two angles are supplementary, what is the sum of their measures?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'Which algebraic formula finds solutions for ax² + bx + c = 0?', options: ['(-b ± √(b² - 4ac)) / 2a', '(-b ± √(b² + 4ac)) / a', '(b ± √(4ac)) / 2a', '(-b ± 2a) / 4ac'], correctAnswer: 0, timeLimit: 20 }
    ]
  },
  {
    _id: 'preset_math_03',
    isPreset: true,
    title: 'Probability, Logic & Number Puzzles',
    description: 'Engage in probability challenges, prime sequences, combinatorics, and logical reasoning.',
    category: 'Mathematics',
    difficulty: 'Hard',
    questionsCount: 10,
    timeLimit: 20,
    gradient: 'from-amber-600 to-red-600',
    icon: Hash,
    questions: [
      { questionText: 'What is the probability of rolling a number greater than 4 on a standard 6-sided die?', options: ['1/6', '1/3 (2/6)', '1/2', '2/3'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the next number in the Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, ... ?', options: ['18', '21', '24', '26'], correctAnswer: 1, timeLimit: 20 },
      { questionText: 'If you flip two independent fair coins, what is the probability of getting two heads?', options: ['1/4 (25%)', '1/2 (50%)', '3/4 (75%)', '1/3 (33%)'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the value of 5 Factorial (5!)?', options: ['20', '60', '120', '720'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'How many prime numbers exist between 1 and 20?', options: ['6', '7', '8', '9'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'A bag has 4 red balls and 6 blue balls. What is the probability of randomly drawing a red ball?', options: ['40% (2/5)', '60% (3/5)', '25%', '50%'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'If all Bloops are Razzies and all Razzies are Lizzies, are all Bloops definitely Lizzies?', options: ['Yes, always', 'No, never', 'Only sometimes', 'Cannot be determined'], correctAnswer: 0, timeLimit: 20 },
      { questionText: 'What is the next number in the arithmetic sequence: 4, 11, 18, 25, ...?', options: ['30', '31', '32', '35'], correctAnswer: 2, timeLimit: 20 },
      { questionText: 'What is the sum of the first 10 positive integers (1 + 2 + 3 + ... + 10)?', options: ['45', '50', '55', '60'], correctAnswer: 2, timeLimit: 20 }
    ]
  }
];

// Top 4 Featured Ready Quizzes (1 per main domain: Science, General Knowledge, Programming, Math)
export const FEATURED_PRESET_QUIZZES = [
  ALL_CURATED_QUIZZES[0], // Science: General Science & Nature Challenge
  ALL_CURATED_QUIZZES[3], // GK: World Geography & Famous Landmarks
  ALL_CURATED_QUIZZES[6], // Programming: JavaScript & Modern Web Mastery
  ALL_CURATED_QUIZZES[9]  // Math: Mental Arithmetic & Quick Math Blitz
];
