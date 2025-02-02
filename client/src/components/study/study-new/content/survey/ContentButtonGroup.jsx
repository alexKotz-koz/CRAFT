import { GoPlus } from "react-icons/go";

const ContentButtonGroup = ({
    showNewQuestion,
    setShowNewQuestion,
    showMediaField,
    setShowMediaField,
    showTableField,
    setShowTableField,
    showSubQuestionField,
    setShowSubQuestionField
}) => {
    const renderSupplementalButtonClass = (state) => {
        if (state) {
            return "btn btn-outline-secondary";
        } else {
            return "btn btn-secondary";
        }
    };

    return (
        <div className="d-flex justify-content-evenly align-items-center mb-3 w-50">
            {!showNewQuestion && <button
                type="button"
                className="btn btn-info"
                onClick={() => setShowNewQuestion(!showNewQuestion)}
                disabled={showNewQuestion}
            >
                <GoPlus /> New Question
            </button>}
            {showNewQuestion &&
                <button
                    type="button"
                    className={renderSupplementalButtonClass(showMediaField)}
                    onClick={() => setShowMediaField(!showMediaField)}
                >
                    Add Media?
                </button>}
            {showNewQuestion &&
                <button
                    type="button"
                    className={renderSupplementalButtonClass(showTableField)}
                    onClick={() => setShowTableField(!showTableField)}
                >
                    Add Table?
                </button>}
            {showNewQuestion &&
                <button
                    type="button"
                    className={renderSupplementalButtonClass(showSubQuestionField)}
                    onClick={() => setShowSubQuestionField(!showSubQuestionField)}
                >
                    Add Sub-Question ?
                </button>
            }

        </div>
    );
};

export default ContentButtonGroup;