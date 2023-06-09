import {createSlice} from '@reduxjs/toolkit';
import {
  FAKE_COMMENTS,
  FAKE_POSTS,
  FAKE_USERS,
  FAKE_CHATS,
  MOVIES,
  FAKE_REVIEWS,
} from '../utils/mocks';

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    user: FAKE_USERS[0],
    users: FAKE_USERS,
    comments: FAKE_COMMENTS,
    posts: FAKE_POSTS,
    movies: MOVIES,
    chats: FAKE_CHATS,
    reviews: FAKE_REVIEWS,
  },
  reducers: {},
});

export default dataSlice.reducer;
