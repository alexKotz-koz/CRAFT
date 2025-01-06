import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { values } from 'lodash';

const authApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5173'
    }),
    endpoints(builder){
        return{
            fetchAllUsers: builder.query({
                query: () => {
                    return {
                        url: '/auth/all_users',
                        method: 'GET',
                    };
                },
            }),
            fetchUser: builder.query({
                providesTags: ['User'],
                query: () => {
                    return {
                        url: '/auth/current_user',
                        method: 'GET',
                    };
                },
            }),
            createUser: builder.mutation({
                query: (values) => {
                    return {
                        url: '/auth/signup',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            loginUser: builder.mutation({
                invalidatesTags: ['User'], //triggers a fetchUser query when called
                query: (values) => {
                    return {
                        url: '/auth/login',
                        method: 'POST',
                        body: values,
                    }
                }
            })

        };
    }

});

export const { 
    useFetchAllUsersQuery, 
    useFetchUserQuery, 
    useCreateUserMutation,
    useLoginUserMutation 
} = authApi;
export { authApi };