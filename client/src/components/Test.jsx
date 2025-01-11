import { useFetchAllUsersQuery } from "../store";

function Test() {
    const results = useFetchAllUsersQuery();

    console.log(results);

    if (results.isLoading) return <div>Loading...</div>;
    if (results.error) return <div>Error: {results.error.message}</div>;

    return (
        <div>
            Test
            {results.data && results.data.map((user) => (
                <div key={user._id}>{user.username}</div>
            ))}
        </div>
    );
}

export default Test;