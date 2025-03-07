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
                providesTags: ['User', 'notification'],
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
                        url: '/create_user',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            loginUser: builder.mutation({
                invalidatesTags: ['User'], 
                query: (values) => {
                    return {
                        url: '/login',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            fetchUsername: builder.query({
                query: () => {
                    return {
                        url: '/generate_username',
                        method: 'GET',
                    };
                },
            }),
            passwordReset: builder.mutation({
                query: (values) => {
                    return{
                        url: '/password_reset',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            checkUsernameAvailability: builder.query({
                query: (checkUser) => {
                    return{
                        url: '/check_user',
                        method: 'POST',
                        body: checkUser,
                    };
                },
            }),
        };
    }

});

export const { 
    useFetchAllUsersQuery, 
    useFetchUserQuery, 
    useCreateUserMutation,
    useLoginUserMutation,
    useFetchUsernameQuery,
    useLazyFetchUsernameQuery,
    usePasswordResetMutation, 
    useLazyCheckUsernameAvailabilityQuery,
} = authApi;
export { authApi };