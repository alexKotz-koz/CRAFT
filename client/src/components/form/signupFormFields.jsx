const FORM_FIELDS = [
    { label: "First Name", name: "firstName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text" },
    { label: "Username", name: "userName", type: "text" },
    { label: "Email", name: "email", type: "text" },
    { label: "Password", name: "password", type: "password" },
    { label: "Role", name: "role", type: "select", options: ['facilitator', 'participant', 'admin'] }
];


export default FORM_FIELDS;