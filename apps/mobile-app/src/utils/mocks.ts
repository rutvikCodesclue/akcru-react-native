import {uniqueId, range, sample, startCase, random} from 'lodash';
import {LoremIpsum} from 'lorem-ipsum';
import {faker} from '@faker-js/faker';
import {AvatarGenerator} from 'random-avatar-generator';
import {BADGES} from '../constants/index';

const generator = new AvatarGenerator();
const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

export const MOVIES = [
  {
    actors: ['Toshirô Mifune', 'Eijirô Tôno', 'Tatsuya Nakadai'],
    desc: 'A crafty ronin comes to a town divided by two criminal gangs and decides to play them against each other to free the town.',
    directors: ['Akira Kurosawa'],
    genre: ['Action', 'Drama', 'Thriller'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BZThiZjAzZjgtNDU3MC00YThhLThjYWUtZGRkYjc2ZWZlOTVjXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BZThiZjAzZjgtNDU3MC00YThhLThjYWUtZGRkYjc2ZWZlOTVjXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0055630/',
    name: 'Yôjinbô',
    rating: 8.2,
    year: 1961,
  },
  {
    actors: ['Tyrone Power', 'Marlene Dietrich', 'Charles Laughton'],
    desc: 'A veteran British barrister must defend his client in a murder trial that has surprise after surprise.',
    directors: ['Billy Wilder'],
    genre: ['Crime', 'Drama', 'Mystery'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BNDQwODU5OWYtNDcyNi00MDQ1LThiOGMtZDkwNWJiM2Y3MDg0XkEyXkFqcGdeQXVyMDI2NDg0NQ@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BNDQwODU5OWYtNDcyNi00MDQ1LThiOGMtZDkwNWJiM2Y3MDg0XkEyXkFqcGdeQXVyMDI2NDg0NQ@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0051201/',
    name: 'Witness for the Prosecution',
    rating: 8.4,
    year: 1958,
  },
  {
    actors: ['Miles Teller', 'J.K. Simmons', 'Melissa Benoist'],
    desc: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\u0026apos;s potential.',
    directors: ['Damien Chazelle'],
    genre: ['Drama', 'Music'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt2582802/',
    name: 'Whiplash',
    rating: 8.5,
    year: 2014,
  },
  {
    actors: ['Tom Hardy', 'Nick Nolte', 'Joel Edgerton'],
    desc: 'The youngest son of an alcoholic former boxer returns home, where he\u0026apos;s trained by his father for competition in a mixed martial arts tournament - a path that puts the fighter on a collision course with his estranged, older brother.',
    directors: ['Gavin O\u0026apos;Connor'],
    genre: ['Action', 'Drama', 'Sport'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt1291584/',
    name: 'Warrior',
    rating: 8.2,
    year: 2011,
  },
  {
    actors: ['Ben Burtt', 'Elissa Knight', 'Jeff Garlin'],
    desc: 'In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.',
    directors: ['Andrew Stanton'],
    genre: ['Animation', 'Adventure', 'Family'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0910970/',
    name: 'WALL·E',
    rating: 8.4,
    year: 2008,
  },
  {
    actors: ['James Stewart', 'Kim Novak', 'Barbara Bel Geddes'],
    desc: 'A former San Francisco police detective juggles wrestling with his personal demons and becoming obsessed with the hauntingly beautiful woman he has been hired to trail, who may be deeply disturbed.',
    directors: ['Alfred Hitchcock'],
    genre: ['Mystery', 'Romance', 'Thriller'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BYTE4ODEwZDUtNDFjOC00NjAxLWEzYTQtYTI1NGVmZmFlNjdiL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BYTE4ODEwZDUtNDFjOC00NjAxLWEzYTQtYTI1NGVmZmFlNjdiL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0052357/',
    name: 'Vertigo',
    rating: 8.3,
    year: 1958,
  },
  {
    actors: ['Hugo Weaving', 'Natalie Portman', 'Rupert Graves'],
    desc: 'In a future British dystopian society, a shadowy freedom fighter, known only by the alias of \u0026quot;V\u0026quot;, plots to overthrow the tyrannical government - with the help of a young woman.',
    directors: ['James McTeigue'],
    genre: ['Action', 'Drama', 'Sci-Fi'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BOTI5ODc3NzExNV5BMl5BanBnXkFtZTcwNzYxNzQzMw@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BOTI5ODc3NzExNV5BMl5BanBnXkFtZTcwNzYxNzQzMw@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0434409/',
    name: 'V for Vendetta',
    rating: 8.2,
    year: 2006,
  },
  {
    actors: ['Edward Asner', 'Jordan Nagai', 'John Ratzenberger'],
    desc: '78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.',
    directors: ['Pete Docter', 'Bob Peterson'],
    genre: ['Animation', 'Adventure', 'Comedy'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt1049413/',
    name: 'Up',
    rating: 8.3,
    year: 2009,
  },
  {
    actors: ['Clint Eastwood', 'Gene Hackman', 'Morgan Freeman'],
    desc: 'Retired Old West gunslinger William Munny reluctantly takes on one last job, with the help of his old partner Ned Logan and a young man, The \u0026quot;Schofield Kid.\u0026quot;',
    directors: ['Clint Eastwood'],
    genre: ['Drama', 'Western'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BODM3YWY4NmQtN2Y3Ni00OTg0LWFhZGQtZWE3ZWY4MTJlOWU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BODM3YWY4NmQtN2Y3Ni00OTg0LWFhZGQtZWE3ZWY4MTJlOWU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0105695/',
    name: 'Unforgiven',
    rating: 8.2,
    year: 1992,
  },
  {
    actors: ['Chishû Ryû', 'Chieko Higashiyama', 'Sô Yamamura'],
    desc: 'An old couple visit their children and grandchildren in the city, but receive little attention.',
    directors: ['Yasujirô Ozu'],
    genre: ['Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BYWQ4ZTRiODktNjAzZC00Nzg1LTk1YWQtNDFmNDI0NmZiNGIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BYWQ4ZTRiODktNjAzZC00Nzg1LTk1YWQtNDFmNDI0NmZiNGIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0046438/',
    name: 'Tôkyô monogatari',
    rating: 8.2,
    year: 1972,
  },
  {
    actors: ['Ewan McGregor', 'Ewen Bremner', 'Jonny Lee Miller'],
    desc: 'Renton, deeply immersed in the Edinburgh drug scene, tries to clean up and get out, despite the allure of the drugs and influence of friends.',
    directors: ['Danny Boyle'],
    genre: ['Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMzA5Zjc3ZTMtMmU5YS00YTMwLWI4MWUtYTU0YTVmNjVmODZhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMzA5Zjc3ZTMtMmU5YS00YTMwLWI4MWUtYTU0YTVmNjVmODZhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0117951/',
    name: 'Trainspotting',
    rating: 8.1,
    year: 1996,
  },
  {
    actors: ['Tom Hanks', 'Tim Allen', 'Joan Cusack'],
    desc: 'The toys are mistakenly delivered to a day-care center instead of the attic right before Andy leaves for college, and it\u0026apos;s up to Woody to convince the other toys that they weren\u0026apos;t abandoned and to return home.',
    directors: ['Lee Unkrich'],
    genre: ['Animation', 'Adventure', 'Comedy'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMTgxOTY4Mjc0MF5BMl5BanBnXkFtZTcwNTA4MDQyMw@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMTgxOTY4Mjc0MF5BMl5BanBnXkFtZTcwNTA4MDQyMw@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0435761/',
    name: 'Toy Story 3',
    rating: 8.3,
    year: 2010,
  },
  {
    actors: ['Tom Hanks', 'Tim Allen', 'Don Rickles'],
    desc: 'A cowboy doll is profoundly threatened and jealous when a new spaceman action figure supplants him as top toy in a boy\u0026apos;s bedroom.',
    directors: ['John Lasseter'],
    genre: ['Animation', 'Adventure', 'Comedy'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0114709/',
    name: 'Toy Story',
    rating: 8.3,
    year: 1995,
  },
  {
    actors: ['Tom Cruise', 'Jennifer Connelly', 'Miles Teller'],
    desc: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\u0026apos;s elite graduates on a mission that demands the ultimate sacrifice from those chosen to ...',
    directors: ['Joseph Kosinski'],
    genre: ['Action', 'Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt1745960/',
    name: 'Top Gun: Maverick',
    rating: 8.4,
    year: 2022,
  },
  {
    actors: ['Hitoshi Takagi', 'Noriko Hidaka', 'Chika Sakamoto'],
    desc: 'When two girls move to the country to be near their ailing mother, they have adventures with the wondrous forest spirits who live nearby.',
    directors: ['Hayao Miyazaki'],
    genre: ['Animation', 'Comedy', 'Family'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BYzJjMTYyMjQtZDI0My00ZjE2LTkyNGYtOTllNGQxNDMyZjE0XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BYzJjMTYyMjQtZDI0My00ZjE2LTkyNGYtOTllNGQxNDMyZjE0XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0096283/',
    name: 'Tonari no Totoro',
    rating: 8.1,
    year: 1990,
  },
  {
    actors: ['Gregory Peck', 'John Megna', 'Frank Overton'],
    desc: 'Atticus Finch, a widowed lawyer in Depression-era Alabama, defends a black man against an undeserved rape charge, and his children against prejudice.',
    directors: ['Robert Mulligan'],
    genre: ['Crime', 'Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BNmVmYzcwNzMtMWM1NS00MWIyLThlMDEtYzUwZDgzODE1NmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BNmVmYzcwNzMtMWM1NS00MWIyLThlMDEtYzUwZDgzODE1NmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0056592/',
    name: 'To Kill a Mockingbird',
    rating: 8.3,
    year: 1963,
  },
  {
    actors: ['Carole Lombard', 'Jack Benny', 'Robert Stack'],
    desc: 'During the Nazi occupation of Poland, an acting troupe becomes embroiled in a Polish soldier\u0026apos;s efforts to track down a German spy.',
    directors: ['Ernst Lubitsch'],
    genre: ['Comedy', 'Romance', 'War'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMGY3ZDgzY2MtNTllNi00ZWI1LTk1NTUtNWEzN2Q4YTA1ZGZiXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMGY3ZDgzY2MtNTllNi00ZWI1LTk1NTUtNWEzN2Q4YTA1ZGZiXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0035446/',
    name: 'To Be or Not to Be',
    rating: 8.2,
    year: 1942,
  },
  {
    actors: ['Frances McDormand', 'Woody Harrelson', 'Sam Rockwell'],
    desc: 'A mother personally challenges the local authorities to solve her daughter\u0026apos;s murder when they fail to catch the culprit.',
    directors: ['Martin McDonagh'],
    genre: ['Comedy', 'Crime', 'Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMjI0ODcxNzM1N15BMl5BanBnXkFtZTgwMzIwMTEwNDI@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMjI0ODcxNzM1N15BMl5BanBnXkFtZTgwMzIwMTEwNDI@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt5027774/',
    name: 'Three Billboards Outside Ebbing, Missouri',
    rating: 8.1,
    year: 2017,
  },
  {
    actors: ['Daniel Day-Lewis', 'Paul Dano', 'Ciarán Hinds'],
    desc: 'A story of family, religion, hatred, oil and madness, focusing on a turn-of-the-century prospector in the early days of the business.',
    directors: ['Paul Thomas Anderson'],
    genre: ['Drama'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0469494/',
    name: 'There Will Be Blood',
    rating: 8.2,
    year: 2008,
  },
  {
    actors: ['Leonardo DiCaprio', 'Jonah Hill', 'Margot Robbie'],
    desc: 'Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.',
    directors: ['Martin Scorsese'],
    genre: ['Biography', 'Comedy', 'Crime'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0993846/',
    name: 'The Wolf of Wall Street',
    rating: 8.2,
    year: 2013,
  },
  {
    actors: ['Judy Garland', 'Frank Morgan', 'Ray Bolger'],
    desc: 'Young Dorothy Gale and her dog Toto are swept away by a tornado from their Kansas farm to the magical Land of Oz, and embark on a quest with three new friends to see the Wizard, who can return her to her home and fulfill the other...',
    directors: ['Victor Fleming', 'George Cukor', 'Mervyn LeRoy'],
    genre: ['Adventure', 'Family', 'Fantasy'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BNjUyMTc4MDExMV5BMl5BanBnXkFtZTgwNDg0NDIwMjE@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BNjUyMTc4MDExMV5BMl5BanBnXkFtZTgwNDg0NDIwMjE@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt0032138/',
    name: 'The Wizard of Oz',
    rating: 8.1,
    year: 1939,
  },
];

export const FAKE_AVATARS = [
  'https://media.istockphoto.com/id/1207856385/photo/joyful-happy-african-american-young-man-in-eyeglasses-portrait.jpg?s=612x612&w=0&k=20&c=M5sUFPE5xlF1fMxvNYgAqdpSZYKxSor3-SlF-o6IiJ0=',
  'https://images.unsplash.com/photo-1623184663110-89ba5b565eb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c21pbGluZyUyMG1hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c21pbGluZyUyMG1hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c21pbGluZyUyMG1hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1603208636525-8825c33ed34b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8c21pbGluZyUyMG1hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1562124638-724e13052daf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fHNtaWxpbmclMjBtYW58ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60',
  'https://media.istockphoto.com/id/1353379051/photo/portrait-of-beautiful-mature-african-woman-looking-at-camera-outdoor.jpg?b=1&s=170667a&w=0&k=20&c=BZUbHXf0x6yAQiz6NX8gqauwEgrMlTQ0SqBI8qedH1g=',
  'https://media.istockphoto.com/id/1152603284/photo/african-woman-looking-at-camera.jpg?s=612x612&w=0&k=20&c=oAlZhgAkn0WmU3XClcbnNRNJh5Q19i4wVa-Qk8t_Mhc=',
  'https://img.freepik.com/free-photo/closeup-portrait-beautiful-smiling-brunette-model-trendy-girl-posing-street_158538-17019.jpg',
  'https://www.annettaapol.com/wp-content/uploads/2020/08/happy-woman-smiling.jpg',
  'https://images.unsplash.com/photo-1565148343401-5e4aa8f9c2cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YmxhY2slMjBtYW4lMjBzbWlsZXxlbnwwfHwwfHw%3D&w=1000&q=80',
];

export const FAKE_POSTS = [
  {
    id: uniqueId(),
    title: 'Hidden Gems',
    description: lorem.generateSentences(5),
    image:
      'https://m.media-amazon.com/images/M/MV5BNTIzNGFjMTctMWZjOS00YThlLTg2MjctMjQ3YTY2OGU2MGQ0XkEyXkFqcGdeQXVyNTYwMzA1MjY@._V1_.jpg',
  },
  {
    id: uniqueId(),
    title: 'Money Heist',
    description: lorem.generateSentences(5),
    image:
      'https://static.wikia.nocookie.net/netflix/images/0/0e/MH_S5_Promotional.jpg/revision/latest?cb=20210904021400',
  },
  {
    id: uniqueId(),
    title: 'The last one of us',
    description: lorem.generateSentences(5),
    image:
      'https://www.bshsnews.com/wp-content/uploads/2023/02/content_The_Last_of_Us_Official_Key_Art.jpg',
  },
];

export const FAKE_USERS = range(19).map(e => {
  const username = faker.internet.userName();
  return {
    id: faker.datatype.uuid(),
    avatar: `https://xsgames.co/randomusers/avatar.php?g=${[
      sample(['male', 'female']),
    ]}`,
    username,
    name: startCase(username),
    badge: sample(BADGES),
  };
});

export const FAKE_COMMENTS = range(19).map(e => ({
  id: faker.datatype.uuid(),
  user: sample(FAKE_USERS),
  comment: lorem.generateSentences(random(1, 3)),
}));

export const FAKE_CHATS = range(19).map(e => ({
  id: faker.datatype.uuid(),
  user: sample(FAKE_USERS),
  comment: lorem.generateSentences(1),
}));

export const FAKE_REVIEWS = range(19).map(e => ({
  id: faker.datatype.uuid(),
  user: sample(FAKE_USERS),
  comment: lorem.generateSentences(random(1, 3)),
}));
