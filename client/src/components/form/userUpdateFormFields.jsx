const FORM_FIELDS = [
    { label: "What type of clinician are you?", name: "jobRole", type: "select", options: ['Physician', 'Nurse', 'Physician Assistant', 'Nurse Practitioner', 'Social Worker', 'Other'], required: true },
    { label: "What type of clinical specialty do you work in?", name: "jobDepartment", type: "select", options: ['Emergency Department', 'Critical Care', 'Hospital Medicine', 'Infectious Disease', 'Surgery', 'Other'] , required: true},
    { label: "Please enter the number of years you have been practicing (including training time)?", name: "jobYears", type: "select", options: ["0-5 years", "5-10 years", "10-15 years", "15-20 years", ">20 years"], required: true},
    { label: "Current Password", name: "currentPassword", type: "password", required: true },
    { label: "New Password", name: "newPassword", type: "password", required: true },
    { label: "Confirm New Password", name:"confirmPassword", type:"password", required: true},
];


export default FORM_FIELDS;