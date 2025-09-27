import { useFetchConsentStatusQuery } from "../../store";
import { Table, Spinner } from "reactstrap";


const ViewConsentStatusTable = () => {

    const { data, isLoading, error } = useFetchConsentStatusQuery();

    if (isLoading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner color="primary" />
    </div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container border border-solid my-4 rounded">
            <Table>
                <thead>
                    <tr>
                        <th>Consent Title/Study Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Completed Consent?</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(consent =>
                        consent.participants.map(p => (
                            <tr key={p._id}>
                                <td>{consent.studyName}</td>
                                <td>{p.username}</td>
                                <td>{p.email}</td>
                                <td>{p.consent ? "Yes" : "No"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ViewConsentStatusTable;