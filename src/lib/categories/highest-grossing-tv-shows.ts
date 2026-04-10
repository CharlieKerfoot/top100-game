import type { Category } from './types';
import { highestGrossingTvShowsHints } from './hints/highest-grossing-tv-shows';

export const highestGrossingTvShows: Category = {
  id: 'highest-grossing-tv-shows',
  name: 'Highest-Grossing TV Shows of All Time',
  description: 'TV shows ranked by total franchise revenue and earnings',
  tags: ['entertainment', 'television'],
  hints: highestGrossingTvShowsHints,
  items: [
    'The Simpsons', 'Friends', 'The Big Bang Theory', 'Seinfeld', 'Law & Order',
    'NCIS', "Grey's Anatomy", 'Game of Thrones', 'The Walking Dead', 'Frasier',
    'Everybody Loves Raymond', 'Two and a Half Men', 'The Office', 'Stranger Things', 'Modern Family',
    'House', 'CSI', 'ER', 'Desperate Housewives', 'How I Met Your Mother',
    'Family Guy', 'South Park', 'Cheers', 'M*A*S*H', '24',
    'Lost', 'Breaking Bad', 'The Sopranos', 'Mad Men', 'Succession',
    'Yellowstone', 'Supernatural', 'The Real Housewives', 'Survivor', 'American Idol',
    'Dancing with the Stars', 'The X-Files', 'Married with Children', 'Home Improvement', 'Roseanne',
    'Full House', 'Star Trek', 'Baywatch', 'Beverly Hills, 90210', 'Sex and the City',
    'Downton Abbey', 'The Crown', 'Ozark', 'Squid Game', 'Money Heist',
    'Narcos', 'Dexter', 'True Blood', 'Boardwalk Empire', 'Westworld',
    'Homeland', '30 Rock', 'Parks and Recreation', 'Arrested Development', "It's Always Sunny in Philadelphia",
    'The Wire', 'The Shield', 'Justified', 'Sons of Anarchy', 'Criminal Minds',
    'NCIS: Los Angeles', 'Hawaii Five-0', 'Blue Bloods', 'Chicago Fire', 'Bones',
    'Castle', 'Psych', 'Monk', 'Burn Notice', 'White Collar',
    'Suits', 'Shameless', 'Peaky Blinders', 'Cobra Kai', 'Bridgerton',
    'Emily in Paris', 'Virgin River', 'Outer Banks', 'Wednesday', 'The Witcher',
    'Umbrella Academy', 'Dark', 'Lupin', 'The Last of Us', 'House of the Dragon',
    'The Bear', 'Severance', 'Ted Lasso', 'Abbott Elementary', 'Only Murders in the Building',
    'The Mandalorian', 'Andor', 'The Boys', 'Invincible', 'Euphoria',
  ],
};
