import { useState } from "react";
import { useFetchConsentStatusQuery, useFetchAllUsersQuery, useAssignNewParticipantConsentMutation } from "../../store";
import { Table, Spinner } from "reactstrap";

const AssignNewParticipantsConsent = () => {
    const { data: consents, isLoading: isLoadingConsents, error: errorConsents } = useFetchConsentStatusQuery();
    const { data: users, isLoading: isLoadingUsers, error: errorUsers } = useFetchAllUsersQuery();
    const [assignNewParticipant, { isLoading: isAssigning }] = useAssignNewParticipantConsentMutation();

    const [selectedConsentId, setSelectedConsentId] = useState("");
    const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);

    if (isLoadingConsents || isLoadingUsers) return <Spinner />;
    if (errorConsents || errorUsers) return <div className="text-danger">Error loading data.</div>;

    const selectedConsent = consents?.find(c => c._id === selectedConsentId);

    // Get all users with role 'participant'
    const allParticipants = users?.filter(u => u.role === "participant") || [];

    // Filter out participants already assigned to the selected consent
    const assignedIds = selectedConsent?.participants?.map(p => p._id) || [];
    const unassignedParticipants = allParticipants.filter(u => !assignedIds.includes(u._id));

    const handleCheckboxChange = (userId) => {
        setSelectedParticipantIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConsentId || selectedParticipantIds.length === 0) return;
        try {
            await assignNewParticipant({
                consentId: selectedConsentId,
                participantIds: selectedParticipantIds
            }).unwrap();
            setSelectedParticipantIds([]);
            // Optionally refetch consents/users here
        } catch (err) {
            console.error(err)
        }
    };

    return (
        <div className="container">
            {!selectedConsentId ? (
                <div className="mb-3">
                    <label htmlFor="consent-select" className="form-label">Select Consent</label>
                    <select
                        id="consent-select"
                        className="form-select"
                        value={selectedConsentId}
                        onChange={e => setSelectedConsentId(e.target.value)}
                    >
                        <option value="">Choose...</option>
                        {consents.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.studyName}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Username</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unassignedParticipants.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipantIds.includes(u._id)}
                                            onChange={() => handleCheckboxChange(u._id)}
                                        />
                                    </td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isAssigning || selectedParticipantIds.length === 0}
                    >
                        {isAssigning ? "Assigning..." : "Assign Selected Participants"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AssignNewParticipantsConsent;