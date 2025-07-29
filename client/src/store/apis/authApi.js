import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const authApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: '/auth'
    }),
    tagTypes: ['User', 'Notification', 'Assignment'], 
    endpoints(builder){
        return{
            fetchAllUsers: builder.query({
                query: () => ({
                    url: '/all_users',
                    method: 'GET',
                }),
                providesTags: ['User', 'Assignment'], 
            }),
            fetchUser: builder.query({
                providesTags: ['User', 'Notification'],
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
            logoutUser: builder.mutation({
                invalidatesTags: ['User'],
                query: () => {
                    return {
                        url: '/logout',
                        method: 'POST',
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
            sudoPasswordReset: builder.mutation({
                query: (values) => {
                    return {
                        url: '/sudo/password_reset',
                        method: 'POST',
                        body: values,
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
            updateUser: builder.mutation({
                query: (config) => {
                    return {
                        url: '/update_user',
                        method: 'POST',
                        body: config
                    };
                },
            }),
            getUserById: builder.query({
                query: ({ userId }) => {
                    return{
                        url: `/user/${userId}`,
                        method: 'GET'
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
    useLogoutUserMutation,
    useFetchUsernameQuery,
    useLazyFetchUsernameQuery,
    usePasswordResetMutation, 
    useSudoPasswordResetMutation,
    useLazyCheckUsernameAvailabilityQuery,
    useUpdateUserMutation,
    useLazyGetUserByIdQuery,
} = authApi;
export { authApi };