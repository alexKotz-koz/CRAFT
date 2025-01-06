export const validate = (values, FORM_FIELDS) => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  
    FORM_FIELDS.forEach(({ name }) => {
      if (!values[name]) {
        errors[name] = "You must provide a value";
      } else if (name === "email" && !emailRegex.test(values[name])) {
        errors[name] = "You must provide a valid email address";
      }
    });
  
    return errors;
  };

  export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(email)){
      return false;
    }
    else {
      return true;
    }
  }