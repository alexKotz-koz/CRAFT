import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

const formatDropDownString = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const FormField = ({ input, label, type, options, meta: { error, touched }, required }) => {
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [otherValue, setOtherValue] = useState('');

    const sanitizeInput = (input) => DOMPurify.sanitize(input);

    const handleSelectChange = (event) => {
        const value = event.target.value;
        setIsOtherSelected(value === 'Other');
        input.onChange(value); 
    };

    const handleOtherInputChange = (event) => {
        const value = sanitizeInput(event.target.value); // Sanitize the input
        setOtherValue(value);
        input.onChange(value); // Pass the sanitized value to the parent form
    };
    return (
        <div className="mb-3">
            <label className="form-label">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            {type === 'select' ? (
                <>
                    <select
                        {...input}
                        className="form-control"
                        required={required}
                        onChange={handleSelectChange}
                        value={isOtherSelected ? 'Other' : input.value} // Ensure the select retains its value
                    >
                        <option value="" disabled hidden>Select an option...</option>
                        {options.map((option) => (
                            <option key={option} value={option}>{formatDropDownString(option)}</option>
                        ))}
                    </select>
                    {isOtherSelected && (
                        <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Please specify"
                            value={otherValue} // Bind the "Other" input to its state
                            onChange={handleOtherInputChange}
                        />
                    )}
                </>
            ) : (
                <input
                    {...input}
                    type={type}
                    className="form-control"
                    style={{ marginBottom: "5px" }}
                    required={required}
                />
            )}
            <div className="form-text" style={{ marginBottom: "20px" }}>
                {touched && error}
            </div>
        </div>
    );
};
FormField.propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    options: PropTypes.array,
    meta: PropTypes.shape({
        error: PropTypes.string,
        touched: PropTypes.bool
    }).isRequired,
    required: PropTypes.bool.isRequired,
};

export default FormField;