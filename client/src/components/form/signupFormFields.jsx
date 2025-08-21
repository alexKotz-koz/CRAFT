const FORM_FIELDS = [
    { label: "First Name", name: "firstName", type: "text", required: false },
    { label: "Last Name", name: "lastName", type: "text", required: false },
    //{ label: "Username", name: "userName", type: "text" },
    { label: "Email", name: "email", type: "text", required: true },
    { label: "Password", name: "password", type: "password", required: true },
    { label: "Confirm Password", name: "confirm", type: "password", required: true },
    { label: "Role", name: "role", type: "select", options: ['facilitator', 'participant', 'admin'], required: true },
    { label: "Cohort", name: "cohort", type: "text", required: false}
];


export default FORM_FIELDS;