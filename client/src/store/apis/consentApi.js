import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const consentApi = createApi({
    reducerPath: 'consent',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    tagTypes: ['User', 'ConsentStatus'], 
    endpoints(builder){
        return{
            createConsent: builder.mutation({
                query: (values) => {
                    return {
                        url: '/consent/new',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            fetchConsentStatus: builder.query({
                query: () => {
                    return {
                        url: '/consent/get-status',
                        method: 'GET',
                    };
                },
                providesTags: ['ConsentStatus']
            }),
            updateConsent: builder.mutation({
                query: (values) => {
                    return {
                        url: '/consent/update-status',
                        method: 'POST',
                        body: values,
                    }
                },
                invalidatesTags: ['ConsentStatus']
            }),
            assignNewParticipantConsent: builder.mutation({
                query: (values) => {
                    return {
                        url: '/consent/assign',
                        method: 'POST',
                        body: values
                    }
                }
            })

        };
    }

});

export const { 
    useCreateConsentMutation,
    useFetchConsentStatusQuery,
    useUpdateConsentMutation,
    useAssignNewParticipantConsentMutation
} = consentApi;
export { consentApi };