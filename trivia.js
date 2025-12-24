// Christmas Trivia Questions Database
const TRIVIA_QUESTIONS = [
    // Christmas Movies
    {
        category: "Christmas Movies",
        question: "In 'Home Alone', where are the McCallisters going on vacation when they leave Kevin behind?",
        answers: ["Paris", "London", "Rome", "Hawaii"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "What is the name of the main character in 'The Polar Express'?",
        answers: ["Hero Boy", "Tommy", "Billy", "Chris"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "In 'Elf', what is Buddy's favorite food combination?",
        answers: ["Spaghetti with maple syrup", "Pizza with chocolate", "Pancakes with ketchup", "Burgers with candy"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "What movie features the song 'You're a Mean One, Mr. Grinch'?",
        answers: ["How the Grinch Stole Christmas", "A Christmas Carol", "The Nightmare Before Christmas", "Frosty the Snowman"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "In 'A Christmas Story', what does Ralphie want for Christmas?",
        answers: ["A Red Ryder BB Gun", "A Train Set", "A Bicycle", "A Puppy"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "What is the highest-grossing Christmas movie of all time?",
        answers: ["Home Alone", "The Grinch (2018)", "Elf", "Frozen"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "Which actor plays six different roles in 'The Polar Express'?",
        answers: ["Tom Hanks", "Jim Carrey", "Will Ferrell", "Tim Allen"],
        correct: 0
    },
    {
        category: "Christmas Movies",
        question: "In 'Die Hard', what is the name of the building where the action takes place?",
        answers: ["Nakatomi Plaza", "Wayne Tower", "Stark Tower", "Oscorp Building"],
        correct: 0
    },

    // Christmas Music
    {
        category: "Christmas Music",
        question: "Who wrote the song 'White Christmas'?",
        answers: ["Irving Berlin", "Bing Crosby", "Frank Sinatra", "Elvis Presley"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "In 'Rudolph the Red-Nosed Reindeer', what makes Rudolph special?",
        answers: ["His glowing red nose", "He can fly faster", "He's the smallest", "He can talk"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "What Christmas song was originally written for Thanksgiving?",
        answers: ["Jingle Bells", "Silent Night", "White Christmas", "Winter Wonderland"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "Who sang 'All I Want for Christmas Is You'?",
        answers: ["Mariah Carey", "Whitney Houston", "Celine Dion", "Christina Aguilera"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "In 'The Twelve Days of Christmas', what is given on the fifth day?",
        answers: ["Five Golden Rings", "Four Calling Birds", "Six Geese a-Laying", "Three French Hens"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "What Christmas carol includes the lyrics 'Silent night, holy night'?",
        answers: ["Silent Night", "O Holy Night", "Away in a Manger", "The First Noel"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "Which rock band recorded 'Christmas (Baby Please Come Home)'?",
        answers: ["U2", "The Beatles", "The Rolling Stones", "Queen"],
        correct: 0
    },
    {
        category: "Christmas Music",
        question: "How many reindeer pull Santa's sleigh in the traditional song?",
        answers: ["Eight (Nine with Rudolph)", "Six", "Ten", "Twelve"],
        correct: 0
    },

    // Christmas Traditions
    {
        category: "Christmas Traditions",
        question: "What do people traditionally kiss under during Christmas?",
        answers: ["Mistletoe", "Holly", "Poinsettia", "Pine branches"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "In which country did the tradition of Christmas trees originate?",
        answers: ["Germany", "England", "Norway", "Sweden"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "What is traditionally hidden in a Christmas pudding for good luck?",
        answers: ["A coin", "A ring", "A key", "A button"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "What do children in the Netherlands leave out for Sinterklaas's horse?",
        answers: ["Carrots and hay", "Cookies and milk", "Apples and sugar", "Bread and water"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "In Japan, what is a popular Christmas Eve dinner tradition?",
        answers: ["KFC (Kentucky Fried Chicken)", "Sushi", "Ramen", "Pizza"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "What color are poinsettias most commonly associated with Christmas?",
        answers: ["Red", "White", "Pink", "Orange"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "In which country do people celebrate Christmas by roller skating to church?",
        answers: ["Venezuela", "Brazil", "Mexico", "Colombia"],
        correct: 0
    },
    {
        category: "Christmas Traditions",
        question: "What is Boxing Day?",
        answers: ["December 26th", "December 24th", "December 27th", "January 1st"],
        correct: 0
    },

    // Santa Claus
    {
        category: "Santa Claus",
        question: "What is the name of Santa's home?",
        answers: ["The North Pole", "The South Pole", "Lapland", "Iceland"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "How many reindeer does Santa traditionally have (not counting Rudolph)?",
        answers: ["Eight", "Nine", "Seven", "Six"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "What is Santa Claus called in France?",
        answers: ["Père Noël", "Papa Noel", "Father Frost", "Sinterklaas"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "Which company's advertising helped popularize Santa's red suit?",
        answers: ["Coca-Cola", "Pepsi", "Macy's", "Sears"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "What snack is traditionally left out for Santa in the United States?",
        answers: ["Cookies and milk", "Mince pies and sherry", "Carrots and water", "Cake and tea"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "Who was the real person Santa Claus is based on?",
        answers: ["St. Nicholas", "St. Peter", "St. Paul", "St. Francis"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "Which reindeer has a name that means 'thunder' in German?",
        answers: ["Donner", "Blitzen", "Dasher", "Comet"],
        correct: 0
    },
    {
        category: "Santa Claus",
        question: "What does Santa check twice according to the song?",
        answers: ["His list", "The weather", "His sleigh", "The time"],
        correct: 0
    },

    // Christmas Food
    {
        category: "Christmas Food",
        question: "What is the main ingredient in eggnog?",
        answers: ["Eggs and cream", "Milk and vanilla", "Chocolate and cream", "Apple cider"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What meat is traditionally served for Christmas dinner in many Western countries?",
        answers: ["Turkey or ham", "Chicken", "Beef", "Lamb"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What is a Yule log?",
        answers: ["A chocolate cake", "Firewood", "A Christmas cracker", "A type of candy"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What type of cookies are traditionally decorated during Christmas?",
        answers: ["Gingerbread", "Chocolate chip", "Oatmeal", "Peanut butter"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What is wassail?",
        answers: ["A hot spiced drink", "A type of bread", "A Christmas dessert", "A holiday cheese"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "In Italy, what type of bread is traditionally eaten at Christmas?",
        answers: ["Panettone", "Focaccia", "Ciabatta", "Baguette"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What fruit is often studded with cloves as a Christmas decoration?",
        answers: ["Orange", "Apple", "Lemon", "Grapefruit"],
        correct: 0
    },
    {
        category: "Christmas Food",
        question: "What are the small sausages wrapped in bacon called in the UK?",
        answers: ["Pigs in blankets", "Devils on horseback", "Bangers", "Chipolatas"],
        correct: 0
    },

    // Christmas Around the World
    {
        category: "Around the World",
        question: "In which hemisphere is Christmas celebrated during summer?",
        answers: ["Southern Hemisphere", "Northern Hemisphere", "Eastern Hemisphere", "Western Hemisphere"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "What do Australians often do on Christmas Day?",
        answers: ["Go to the beach", "Build snowmen", "Go skiing", "Stay indoors"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "In Spain, who brings gifts to children on January 6th?",
        answers: ["The Three Wise Men", "Santa Claus", "Father Christmas", "St. Nicholas"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "What is the Swedish Christmas gnome called?",
        answers: ["Tomte", "Nisse", "Elf", "Brownie"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "In Iceland, how many Yule Lads visit children before Christmas?",
        answers: ["Thirteen", "Twelve", "Seven", "Nine"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "What do Ukrainians traditionally put on their Christmas tree for good luck?",
        answers: ["Spider web decorations", "Corn husks", "Paper chains", "Dried fruit"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "In which country is La Befana the gift-giver?",
        answers: ["Italy", "Spain", "France", "Portugal"],
        correct: 0
    },
    {
        category: "Around the World",
        question: "What is the name of the German Christmas market tradition?",
        answers: ["Weihnachtsmarkt", "Oktoberfest", "Biergarten", "Christkindl"],
        correct: 0
    },

    // Christmas History
    {
        category: "Christmas History",
        question: "When was Christmas first celebrated on December 25th?",
        answers: ["336 AD", "1 AD", "100 BC", "500 AD"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "Which English ruler banned Christmas celebrations?",
        answers: ["Oliver Cromwell", "King Henry VIII", "Queen Elizabeth I", "King George III"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "Who wrote 'A Christmas Carol'?",
        answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "When was the first Christmas card sent?",
        answers: ["1843", "1776", "1900", "1820"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "Which US state was the first to make Christmas an official holiday?",
        answers: ["Alabama", "New York", "Massachusetts", "Virginia"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "What plant was sacred to Druids and is now used as Christmas decoration?",
        answers: ["Mistletoe", "Holly", "Ivy", "Pine"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "In what year did 'Rudolph the Red-Nosed Reindeer' first appear?",
        answers: ["1939", "1949", "1959", "1929"],
        correct: 0
    },
    {
        category: "Christmas History",
        question: "Who invented electric Christmas lights?",
        answers: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Benjamin Franklin"],
        correct: 0
    }
];

// Function to get shuffled questions
function getShuffledQuestions() {
    // Create a copy of the questions array
    const shuffled = [...TRIVIA_QUESTIONS];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Function to get a random question with shuffled answers
function getRandomQuestion(usedIndices = []) {
    // Filter out used questions
    const availableIndices = [];
    for (let i = 0; i < TRIVIA_QUESTIONS.length; i++) {
        if (!usedIndices.includes(i)) {
            availableIndices.push(i);
        }
    }

    // If all questions used, reset
    if (availableIndices.length === 0) {
        return getRandomQuestion([]);
    }

    // Pick random index
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const question = { ...TRIVIA_QUESTIONS[randomIndex] };
    question.originalIndex = randomIndex;

    // Shuffle answers while keeping track of correct answer
    const correctAnswer = question.answers[question.correct];
    const shuffledAnswers = [...question.answers];

    for (let i = shuffledAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
    }

    question.answers = shuffledAnswers;
    question.correct = shuffledAnswers.indexOf(correctAnswer);

    return question;
}
