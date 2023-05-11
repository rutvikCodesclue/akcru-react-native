import { COLORS, FONTS } from "./Theme";
import imageindex from "../assets/images/imageindex";

export const CATEGORIES = [
  {
    category: 'Movies',
    color: COLORS.CATBLUELGT,
    id: '0'
  },
  {
    category: 'Series',
    color: COLORS.CATPURPLGT,
    id: '1'
  },
  {
    category: 'Special Events',
    color: COLORS.CATREDLGT,
    id: '2'
  },
  {
    category: 'Docu',
    color: COLORS.CATGREENLGT,
    id: '3'
  },
  {
    category: 'Live TV',
    color: COLORS.AKCRUBLUE,
    id: '4'
  },
];

export const MOVIE_GENRES = [
  {
    genre: 'Action',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-action.jpg',
    id: '0'
  },
  {
    genre: 'Adventure',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-adventure.jpg',
    id: '1'
  },
  {
    genre: 'Comedy',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-comedy.jpg',
    id: '2'
  },
  {
    genre: 'Animation',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-animation.jpg',
    id: '3'
  },
  {
    genre: 'Crime',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-crime.jpg',
    id: '4'
  },
  {
    genre: 'Drama',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-drama.jpg',
    id: '5'
  },
  {
    genre: 'Family',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-family.jpg',
    id: '6'
  },
  {
    genre: 'Thriller',
    photo: 'https://priymus.com/wp-content/uploads/2022/08/movie-thriller.jpg',
    id: '7'
  },

];


export const TRENDING_NOW = [
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
    rated: 'NR',
    length: '1h 50m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1889518105/1434659607842-pgv4ql-1651772582630.mp4?Expires=1683423450&Signature=rZBEBFEAEqx5ncNHGfitmHRTlquOE7mq90lX8o9uo3aB2APR-x-atW6qWL~wY3sErfS1YGzfL743hqAUYlRd1F7vT2J2fhIBVc8WEHar~KF0WLKheYH~tTDmBvs1QXkzbv6nNrb6HvNeZDUI7JpvsqLTozOqPiau1f0XTAZOec732hcbcfl0hf2CeaRIgGE53tVonEnUWwH9qrC18GJ-qhfUKQHHntlxxauPybtnfJHKU8F2YUsF3ZQiljKnlC8Zw7dHivc-oC2KQ1og-oVrdIRu9~JBLHrxteHjQ5fPENSmx8T~fUbPC1tNksb0IFCOWobj0ZEGJtZC7qXAwqijbg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '0'
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
    rated: 'NR',
    length: '1h 56m',
    movietrailer:'https://imdb-video.media-imdb.com/vi421183001/1434659607842-pgv4ql-1593515498091.mp4?Expires=1683423701&Signature=PcBnzLszt2RAeXUMpzqe-fSthe7tb~-D3BRkwxW3CF7Z8GU0-QnJmlxnd~el16uVlETINebiao3JAMrmtbxJkayo8QGA4tMng5A35zJk7hYwjQiGNytzmzrtvU4xqOUZCD7C7u7OIBm-3zq4vW5Ywn0AP~OlblAys0zXs7~6qnMjyxbOhJ0--iaEYqxvkMZqv~cKC6ExtphphJVbWwlixSrYKwVDLHwlLfOTxFEAdKIvmJvqnI6yHcwBrtGgMM8qhjsN1yJ7d~vRguPXoMxn8HnCqQGD-~V5TNoVEsy0X5XzBb6s6-xRvD7zF8PHGBWGigAgA-Frol0z2TISe~oUyA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '1'
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
    rated: 'R',
    length: '1h 46m',
    movietrailer:'https://imdb-video.media-imdb.com/vi4006456345/1434659607842-pgv4ql-1616202354600.mp4?Expires=1683424302&Signature=b44dVtygRT5l81kwBlBnCymZog05LjAdcryLW9bkjY4lACg4KJUVnMHObVj0ghksClxSaGYlf4TtC9VRJCQk~Q8hoHzW7MR3grweKVKw1NMY5GtyOqDVhaXgSE3-Ew6nPw5Cfcpa3MCHWSCvHTs4Xw--IpFoVV~PlRp42j~~3g70OKVFFZabyshO0njdkd8ksqkMkq7WmntxJ5HxXets980Gcg9tC71rvcZ~6XdurzeOazOCh6xckavM3CsEqz0TjYKOTV3AyvewA838vgtuAABswn-nJ3owngFLf7pMbJv6etN6phvO-jpYgY6JUG3J75EJOEDFHx9fruwvQNvuiQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '2'
  },
  {
    actors: ['Tom Hardy', 'Nick Nolte', 'Joel Edgerton'],
    desc: 'The youngest son of an alcoholic former boxer returns home, where he\u0026apos;s trained by his father for competition in a mixed martial arts tournament - a path that puts the fighter on a collision course with his estranged, older brother.',
    directors: ["Gavin O'Connor"],
    genre: ['Action', 'Drama', 'Sport'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt1291584/',
    name: 'Warrior',
    rating: 8.2,
    year: 2011,
    rated: 'PG-13',
    length: '2h 20m',
    movietrailer:'https://imdb-video.media-imdb.com/vi339320089/1434659607842-pgv4ql-1616202495162.mp4?Expires=1683425065&Signature=VpIt0Bb4-NTAiSk-~MvAcUFq3Sc5VKgMPJ9~weg2rSPtX~rBsF7heDJxY4uWxM6ejzIhi47~Bjp8pKkdRthnma6BtCFrI0bb0zubenN-CHjC2sBYGIWiH5sjXF3OT-uP8JTS12ENg1h51mHAgxZoNJsza7lfojxnivdJHqxZEHlAHgdrUc6ss4DGwYvQYe32-5N-iDoRJ-UU86c-RAV-tEIE5zY4aJwU4mFxyTSfmXK-9f0Vn~q~3mN1XcXGCh-FRo0SOZWdnwVV2vzaVKSQhr6DTO9PPUy-dULY~2yxZQjYnPnNE7-OjkTf9k8Fk9avGcQqEWdGA7CkodEv-f1dVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '3'
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
    rated: 'G',
    length: '1h 38m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2192703769/1434659607842-pgv4ql-1616203103302.mp4?Expires=1683424670&Signature=I6JfO4WfVIFofB-JD9PaN6CWEQ3R6S~WmRTKB0GkHQ-O5VffUinS2QEAk4HbcqTk7uFQNJa0uiTkpFoQOtxzGkGmaqHRU6bx1oWfJLXcLcBlKoDWsasAIinABRdoFtCy0XQl8Ttk3IcckIRdMRfVTZx0eLy233YBDAz06FvRmBEXu7MDCNEfCbys9WTPdAPknfp9ptuuAZPXx3aVGXrMD8Ad9JuEs~VkGyYOppKYV2thGzk23T98VMBa1qt7IMqiSCUCHYsfLI4gZElhmdJ0QKjSCBugxjKgYmrrmH5zDE4TbqBIMCU4MyJqRjBiPqdcDpGmB6RlCy2aezHnjuRF7A__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '4'
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
    rated: 'PG',
    length: '2h 8m',
    movietrailer:'https://imdb-video.media-imdb.com/vi216072473/1434659607842-pgv4ql-1564539842710.mp4?Expires=1683424731&Signature=qxTURZBaGaOEK-nm1R2w7vf7~sfXcc0P0vtyHC-YnFgL72-Zxag6eizsiuXYx3ePJh5CFKZitkRo~IustTStTVvrFls-r5lR7fWTEbeaBsHECh5PORaauvkCY3mqa1dkPnzhDFgsRkrteZsdF0psrC-sR9yAPtTaNtZE9EnlzGrhJydRry-Y6Pe5OzOseIx72qVqzQsEzWUbLPazCqTGw9QfcUqOXzJJXjC-RIL2AB5Fjm2WP8aIKZwfklMKaEVzC1v8jXr2MB97mKeg2UYSvCWX8VDrPQm25szdEUTrAimCUPHosEGR9YYr5gqhkVWPl5aj~yd71jhyqwFrwb~kKQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '5'
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
    rated: 'R',
    length: '2h 12m',
    movietrailer:'https://imdb-video.media-imdb.com/vi4276093209/1434659607842-pgv4ql-1564222183608.mp4?Expires=1683424798&Signature=pyO-aIhcTdBm5dt4eckknBDrbqjJRBXtR6SPcbSGIAkov5O9IZpALcyjn8bPPME2LKjLwhDQBsRna3wj~rJ2w5AMahyfqO4zKHKy53XyqDMLgiuXvXFvaIfddFM9UCK9OT0i3pSblhAX5TBVTI4MqLpTNQt5tnlW9Ccv0Auhua8GgSgBxG-C2H9DowvzaLFJEGtcJImX0GAkNDGiIb7XPLb6E2r-md1i0mhFWlijz6-sn4xF1hHjtCWin42VapF0vMk4VO~xaREL0RQ7N0HzCh1DSC1UEALc0c9O2pdSoZUJ16pZ8m858~EU-cFwX6~P1cNifoAFC~7kwNfTUXcnRA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '6'
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
    rated: 'PG',
    length: '1h 36m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2557280793/1434659607842-pgv4ql-1616202516390.mp4?Expires=1683424936&Signature=mJMSGrYfkUSlEPg5o5hGq8jhEyEUypGpfhq20smrr76FGe7uLmnuEPKAKKkCFO-Mu7YjL-~JKHM3yvHWYX8~YmQogf702-1rO5ZTBmD-OeCCURXlafXD41fHZvVT6KYVjEOJkoRuMH1d9SguISHfDXKOHAyAiYGVrUQ4F0xWelP7l6H08XeGm0a1KwH61zC4rq1mCgrTyGiWATI3Grhp8PJ3WceWJarV9F3Gs9ftD1Y2a94Dc3Bm2ymynsCH0U7AnCbJjBgFMXRZ5MGpTvHnVgRn4nQmOuOweGJxVa00aGrav5kgKXAEVf8pGywJ8VtargiKsLty1HdCYTEredu14A__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '7'
  },
  
];

export const TOP_AKCRU_WATCHLIST = [
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
    rated: 'R',
    length: '2h 10m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3445406489/1434659607842-pgv4ql-1536964844984.mp4?Expires=1683425047&Signature=UEp1VC7mm6xq1kk1kv3TV1GznFlDwjRsI96TeXTBEVEkaHAR6UzWtEEtsZjOw2PLiwZDekoXR6uX76rg2jswNDKpKw0jpuDp2cH7h~mEK63lkRIyZ8hshrYrxIm6DiERHSh1y4n6jlgTqO00q7nXmmDxkw~us6rzKqq0bU7NEQLERqZCDFz3fMIKQ0ipCXtKOQrEZg1jVDH7Y8FO~cNacjzgzfQzOesCbKJEtcKsufCdHrhlSnECNkxSAjOuTH6mKkdZLWCYSa3-CScqUF8uUTSyszobMnAMzYpNysuWQWSETMKC7x~fsp6r9rKykYyTyzqGlHlaax9pVWcD24koDA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '0'
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
    rated: 'NR',
    length: '2h 16m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2320022553/1434659607842-pgv4ql-1565971414566.mp4?Expires=1683425593&Signature=BgM4GCMY~biQA3h9Q1FyQA6cfW3JVw-Iw4wCbImozEco6-mzdAYl-PLHfTAkQkPCsUtUcyq2UE-t7VxxuqbuZ~wxwkQFMH~xhiqASR2kZ7Gt~YqzSKC11lp9ZU5iaE7kxzaqhpJbwtTQqbN~VpmA4cmaKVjJwcFQnOY8uQ9OE12kEC~PdLhB1DHxXirzWuvyLjTsUBIKniOUXCLadJ7YIi6Fs5JmAaFT0VkMJV3n6vmVu545P-Oycpx07PCrPuJwOzafgRuhG6IpjvpBP2CilzhnkZbKqBiJw8dqhoplM2s1~8OWluJ0S7fTRxcAAJhxpVGFCPfilzUMPbxT4MqMzw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '1'
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
    rated: 'R',
    length: '1h 36m',
    movietrailer:'',
    id: '2'
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
    rated: 'G',
    length: '1h 43m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3676898329/1434659607842-pgv4ql-1616203302774.mp4?Expires=1683425087&Signature=OO9D3V~TtyTtZBmovK5pI8Sz~OQs9cn2aYYwct88SzOpw7PB6MenTZfX0vwhCQSiY7ikkm2p7HSKIM6Foxa2sX3hpF0PFInik7XDugIGLKM5PCh8O-WWkGrFrlwP86IIN23ZPh1l6nPCs83E2zEGvNkJjkh~jBIkJ5aw1Lf24WbLKN0avbc8kqZH8GY72eGbFCWeTYnTQtxFJMqS6BjjQ39sNffzG~fifdLL90ngV3ma6fBYwfVQTgi~x48uVUVk61XMV1gKmsnhaWfCXGxwEFauAEqu~A7CPluB7gbQyggO8umzNbFW8uQAW-IQh3Efd9GWcJahQRu6V6O6ZzQqZQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '3'
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
    rated: 'G',
    length: '1h 21m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2052129305/MV5BNjQzMDM2MzQyNV5BMTFeQW1wNF5BbWU3MDI1MDk3OTY@.mp4?Expires=1683425418&Signature=o0cSQw6zM9mv799jT8TcAzyvY8~UQvtCLhwh2BAHgZdLoBAv0SOcx9bo80onAQKFT5VI5LQFwJJ4MFbXoSakNpqhzVhH9927wdeSRN8vGlxWn2ybbrnPZcjHuFKOUD9qWKgfzRnIkapIjjQiStdQjuiPObR-m8J0EyCZLu7hbWMwaeppzQPOBYPSv83jn7vySBWnCYFpsgQEqE-ZLhrzJNT7ZtkwrfMPF~wlf1v8TKiDa5HPJLg~i1Nyc-QkoXud9u8ffkntk0O5rdyYqrXfzaP0QEdIK56GlyeRXFnTXQmmA2o3SOG184rTwg~ZdldBKmv-ZFLBkrlacrhGNoDrSg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '4'
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
    rated: 'PG-13',
    length: '2h 10m',
    movietrailer:'https://m.media-amazon.com/images/I/A1zEwWjAM7L.mp4',
    id: '5'
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
    rated: 'G',
    length: '1h 26m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3871916313/1434659607842-pgv4ql-1605706096871.mp4?Expires=1683425848&Signature=rnCz-yxdSQn9wD9D-nYIkkoIlUfwTWy2U7cFsy9ZLhL08mEOdLhXakgWPbtMKNifThlPoIgm7gK1dQ6y9ICoRw1KQfCty~2Svz-gGayWPxeCM14xLsU0UXSGzxtq7mBY6h5bf~caNHc5i1Ij5Y2~P28pZ6vtb~axespe2XM8aMj9HfuxojpeRbLCPzJERS3-MoPhUAfh7XuRze~1eSotFCxRSueUKZsJOfEPA1IyGs5iGPTrGjQz1vQCRUNjVCD0F7tE465pwA9eBm0sg2FrjUsMa~-U8JAp7~PYcm5g2MNEWfhyt6EfdaSp8AwGG4MmiFuyVLfyczyAkrjMCNBQZw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '6'
  },
  
];

export const NEW_ON_AKCRU = [
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
    rated: 'NR',
    length: '2h 9m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1222941977/1434659607842-pgv4ql-1616202919506.mp4?Expires=1683426158&Signature=UH3GN5YDR9nobTHUXg5WxeMmTl6UmYjOrGTWvvGBqKfAE0v3RKBsWIc13ADLNVq19GfX-BSjB4xeOjJJoI9BThZ1tMU4jsJU1xqgdS1ufzaUROkIGhtSR5ZE9Cm8SWxXgjsY1rxB5KWheNlBPvybKUkoEgiSYqKlU1MfPlGS7dc6Quffc~Uq6jmb5W51syX51psIiBgoY8WWvPbSSXUD6ZuJ7MIYmoG6oJYBZWBsuEZy61XByUL3PC0ZBN7k3~drqA2Yyr73om~uSpZg~prVtpv2EWWphJzOoGrARSFxQsZmlDVB8MkmF2BrdO9O-4gFNWWz2wca9KrqonfcnMQwPg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '15'
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
    rated: 'NR',
    length: '1h 39m',
    movietrailer:'',
    id: '16'
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
    rated: 'R',
    length: '1h 55m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3585980441/1434659607842-pgv4ql-1511221571104.mp4?Expires=1683426125&Signature=umoYkorTg~~dIFmWosoMJ74R4TKaDqU--kA7btxOiP95H9Q8mJam0HY-Ed4ybxx-61bxlS9qaRAGnrTnpBvhYXWzmpczKAO7gnXHlptAF6wxSurK8rtUVUmx3nj7XSxQRPL4pX9k5hbYBhaol83l5W8ysVuJi4vhzML~es~D~Ycj5sMuQqCGlDZm8Hdx~6xZE4kmDHqeo~yrbHjttruE8dDjTk3bR~PtLsyiqyVvLqY7pQNQu43HiZEs1ybum7kXGv1uxPWNJl4gFCFYZFNybK7dUKGnbDqS8i2DqFRDj9-RVg3YWc7Xny4paq~cNzIQxYAPkREKiwNGSFu3L-MkjA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '17'
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
    rated: 'R',
    length: '2h 38m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1341980953/1434659607842-pgv4ql-1563567763704.mp4?Expires=1683426238&Signature=A57bIU766PC1~2yfpgOxBpAwPAYl~4EWEXP7E1EWNH13M7yucf-ZJt0QIlDPzv6RY-XuUdkMDz7qeESBfZqH7Jl~urugfnyPpeiLSaC3h3tyyRwy6UhHkCD8DliN57Z3OU0qTFKnit6wVU~9FCg~jzxqwWAKwZ2icvolfTHFw1nBTzc2OSGZ8mD~qAnCCtC6RZJZX6lLZtafqXz0FHl2c9CVS7bH6LowvFDPfgD~gCodoU3pSogkk3cMSTkg0YuQ9QHHPMxbdD1DSL0q2gYq~trOiKRygaeHnu-Ecs3WvzvuVh7V3aszn~CtdCjBUKV1IYbw-3M3yzJY7cWgpOaDVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '18'
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
    rated: 'R',
    length: '3h',
    movietrailer:'https://imdb-video.media-imdb.com/vi2312218649/1434659607842-pgv4ql-1616202335617.mp4?Expires=1683425767&Signature=ncTt51r2y2SvSHhPypY2IHfAB~erl5WEG3Dipms9TmkTCWlE7g-EZDRv4WhV23TG5erOfyyY8OuLBI8UXpxEt8y~yfeg7Yv1CCMUso8PNCpI~EsWWBJyGK6os8wsMBJXAj1i8CHqj99RyAV8GSz~Sp5wrwFldFdtXeEpX1OIMChsTW9KlN1GCAMv6k4QoJU8DurQggw~Ku~D1oSBn4mPPoDZR2T4OQ45PlhvrlDvSER1Rlm0wLWTEgtSzC3HurgzwXOTqBVU4RgHVW6oExN~s8rEyJ-dGAlnDcUQdcz6VbaNzQD0h6ynwIAp2JN5xKyg67FUmYx6NqO-0y8SjM8mAA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '19'
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
    rated: 'G',
    length: '1h 42m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2210441241/1434659607842-pgv4ql-1564209095791.mp4?Expires=1683426315&Signature=PhwK8gmRBP9k6~d6mL09CTUMPSg1JR~-0xBFbMYeCYTh8HDI8EZ6LLKJX5PKXb2ZKEfdHpb5D~AvXm6PTa4lKRB6l~XRE1tP0XhYLt~X0K0aMgjy97RYGpRbyUuPgc--xsL4WqGnUreRBxN6qQ5Ax8C4ga0n-3gVL-Gix~ycINpUGwFTn6OGrfNQaSKAF1Zf-AYSC6VORo51LIHFJE~gFJ9FCSruZoWYbBO34pOKpFr9qhj3WfrahIIWQHkatbMcmfZkO~ZuWh76Zb7cFLxHFlk9GEmeuU5tWcMLvVdf5a8T1-1i4sx9sodwjBc8EDqn-5ydke3Qp~VwWNhc10kaVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '20'
  },
  
];

export const RECOMMENDED_FOR_YOU = [
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
    rated: 'R',
    length: '3h',
    movietrailer:'https://imdb-video.media-imdb.com/vi2312218649/1434659607842-pgv4ql-1616202335617.mp4?Expires=1683425767&Signature=ncTt51r2y2SvSHhPypY2IHfAB~erl5WEG3Dipms9TmkTCWlE7g-EZDRv4WhV23TG5erOfyyY8OuLBI8UXpxEt8y~yfeg7Yv1CCMUso8PNCpI~EsWWBJyGK6os8wsMBJXAj1i8CHqj99RyAV8GSz~Sp5wrwFldFdtXeEpX1OIMChsTW9KlN1GCAMv6k4QoJU8DurQggw~Ku~D1oSBn4mPPoDZR2T4OQ45PlhvrlDvSER1Rlm0wLWTEgtSzC3HurgzwXOTqBVU4RgHVW6oExN~s8rEyJ-dGAlnDcUQdcz6VbaNzQD0h6ynwIAp2JN5xKyg67FUmYx6NqO-0y8SjM8mAA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '19'
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
    rated: 'G',
    length: '1h 42m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2210441241/1434659607842-pgv4ql-1564209095791.mp4?Expires=1683426315&Signature=PhwK8gmRBP9k6~d6mL09CTUMPSg1JR~-0xBFbMYeCYTh8HDI8EZ6LLKJX5PKXb2ZKEfdHpb5D~AvXm6PTa4lKRB6l~XRE1tP0XhYLt~X0K0aMgjy97RYGpRbyUuPgc--xsL4WqGnUreRBxN6qQ5Ax8C4ga0n-3gVL-Gix~ycINpUGwFTn6OGrfNQaSKAF1Zf-AYSC6VORo51LIHFJE~gFJ9FCSruZoWYbBO34pOKpFr9qhj3WfrahIIWQHkatbMcmfZkO~ZuWh76Zb7cFLxHFlk9GEmeuU5tWcMLvVdf5a8T1-1i4sx9sodwjBc8EDqn-5ydke3Qp~VwWNhc10kaVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '20'
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
    rated: 'G',
    length: '1h 43m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3676898329/1434659607842-pgv4ql-1616203302774.mp4?Expires=1683425087&Signature=OO9D3V~TtyTtZBmovK5pI8Sz~OQs9cn2aYYwct88SzOpw7PB6MenTZfX0vwhCQSiY7ikkm2p7HSKIM6Foxa2sX3hpF0PFInik7XDugIGLKM5PCh8O-WWkGrFrlwP86IIN23ZPh1l6nPCs83E2zEGvNkJjkh~jBIkJ5aw1Lf24WbLKN0avbc8kqZH8GY72eGbFCWeTYnTQtxFJMqS6BjjQ39sNffzG~fifdLL90ngV3ma6fBYwfVQTgi~x48uVUVk61XMV1gKmsnhaWfCXGxwEFauAEqu~A7CPluB7gbQyggO8umzNbFW8uQAW-IQh3Efd9GWcJahQRu6V6O6ZzQqZQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '11'
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
    rated: 'G',
    length: '1h 21m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2052129305/MV5BNjQzMDM2MzQyNV5BMTFeQW1wNF5BbWU3MDI1MDk3OTY@.mp4?Expires=1683425418&Signature=o0cSQw6zM9mv799jT8TcAzyvY8~UQvtCLhwh2BAHgZdLoBAv0SOcx9bo80onAQKFT5VI5LQFwJJ4MFbXoSakNpqhzVhH9927wdeSRN8vGlxWn2ybbrnPZcjHuFKOUD9qWKgfzRnIkapIjjQiStdQjuiPObR-m8J0EyCZLu7hbWMwaeppzQPOBYPSv83jn7vySBWnCYFpsgQEqE-ZLhrzJNT7ZtkwrfMPF~wlf1v8TKiDa5HPJLg~i1Nyc-QkoXud9u8ffkntk0O5rdyYqrXfzaP0QEdIK56GlyeRXFnTXQmmA2o3SOG184rTwg~ZdldBKmv-ZFLBkrlacrhGNoDrSg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '12'
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
    rated: 'PG-13',
    length: '2h 10m',
    movietrailer:'https://m.media-amazon.com/images/I/A1zEwWjAM7L.mp4',
    id: '13'
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
    rated: 'G',
    length: '1h 26m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3871916313/1434659607842-pgv4ql-1605706096871.mp4?Expires=1683425848&Signature=rnCz-yxdSQn9wD9D-nYIkkoIlUfwTWy2U7cFsy9ZLhL08mEOdLhXakgWPbtMKNifThlPoIgm7gK1dQ6y9ICoRw1KQfCty~2Svz-gGayWPxeCM14xLsU0UXSGzxtq7mBY6h5bf~caNHc5i1Ij5Y2~P28pZ6vtb~axespe2XM8aMj9HfuxojpeRbLCPzJERS3-MoPhUAfh7XuRze~1eSotFCxRSueUKZsJOfEPA1IyGs5iGPTrGjQz1vQCRUNjVCD0F7tE465pwA9eBm0sg2FrjUsMa~-U8JAp7~PYcm5g2MNEWfhyt6EfdaSp8AwGG4MmiFuyVLfyczyAkrjMCNBQZw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '14'
  },
  
];

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
    rated: 'NR',
    length: '1h 50m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1889518105/1434659607842-pgv4ql-1651772582630.mp4?Expires=1683423450&Signature=rZBEBFEAEqx5ncNHGfitmHRTlquOE7mq90lX8o9uo3aB2APR-x-atW6qWL~wY3sErfS1YGzfL743hqAUYlRd1F7vT2J2fhIBVc8WEHar~KF0WLKheYH~tTDmBvs1QXkzbv6nNrb6HvNeZDUI7JpvsqLTozOqPiau1f0XTAZOec732hcbcfl0hf2CeaRIgGE53tVonEnUWwH9qrC18GJ-qhfUKQHHntlxxauPybtnfJHKU8F2YUsF3ZQiljKnlC8Zw7dHivc-oC2KQ1og-oVrdIRu9~JBLHrxteHjQ5fPENSmx8T~fUbPC1tNksb0IFCOWobj0ZEGJtZC7qXAwqijbg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '0'
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
    rated: 'NR',
    length: '1h 56m',
    movietrailer:'https://imdb-video.media-imdb.com/vi421183001/1434659607842-pgv4ql-1593515498091.mp4?Expires=1683423701&Signature=PcBnzLszt2RAeXUMpzqe-fSthe7tb~-D3BRkwxW3CF7Z8GU0-QnJmlxnd~el16uVlETINebiao3JAMrmtbxJkayo8QGA4tMng5A35zJk7hYwjQiGNytzmzrtvU4xqOUZCD7C7u7OIBm-3zq4vW5Ywn0AP~OlblAys0zXs7~6qnMjyxbOhJ0--iaEYqxvkMZqv~cKC6ExtphphJVbWwlixSrYKwVDLHwlLfOTxFEAdKIvmJvqnI6yHcwBrtGgMM8qhjsN1yJ7d~vRguPXoMxn8HnCqQGD-~V5TNoVEsy0X5XzBb6s6-xRvD7zF8PHGBWGigAgA-Frol0z2TISe~oUyA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '1'
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
    rated: 'R',
    length: '1h 46m',
    movietrailer:'https://imdb-video.media-imdb.com/vi4006456345/1434659607842-pgv4ql-1616202354600.mp4?Expires=1683424302&Signature=b44dVtygRT5l81kwBlBnCymZog05LjAdcryLW9bkjY4lACg4KJUVnMHObVj0ghksClxSaGYlf4TtC9VRJCQk~Q8hoHzW7MR3grweKVKw1NMY5GtyOqDVhaXgSE3-Ew6nPw5Cfcpa3MCHWSCvHTs4Xw--IpFoVV~PlRp42j~~3g70OKVFFZabyshO0njdkd8ksqkMkq7WmntxJ5HxXets980Gcg9tC71rvcZ~6XdurzeOazOCh6xckavM3CsEqz0TjYKOTV3AyvewA838vgtuAABswn-nJ3owngFLf7pMbJv6etN6phvO-jpYgY6JUG3J75EJOEDFHx9fruwvQNvuiQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '2'
  },
  {
    actors: ['Tom Hardy', 'Nick Nolte', 'Joel Edgerton'],
    desc: "The youngest son of an alcoholic former boxer returns home, where he's trained by his father for competition in a mixed martial arts tournament - a path that puts the fighter on a collision course with his estranged, older brother.",
    directors: ["Gavin O'Connor"],
    genre: ['Action', 'Drama', 'Sport'],
    image_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_.jpg',
    thumb_url:
      'https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_UX182_CR0,0,182,268_AL__QL50.jpg',
    imdb_url: '/title/tt1291584/',
    name: 'Warrior',
    rating: 8.2,
    year: 2011,
    rated: 'PG-13',
    length: '2h 20m',
    movietrailer:'https://imdb-video.media-imdb.com/vi339320089/1434659607842-pgv4ql-1616202495162.mp4?Expires=1683425065&Signature=VpIt0Bb4-NTAiSk-~MvAcUFq3Sc5VKgMPJ9~weg2rSPtX~rBsF7heDJxY4uWxM6ejzIhi47~Bjp8pKkdRthnma6BtCFrI0bb0zubenN-CHjC2sBYGIWiH5sjXF3OT-uP8JTS12ENg1h51mHAgxZoNJsza7lfojxnivdJHqxZEHlAHgdrUc6ss4DGwYvQYe32-5N-iDoRJ-UU86c-RAV-tEIE5zY4aJwU4mFxyTSfmXK-9f0Vn~q~3mN1XcXGCh-FRo0SOZWdnwVV2vzaVKSQhr6DTO9PPUy-dULY~2yxZQjYnPnNE7-OjkTf9k8Fk9avGcQqEWdGA7CkodEv-f1dVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '3'
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
    rated: 'G',
    length: '1h 38m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2192703769/1434659607842-pgv4ql-1616203103302.mp4?Expires=1683424670&Signature=I6JfO4WfVIFofB-JD9PaN6CWEQ3R6S~WmRTKB0GkHQ-O5VffUinS2QEAk4HbcqTk7uFQNJa0uiTkpFoQOtxzGkGmaqHRU6bx1oWfJLXcLcBlKoDWsasAIinABRdoFtCy0XQl8Ttk3IcckIRdMRfVTZx0eLy233YBDAz06FvRmBEXu7MDCNEfCbys9WTPdAPknfp9ptuuAZPXx3aVGXrMD8Ad9JuEs~VkGyYOppKYV2thGzk23T98VMBa1qt7IMqiSCUCHYsfLI4gZElhmdJ0QKjSCBugxjKgYmrrmH5zDE4TbqBIMCU4MyJqRjBiPqdcDpGmB6RlCy2aezHnjuRF7A__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '4'
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
    rated: 'PG',
    length: '2h 8m',
    movietrailer:'https://imdb-video.media-imdb.com/vi216072473/1434659607842-pgv4ql-1564539842710.mp4?Expires=1683424731&Signature=qxTURZBaGaOEK-nm1R2w7vf7~sfXcc0P0vtyHC-YnFgL72-Zxag6eizsiuXYx3ePJh5CFKZitkRo~IustTStTVvrFls-r5lR7fWTEbeaBsHECh5PORaauvkCY3mqa1dkPnzhDFgsRkrteZsdF0psrC-sR9yAPtTaNtZE9EnlzGrhJydRry-Y6Pe5OzOseIx72qVqzQsEzWUbLPazCqTGw9QfcUqOXzJJXjC-RIL2AB5Fjm2WP8aIKZwfklMKaEVzC1v8jXr2MB97mKeg2UYSvCWX8VDrPQm25szdEUTrAimCUPHosEGR9YYr5gqhkVWPl5aj~yd71jhyqwFrwb~kKQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '5'
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
    rated: 'R',
    length: '2h 12m',
    movietrailer:'https://imdb-video.media-imdb.com/vi4276093209/1434659607842-pgv4ql-1564222183608.mp4?Expires=1683424798&Signature=pyO-aIhcTdBm5dt4eckknBDrbqjJRBXtR6SPcbSGIAkov5O9IZpALcyjn8bPPME2LKjLwhDQBsRna3wj~rJ2w5AMahyfqO4zKHKy53XyqDMLgiuXvXFvaIfddFM9UCK9OT0i3pSblhAX5TBVTI4MqLpTNQt5tnlW9Ccv0Auhua8GgSgBxG-C2H9DowvzaLFJEGtcJImX0GAkNDGiIb7XPLb6E2r-md1i0mhFWlijz6-sn4xF1hHjtCWin42VapF0vMk4VO~xaREL0RQ7N0HzCh1DSC1UEALc0c9O2pdSoZUJ16pZ8m858~EU-cFwX6~P1cNifoAFC~7kwNfTUXcnRA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '6'
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
    rated: 'PG',
    length: '1h 36m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2557280793/1434659607842-pgv4ql-1616202516390.mp4?Expires=1683424936&Signature=mJMSGrYfkUSlEPg5o5hGq8jhEyEUypGpfhq20smrr76FGe7uLmnuEPKAKKkCFO-Mu7YjL-~JKHM3yvHWYX8~YmQogf702-1rO5ZTBmD-OeCCURXlafXD41fHZvVT6KYVjEOJkoRuMH1d9SguISHfDXKOHAyAiYGVrUQ4F0xWelP7l6H08XeGm0a1KwH61zC4rq1mCgrTyGiWATI3Grhp8PJ3WceWJarV9F3Gs9ftD1Y2a94Dc3Bm2ymynsCH0U7AnCbJjBgFMXRZ5MGpTvHnVgRn4nQmOuOweGJxVa00aGrav5kgKXAEVf8pGywJ8VtargiKsLty1HdCYTEredu14A__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '7'
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
    rated: 'R',
    length: '2h 10m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3445406489/1434659607842-pgv4ql-1536964844984.mp4?Expires=1683425047&Signature=UEp1VC7mm6xq1kk1kv3TV1GznFlDwjRsI96TeXTBEVEkaHAR6UzWtEEtsZjOw2PLiwZDekoXR6uX76rg2jswNDKpKw0jpuDp2cH7h~mEK63lkRIyZ8hshrYrxIm6DiERHSh1y4n6jlgTqO00q7nXmmDxkw~us6rzKqq0bU7NEQLERqZCDFz3fMIKQ0ipCXtKOQrEZg1jVDH7Y8FO~cNacjzgzfQzOesCbKJEtcKsufCdHrhlSnECNkxSAjOuTH6mKkdZLWCYSa3-CScqUF8uUTSyszobMnAMzYpNysuWQWSETMKC7x~fsp6r9rKykYyTyzqGlHlaax9pVWcD24koDA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '8'
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
    rated: 'NR',
    length: '2h 16m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2320022553/1434659607842-pgv4ql-1565971414566.mp4?Expires=1683425593&Signature=BgM4GCMY~biQA3h9Q1FyQA6cfW3JVw-Iw4wCbImozEco6-mzdAYl-PLHfTAkQkPCsUtUcyq2UE-t7VxxuqbuZ~wxwkQFMH~xhiqASR2kZ7Gt~YqzSKC11lp9ZU5iaE7kxzaqhpJbwtTQqbN~VpmA4cmaKVjJwcFQnOY8uQ9OE12kEC~PdLhB1DHxXirzWuvyLjTsUBIKniOUXCLadJ7YIi6Fs5JmAaFT0VkMJV3n6vmVu545P-Oycpx07PCrPuJwOzafgRuhG6IpjvpBP2CilzhnkZbKqBiJw8dqhoplM2s1~8OWluJ0S7fTRxcAAJhxpVGFCPfilzUMPbxT4MqMzw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '9'
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
    rated: 'R',
    length: '1h 36m',
    movietrailer:'',
    id: '10'
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
    rated: 'G',
    length: '1h 43m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3676898329/1434659607842-pgv4ql-1616203302774.mp4?Expires=1683425087&Signature=OO9D3V~TtyTtZBmovK5pI8Sz~OQs9cn2aYYwct88SzOpw7PB6MenTZfX0vwhCQSiY7ikkm2p7HSKIM6Foxa2sX3hpF0PFInik7XDugIGLKM5PCh8O-WWkGrFrlwP86IIN23ZPh1l6nPCs83E2zEGvNkJjkh~jBIkJ5aw1Lf24WbLKN0avbc8kqZH8GY72eGbFCWeTYnTQtxFJMqS6BjjQ39sNffzG~fifdLL90ngV3ma6fBYwfVQTgi~x48uVUVk61XMV1gKmsnhaWfCXGxwEFauAEqu~A7CPluB7gbQyggO8umzNbFW8uQAW-IQh3Efd9GWcJahQRu6V6O6ZzQqZQ__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '11'
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
    rated: 'G',
    length: '1h 21m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2052129305/MV5BNjQzMDM2MzQyNV5BMTFeQW1wNF5BbWU3MDI1MDk3OTY@.mp4?Expires=1683425418&Signature=o0cSQw6zM9mv799jT8TcAzyvY8~UQvtCLhwh2BAHgZdLoBAv0SOcx9bo80onAQKFT5VI5LQFwJJ4MFbXoSakNpqhzVhH9927wdeSRN8vGlxWn2ybbrnPZcjHuFKOUD9qWKgfzRnIkapIjjQiStdQjuiPObR-m8J0EyCZLu7hbWMwaeppzQPOBYPSv83jn7vySBWnCYFpsgQEqE-ZLhrzJNT7ZtkwrfMPF~wlf1v8TKiDa5HPJLg~i1Nyc-QkoXud9u8ffkntk0O5rdyYqrXfzaP0QEdIK56GlyeRXFnTXQmmA2o3SOG184rTwg~ZdldBKmv-ZFLBkrlacrhGNoDrSg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '12'
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
    rated: 'PG-13',
    length: '2h 10m',
    movietrailer:'https://m.media-amazon.com/images/I/A1zEwWjAM7L.mp4',
    id: '13'
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
    rated: 'G',
    length: '1h 26m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3871916313/1434659607842-pgv4ql-1605706096871.mp4?Expires=1683425848&Signature=rnCz-yxdSQn9wD9D-nYIkkoIlUfwTWy2U7cFsy9ZLhL08mEOdLhXakgWPbtMKNifThlPoIgm7gK1dQ6y9ICoRw1KQfCty~2Svz-gGayWPxeCM14xLsU0UXSGzxtq7mBY6h5bf~caNHc5i1Ij5Y2~P28pZ6vtb~axespe2XM8aMj9HfuxojpeRbLCPzJERS3-MoPhUAfh7XuRze~1eSotFCxRSueUKZsJOfEPA1IyGs5iGPTrGjQz1vQCRUNjVCD0F7tE465pwA9eBm0sg2FrjUsMa~-U8JAp7~PYcm5g2MNEWfhyt6EfdaSp8AwGG4MmiFuyVLfyczyAkrjMCNBQZw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '14'
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
    rated: 'NR',
    length: '2h 9m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1222941977/1434659607842-pgv4ql-1616202919506.mp4?Expires=1683426158&Signature=UH3GN5YDR9nobTHUXg5WxeMmTl6UmYjOrGTWvvGBqKfAE0v3RKBsWIc13ADLNVq19GfX-BSjB4xeOjJJoI9BThZ1tMU4jsJU1xqgdS1ufzaUROkIGhtSR5ZE9Cm8SWxXgjsY1rxB5KWheNlBPvybKUkoEgiSYqKlU1MfPlGS7dc6Quffc~Uq6jmb5W51syX51psIiBgoY8WWvPbSSXUD6ZuJ7MIYmoG6oJYBZWBsuEZy61XByUL3PC0ZBN7k3~drqA2Yyr73om~uSpZg~prVtpv2EWWphJzOoGrARSFxQsZmlDVB8MkmF2BrdO9O-4gFNWWz2wca9KrqonfcnMQwPg__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '15'
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
    rated: 'NR',
    length: '1h 39m',
    movietrailer:'',
    id: '16'
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
    rated: 'R',
    length: '1h 55m',
    movietrailer:'https://imdb-video.media-imdb.com/vi3585980441/1434659607842-pgv4ql-1511221571104.mp4?Expires=1683426125&Signature=umoYkorTg~~dIFmWosoMJ74R4TKaDqU--kA7btxOiP95H9Q8mJam0HY-Ed4ybxx-61bxlS9qaRAGnrTnpBvhYXWzmpczKAO7gnXHlptAF6wxSurK8rtUVUmx3nj7XSxQRPL4pX9k5hbYBhaol83l5W8ysVuJi4vhzML~es~D~Ycj5sMuQqCGlDZm8Hdx~6xZE4kmDHqeo~yrbHjttruE8dDjTk3bR~PtLsyiqyVvLqY7pQNQu43HiZEs1ybum7kXGv1uxPWNJl4gFCFYZFNybK7dUKGnbDqS8i2DqFRDj9-RVg3YWc7Xny4paq~cNzIQxYAPkREKiwNGSFu3L-MkjA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '17'
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
    rated: 'R',
    length: '2h 38m',
    movietrailer:'https://imdb-video.media-imdb.com/vi1341980953/1434659607842-pgv4ql-1563567763704.mp4?Expires=1683426238&Signature=A57bIU766PC1~2yfpgOxBpAwPAYl~4EWEXP7E1EWNH13M7yucf-ZJt0QIlDPzv6RY-XuUdkMDz7qeESBfZqH7Jl~urugfnyPpeiLSaC3h3tyyRwy6UhHkCD8DliN57Z3OU0qTFKnit6wVU~9FCg~jzxqwWAKwZ2icvolfTHFw1nBTzc2OSGZ8mD~qAnCCtC6RZJZX6lLZtafqXz0FHl2c9CVS7bH6LowvFDPfgD~gCodoU3pSogkk3cMSTkg0YuQ9QHHPMxbdD1DSL0q2gYq~trOiKRygaeHnu-Ecs3WvzvuVh7V3aszn~CtdCjBUKV1IYbw-3M3yzJY7cWgpOaDVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '18'
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
    rated: 'R',
    length: '3h',
    movietrailer:'https://imdb-video.media-imdb.com/vi2312218649/1434659607842-pgv4ql-1616202335617.mp4?Expires=1683425767&Signature=ncTt51r2y2SvSHhPypY2IHfAB~erl5WEG3Dipms9TmkTCWlE7g-EZDRv4WhV23TG5erOfyyY8OuLBI8UXpxEt8y~yfeg7Yv1CCMUso8PNCpI~EsWWBJyGK6os8wsMBJXAj1i8CHqj99RyAV8GSz~Sp5wrwFldFdtXeEpX1OIMChsTW9KlN1GCAMv6k4QoJU8DurQggw~Ku~D1oSBn4mPPoDZR2T4OQ45PlhvrlDvSER1Rlm0wLWTEgtSzC3HurgzwXOTqBVU4RgHVW6oExN~s8rEyJ-dGAlnDcUQdcz6VbaNzQD0h6ynwIAp2JN5xKyg67FUmYx6NqO-0y8SjM8mAA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '19'
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
    rated: 'G',
    length: '1h 42m',
    movietrailer:'https://imdb-video.media-imdb.com/vi2210441241/1434659607842-pgv4ql-1564209095791.mp4?Expires=1683426315&Signature=PhwK8gmRBP9k6~d6mL09CTUMPSg1JR~-0xBFbMYeCYTh8HDI8EZ6LLKJX5PKXb2ZKEfdHpb5D~AvXm6PTa4lKRB6l~XRE1tP0XhYLt~X0K0aMgjy97RYGpRbyUuPgc--xsL4WqGnUreRBxN6qQ5Ax8C4ga0n-3gVL-Gix~ycINpUGwFTn6OGrfNQaSKAF1Zf-AYSC6VORo51LIHFJE~gFJ9FCSruZoWYbBO34pOKpFr9qhj3WfrahIIWQHkatbMcmfZkO~ZuWh76Zb7cFLxHFlk9GEmeuU5tWcMLvVdf5a8T1-1i4sx9sodwjBc8EDqn-5ydke3Qp~VwWNhc10kaVA__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA',
    id: '20'
  },
];
