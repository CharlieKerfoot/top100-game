import type { GameList } from './types';
import { mostTranslatedBooksHints } from './hints';

export const mostTranslatedBooks: GameList = {
  id: 'most-translated-books',
  name: 'Most Translated Books of All Time',
  description: 'Books ranked by number of languages translated into (Wikipedia)',
  topics: ['culture'],
  hints: mostTranslatedBooksHints,
  valueLabel: 'Author',
  size: 50,
  items: [
    "The Bible", "The Little Prince", "The Adventures of Pinocchio", "Dao De Jing", "The Pilgrim's Progress",
    "The Communist Manifesto", "Alice's Adventures in Wonderland", "Grimm's Fairy Tales", "Steps to Christ", "Don Quixote",
    "Andersen's Fairy Tales", "The Book of Mormon", "Asterix", "The Quran", "The Way to Happiness",
    "The Prophet", "The Upright Revolution", "The Adventures of Tintin", "Luther's Small Catechism", "The Imitation of Christ",
    "Harry Potter", "Winnie-the-Pooh", "The Diary of a Young Girl", "Das Kapital", "The Kon-Tiki Expedition",
    "Pippi Longstocking", "The Alchemist", "Diary of a Wimpy Kid", "Sophie's World", "The Adventures of Huckleberry Finn",
    "Nineteen Eighty-Four", "Through the Looking-Glass", "The Isha Upanishad", "The Tirukkural", "Kalevala",
    "Quo Vadis", "Uncle Tom's Cabin", "The Wonderful Adventures of Nils", "The Bhagavad Gita", "The Hobbit",
    "The Good Soldier Švejk", "The Lord of the Rings", "Things Fall Apart", "A Doll's House", "The Divine Comedy",
    "Seven Brief Lessons on Physics", "Never Let Me Go", "The Boy in the Striped Pyjamas", "The House at Pooh Corner", "Autobiography of a Yogi",
  ],
  values: [
    "Various authors", "Antoine de Saint-Exupéry", "Carlo Collodi", "Laozi", "John Bunyan",
    "Karl Marx & Friedrich Engels", "Lewis Carroll", "Jacob & Wilhelm Grimm", "Ellen G. White", "Miguel de Cervantes",
    "Hans Christian Andersen", "Various authors", "René Goscinny & Albert Uderzo", "Various authors", "L. Ron Hubbard",
    "Kahlil Gibran", "Ngũgĩ wa Thiong'o", "Hergé", "Martin Luther", "Thomas à Kempis",
    "J. K. Rowling", "A. A. Milne", "Anne Frank", "Karl Marx", "Thor Heyerdahl",
    "Astrid Lindgren", "Paulo Coelho", "Jeff Kinney", "Jostein Gaarder", "Mark Twain",
    "George Orwell", "Lewis Carroll", "Various authors", "Valluvar", "Elias Lönnrot",
    "Henryk Sienkiewicz", "Harriet Beecher Stowe", "Selma Lagerlöf", "Vyasa", "J. R. R. Tolkien",
    "Jaroslav Hašek", "J. R. R. Tolkien", "Chinua Achebe", "Henrik Ibsen", "Dante Alighieri",
    "Carlo Rovelli", "Kazuo Ishiguro", "John Boyne", "A. A. Milne", "Paramahansa Yogananda",
  ],
};
