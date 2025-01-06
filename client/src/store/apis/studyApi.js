import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5173'
    }),
    endpoints(builder){
        return{
            fetchUser: builder.query({
                query: (user) => {
                    return {
                        url: '/auth/current_user',
                        params: {
                            userId: user.id,
                        },
                        method: 'GET',
                    };
                },
            }),
        };
    }

});