// Quote library used by the typing engine.
// Keep quotes reasonably short so rounds stay fast-paced.
const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Imagination is more important than knowledge.",
    author: "Albert Einstein",
  },
  {
    text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.",
    author: "A. P. J. Abdul Kalam",
  },
  {
    text: "It always seems impossible until it is done.",
    author: "Nelson Mandela",
  },
  {
    text: "Life is what happens when you are busy making other plans.",
    author: "John Lennon",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "Success is not final, failure is not fatal, it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Excellence is not a skill, it is an attitude that everyone can adopt.",
    author: "A. P. J. Abdul Kalam",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
  },
  {
    text: "You miss one hundred percent of the shots you never take.",
    author: "Wayne Gretzky",
  },
];

function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

module.exports = { QUOTES, randomQuote };
