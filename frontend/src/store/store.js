import {configureStore} from "@reduxjs/toolkit";
import avatarReducer from './avatarSlice';
import contentReducer from './contentSlice';
import bookmarkReducer from './bookmarkSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

export const store=configureStore({
    reducer:{
        avatar: avatarReducer,
        content: contentReducer,
        bookmark: bookmarkReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
});

