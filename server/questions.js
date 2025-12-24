// Questions data for The Floor: Christmas Edition
// Each category has multiple questions that can be shown during battles

const QUESTIONS = {
    'activities': [
        { question: "What winter activity involves sliding down a snowy hill on a wooden frame with metal runners?", answer: "Sledding" },
        { question: "What activity involves decorating a coniferous tree with lights and ornaments?", answer: "Decorating the Christmas tree" },
        { question: "What holiday activity involves going door-to-door singing festive songs?", answer: "Caroling" },
        { question: "What winter sport uses a broom and stones on ice?", answer: "Curling" },
        { question: "What activity involves cutting shapes from dough and baking them?", answer: "Making Christmas cookies" },
        { question: "What outdoor activity involves strapping boards to your feet to glide down mountains?", answer: "Skiing" },
        { question: "What cozy activity involves drinking hot beverages while watching snow fall?", answer: "Drinking hot cocoa" },
        { question: "What activity involves building a figure from packed snow?", answer: "Building a snowman" }
    ],
    'at-the-mall': [
        { question: "Who do children visit to share their Christmas wishes at the mall?", answer: "Santa Claus" },
        { question: "What festive structure displays the birth of Jesus at many malls?", answer: "Nativity scene" },
        { question: "What type of photos do families typically take at the mall during the holidays?", answer: "Santa photos / Holiday photos" },
        { question: "What spinning ride often appears at malls during Christmas?", answer: "Carousel" },
        { question: "What do malls often feature that involves a small locomotive during holidays?", answer: "Holiday train" },
        { question: "What type of store sells ornaments, wreaths, and holiday decorations year-round?", answer: "Christmas store" },
        { question: "What festive display often features animated figures in store windows?", answer: "Window display" },
        { question: "What station lets kids write letters to Santa at the mall?", answer: "Santa's mailbox" }
    ],
    'board-games': [
        { question: "What game has players buy properties like Boardwalk and Park Place?", answer: "Monopoly" },
        { question: "What game involves sliding colored discs to knock opponents into gutters?", answer: "Sorry!" },
        { question: "What game has players guess their opponent's face on a grid?", answer: "Guess Who?" },
        { question: "What game involves removing wooden blocks from a tower?", answer: "Jenga" },
        { question: "What word game uses letter tiles on a 15x15 board?", answer: "Scrabble" },
        { question: "What game has Colonel Mustard, Miss Scarlet, and Professor Plum?", answer: "Clue" },
        { question: "What game involves buying vowels and solving puzzles?", answer: "Wheel of Fortune" },
        { question: "What game has players race to get 4 pieces home based on dice rolls?", answer: "Trouble" }
    ],
    'christmas-albums': [
        { question: "Which crooner released 'White Christmas' - the best-selling single of all time?", answer: "Bing Crosby" },
        { question: "Which pop star released 'My Kind of Christmas' in 2000?", answer: "Christina Aguilera" },
        { question: "Which singer's 'Christmas' album features 'All I Want for Christmas Is You'?", answer: "Mariah Carey" },
        { question: "Which rock legend released 'A Very Special Christmas' album?", answer: "Elvis Presley" },
        { question: "Which country music legend released 'Once Upon a Christmas' with Kenny Rogers?", answer: "Dolly Parton" },
        { question: "Which Motown artist released 'Someday at Christmas'?", answer: "Stevie Wonder" },
        { question: "Which British boy band released 'A Westlife Christmas'?", answer: "Westlife" },
        { question: "Which jazz legend released 'Ella Wishes You a Swinging Christmas'?", answer: "Ella Fitzgerald" }
    ],
    'christmas-candy': [
        { question: "What striped hooked candy is traditionally red and white?", answer: "Candy cane" },
        { question: "What chocolate company makes Kisses with the foil flag?", answer: "Hershey's" },
        { question: "What round hard candy comes in a decorative tin at Christmas?", answer: "Butter cookies / Danish butter cookies" },
        { question: "What marshmallow treat is often shaped like Santas and snowmen?", answer: "Peeps" },
        { question: "What chocolate-covered cherry candy is popular at Christmas?", answer: "Chocolate covered cherries" },
        { question: "What ribbon-shaped hard candy is made by Brach's?", answer: "Ribbon candy" },
        { question: "What holiday candy features red and green colored pieces?", answer: "M&Ms" },
        { question: "What peppermint patty is dark chocolate covered?", answer: "York Peppermint Pattie" }
    ],
    'christmas-cards': [
        { question: "What company is known for their greeting cards with a crown logo?", answer: "Hallmark" },
        { question: "What scene often appears on cards showing Jesus, Mary, and Joseph?", answer: "Nativity scene" },
        { question: "What bird often appears on Christmas cards sitting on snowy branches?", answer: "Cardinal" },
        { question: "What type of card features a family photo?", answer: "Photo card" },
        { question: "What jolly figure in red is commonly depicted on Christmas cards?", answer: "Santa Claus" },
        { question: "What evergreen decoration often appears on card borders?", answer: "Holly" },
        { question: "What celestial object guides the wise men on many cards?", answer: "Star of Bethlehem" },
        { question: "What winter scene shows a one-horse open sleigh?", answer: "Sleigh ride" }
    ],
    'christmas-cartoon-characters': [
        { question: "What reindeer has a shiny red nose?", answer: "Rudolph" },
        { question: "What green creature stole Christmas from the Whos?", answer: "The Grinch" },
        { question: "What snowman came to life with a magic hat?", answer: "Frosty" },
        { question: "What elf wanted to be a dentist?", answer: "Hermey" },
        { question: "What bumble is the Abominable Snow Monster?", answer: "Bumble" },
        { question: "What misfit toy is a Charlie-in-the-box?", answer: "Charlie-in-the-Box" },
        { question: "What prospector sings 'Silver and Gold'?", answer: "Yukon Cornelius" },
        { question: "What character says 'Bah, humbug!'?", answer: "Ebenezer Scrooge" }
    ],
    'christmas-cities': [
        { question: "What Pennsylvania city is nicknamed 'Christmas City'?", answer: "Bethlehem" },
        { question: "What city has a famous tree at Rockefeller Center?", answer: "New York City" },
        { question: "What German city has the famous Christkindlesmarkt?", answer: "Nuremberg" },
        { question: "What Alaskan city is named after a famous saint?", answer: "North Pole, Alaska" },
        { question: "What Indiana city is called the 'Christmas City of the North'?", answer: "Santa Claus, Indiana" },
        { question: "What Austrian city is famous for 'Silent Night'?", answer: "Salzburg" },
        { question: "What city in Lapland is known as Santa's hometown?", answer: "Rovaniemi" },
        { question: "What city hosts the famous Macy's Thanksgiving parade leading to Christmas?", answer: "New York City" }
    ],
    'christmas-gifts': [
        { question: "What electronic device lets you read books without paper?", answer: "Kindle / E-reader" },
        { question: "What jewelry item goes around your wrist?", answer: "Bracelet / Watch" },
        { question: "What cozy item keeps your feet warm?", answer: "Slippers / Socks" },
        { question: "What beauty item set often comes in a gift basket?", answer: "Bath set / Lotion set" },
        { question: "What kitchen appliance makes coffee each morning?", answer: "Coffee maker" },
        { question: "What gaming device do kids often wish for?", answer: "Video game console" },
        { question: "What item holds all your money and cards?", answer: "Wallet" },
        { question: "What fragrant gift comes in a decorative bottle?", answer: "Perfume / Cologne" }
    ],
    'christmas-movies': [
        { question: "What movie features Macaulay Culkin defending his home from burglars?", answer: "Home Alone" },
        { question: "What movie has Will Ferrell as a human raised by elves?", answer: "Elf" },
        { question: "What classic movie features Zuzu's petals?", answer: "It's a Wonderful Life" },
        { question: "What movie has Tim Allen becoming Santa after an accident?", answer: "The Santa Clause" },
        { question: "What animated movie features a train to the North Pole?", answer: "The Polar Express" },
        { question: "What movie has Chevy Chase's disastrous family Christmas?", answer: "National Lampoon's Christmas Vacation" },
        { question: "What movie features a boy with a Red Ryder BB gun wish?", answer: "A Christmas Story" },
        { question: "What Muppet movie retells A Christmas Carol?", answer: "The Muppet Christmas Carol" }
    ],
    'christmas-song-lyrics': [
        { question: "Complete: 'Jingle bells, jingle bells, jingle all the ___'", answer: "way" },
        { question: "Complete: 'Silent night, holy night, all is calm, all is ___'", answer: "bright" },
        { question: "Complete: 'Deck the halls with boughs of ___'", answer: "holly" },
        { question: "Complete: 'Rudolph the red-nosed reindeer had a very shiny ___'", answer: "nose" },
        { question: "Complete: 'Frosty the snowman was a jolly happy ___'", answer: "soul" },
        { question: "Complete: 'I'm dreaming of a ___ Christmas'", answer: "white" },
        { question: "Complete: 'You better watch out, you better not ___'", answer: "cry" },
        { question: "Complete: 'Have yourself a merry little Christmas, let your heart be ___'", answer: "light" }
    ],
    'christmas-tv-shows': [
        { question: "What show features the Simpsons celebrating Christmas in its first episode?", answer: "The Simpsons" },
        { question: "What sitcom had a famous Festivus episode?", answer: "Seinfeld" },
        { question: "What show features Charlie Brown and a sad little tree?", answer: "A Charlie Brown Christmas" },
        { question: "What show has the Grinch stealing Christmas?", answer: "How the Grinch Stole Christmas" },
        { question: "What Rankin/Bass special features Rudolph?", answer: "Rudolph the Red-Nosed Reindeer" },
        { question: "What show features Frosty coming to life?", answer: "Frosty the Snowman" },
        { question: "What sitcom features the Bundy family's chaotic Christmases?", answer: "Married... with Children" },
        { question: "What British sitcom has a famous Christmas special with Del Boy falling through a bar?", answer: "Only Fools and Horses" }
    ],
    'classic-toys': [
        { question: "What construction toy uses interlocking plastic bricks?", answer: "LEGO" },
        { question: "What fashion doll has been around since 1959?", answer: "Barbie" },
        { question: "What toy lets you create art by turning knobs?", answer: "Etch A Sketch" },
        { question: "What toy soldiers come in green plastic?", answer: "Army men" },
        { question: "What spring toy walks down stairs?", answer: "Slinky" },
        { question: "What handheld game features falling blocks?", answer: "Tetris / Game Boy" },
        { question: "What toy train brand goes around the Christmas tree?", answer: "Lionel" },
        { question: "What teddy bear brand has a heart on its tag?", answer: "Build-A-Bear / Ty" }
    ],
    'december-calendar': [
        { question: "What day is Christmas Eve?", answer: "December 24th" },
        { question: "What day is Christmas Day?", answer: "December 25th" },
        { question: "What Jewish holiday is celebrated for 8 nights in December?", answer: "Hanukkah" },
        { question: "What day is New Year's Eve?", answer: "December 31st" },
        { question: "What day is Boxing Day?", answer: "December 26th" },
        { question: "What holiday celebrates African heritage starting December 26?", answer: "Kwanzaa" },
        { question: "What winter event marks the shortest day of the year?", answer: "Winter solstice (December 21st)" },
        { question: "What saint's feast day is December 6th?", answer: "St. Nicholas Day" }
    ],
    'first-christmas': [
        { question: "In what town was Jesus born?", answer: "Bethlehem" },
        { question: "What did Mary lay baby Jesus in?", answer: "A manger" },
        { question: "How many wise men visited Jesus?", answer: "Three (traditionally)" },
        { question: "What guided the wise men to Jesus?", answer: "A star" },
        { question: "Who was Jesus's earthly father?", answer: "Joseph" },
        { question: "What did the angel tell the shepherds?", answer: "Good news of great joy / A Savior is born" },
        { question: "What animal is Mary often depicted riding?", answer: "A donkey" },
        { question: "What three gifts did the wise men bring?", answer: "Gold, frankincense, and myrrh" }
    ],
    'its-cold-outside': [
        { question: "What frozen precipitation falls from clouds?", answer: "Snow" },
        { question: "What forms when water vapor freezes on surfaces?", answer: "Frost" },
        { question: "What hanging ice formation grows from roofs?", answer: "Icicle" },
        { question: "What do you wear on your hands to keep warm?", answer: "Gloves / Mittens" },
        { question: "What hot drink is made from cocoa powder and milk?", answer: "Hot chocolate / Hot cocoa" },
        { question: "What piece of winter clothing wraps around your neck?", answer: "Scarf" },
        { question: "What frozen water do people skate on?", answer: "Ice" },
        { question: "What do you build to have a snowball fight behind?", answer: "Snow fort" }
    ],
    'matthew-luke': [
        { question: "Which Gospel tells of the Wise Men's visit?", answer: "Matthew" },
        { question: "Which Gospel tells of the shepherds' visit?", answer: "Luke" },
        { question: "Who was the king who wanted to kill baby Jesus?", answer: "King Herod" },
        { question: "What angel announced Jesus's birth to Mary?", answer: "Gabriel" },
        { question: "Where did Joseph take Mary and Jesus to escape Herod?", answer: "Egypt" },
        { question: "Who was Mary's relative that was also pregnant?", answer: "Elizabeth" },
        { question: "What was the name of Elizabeth's son?", answer: "John (the Baptist)" },
        { question: "What emperor ordered the census that brought Mary and Joseph to Bethlehem?", answer: "Caesar Augustus" }
    ],
    'movie-lines': [
        { question: "'You'll shoot your eye out!' is from what movie?", answer: "A Christmas Story" },
        { question: "'Every time a bell rings, an angel gets his wings' is from what movie?", answer: "It's a Wonderful Life" },
        { question: "'You're a mean one, Mr. Grinch' is from what movie?", answer: "How the Grinch Stole Christmas" },
        { question: "'Keep the change, ya filthy animal' is from what movie?", answer: "Home Alone" },
        { question: "'The best way to spread Christmas cheer is singing loud for all to hear' is from what movie?", answer: "Elf" },
        { question: "'God bless us, everyone!' is from what story?", answer: "A Christmas Carol" },
        { question: "'Nobody's walking out on this fun, old-fashioned family Christmas' is from what movie?", answer: "National Lampoon's Christmas Vacation" },
        { question: "'I want an official Red Ryder carbine action 200-shot range model air rifle' is from what movie?", answer: "A Christmas Story" }
    ],
    'nba': [
        { question: "What team plays at Madison Square Garden?", answer: "New York Knicks" },
        { question: "What team is known for winning championships in the 2010s with LeBron James?", answer: "Miami Heat / Cleveland Cavaliers" },
        { question: "What team plays in the TD Garden?", answer: "Boston Celtics" },
        { question: "What team is located in Los Angeles and wears purple and gold?", answer: "Los Angeles Lakers" },
        { question: "What team plays at United Center in Illinois?", answer: "Chicago Bulls" },
        { question: "What team is named after a type of combustion?", answer: "Miami Heat" },
        { question: "What Texas team has won multiple championships?", answer: "San Antonio Spurs" },
        { question: "What California team plays at Chase Center?", answer: "Golden State Warriors" }
    ],
    'nba-stars': [
        { question: "What player is known as 'King James'?", answer: "LeBron James" },
        { question: "What player was known as 'His Airness' and won 6 championships with the Bulls?", answer: "Michael Jordan" },
        { question: "What player wore #24 for the Lakers and tragically passed in 2020?", answer: "Kobe Bryant" },
        { question: "What player is nicknamed 'The Greek Freak'?", answer: "Giannis Antetokounmpo" },
        { question: "What player is known for his incredible shooting from 'Curry range'?", answer: "Stephen Curry" },
        { question: "What big man was known as 'Shaq'?", answer: "Shaquille O'Neal" },
        { question: "What player was 'The Answer' for Philadelphia?", answer: "Allen Iverson" },
        { question: "What player is nicknamed 'The Beard'?", answer: "James Harden" }
    ],
    'santa-screentime': [
        { question: "In what movie does Tim Allen become Santa after an accident on the roof?", answer: "The Santa Clause" },
        { question: "What 1994 movie has a department store Santa who might be the real thing?", answer: "Miracle on 34th Street (1994)" },
        { question: "What animated movie features a train ride to meet Santa?", answer: "The Polar Express" },
        { question: "What movie has Santa needing to be saved by Will Ferrell's character?", answer: "Elf" },
        { question: "What classic has Santa explaining why he's going down chimneys?", answer: "Rudolph the Red-Nosed Reindeer" },
        { question: "What movie has Billy Bob Thornton as a crude mall Santa?", answer: "Bad Santa" },
        { question: "What movie has Kurt Russell as a cool Santa?", answer: "The Christmas Chronicles" },
        { question: "What Rankin/Bass special has a young Kris Kringle?", answer: "Santa Claus Is Comin' to Town" }
    ],
    'stocking-stuffers': [
        { question: "What fruit is traditionally put in the toe of a stocking?", answer: "Orange" },
        { question: "What striped candy fits perfectly in a stocking?", answer: "Candy cane" },
        { question: "What small card game could fit in a stocking?", answer: "Playing cards / UNO" },
        { question: "What writing instrument is a common stocking stuffer?", answer: "Pen / Pencil" },
        { question: "What lip care product is often found in stockings?", answer: "Lip balm / Chapstick" },
        { question: "What small chocolate coin wrapped in gold is a stocking staple?", answer: "Chocolate coins" },
        { question: "What scratchy lottery item often goes in stockings?", answer: "Scratch-off tickets" },
        { question: "What small puzzle toy has 6 colored sides?", answer: "Rubik's Cube" }
    ],
    'toy-shopping': [
        { question: "What store has a giraffe mascot named Geoffrey?", answer: "Toys 'R' Us" },
        { question: "What online marketplace has become the biggest toy retailer?", answer: "Amazon" },
        { question: "What big-box store with red branding sells toys?", answer: "Target" },
        { question: "What store with blue and yellow branding is known for low prices?", answer: "Walmart" },
        { question: "What FAO store was famous on 5th Avenue in NYC?", answer: "FAO Schwarz" },
        { question: "What membership warehouse sells toys in bulk?", answer: "Costco" },
        { question: "What day after Thanksgiving has major toy sales?", answer: "Black Friday" },
        { question: "What Monday after Thanksgiving has online toy deals?", answer: "Cyber Monday" }
    ],
    'twas-the-night': [
        { question: "Complete: 'Twas the night before Christmas, when all through the ___'", answer: "house" },
        { question: "What was not stirring, not even a mouse?", answer: "A creature / Not a creature" },
        { question: "What were the children nestled snug in?", answer: "Their beds" },
        { question: "What did visions of dance in the children's heads?", answer: "Sugar-plums" },
        { question: "What did Santa's belly shake like when he laughed?", answer: "A bowl full of jelly" },
        { question: "What did Santa have in his teeth as he entered?", answer: "A pipe" },
        { question: "How did Santa's cheeks appear?", answer: "Like roses" },
        { question: "What did Santa exclaim as he drove out of sight?", answer: "Merry Christmas to all, and to all a good night" }
    ]
};

// Get questions for a category
function getQuestionsForCategory(categoryId) {
    return QUESTIONS[categoryId] || [];
}

// Get a specific question
function getQuestion(categoryId, index) {
    const questions = QUESTIONS[categoryId];
    if (!questions || index >= questions.length) {
        return null;
    }
    return questions[index];
}

// Get question count for a category
function getQuestionCount(categoryId) {
    const questions = QUESTIONS[categoryId];
    return questions ? questions.length : 0;
}

module.exports = {
    QUESTIONS,
    getQuestionsForCategory,
    getQuestion,
    getQuestionCount
};
