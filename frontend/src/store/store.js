import {configureStore} from "@reduxjs/toolkit";
import avatarReducer from './avatarSlice';
import contentReducer from './contentSlice';
import specimenmarkReducer from './specimenmarkSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

export const store=configureStore({
    reducer:{
        avatar: avatarReducer,
        content: contentReducer,
        specimenmark: specimenmarkReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
});

