import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const authApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: '/auth'
    }),
    endpoints(builder){
        return{
            fetchAllUsers: builder.query({
                query: () => {
                    return {
                        url: '/all_users',
                        method: 'GET',
                    };
                },
            }),
            fetchUser: builder.query({
                providesTags: ['User'],
                query: () => {
                    return {
                        url: '/current_user',
                        method: 'GET',
                    };
                },
            }),
            createUser: builder.mutation({
                query: (values) => {
                    return {
                        url: '/signup',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            loginUser: builder.mutation({
                invalidatesTags: ['User'], //triggers a fetchUser query when called
                query: (values) => {
                    return {
                        url: '/login',
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