import { GoPlus } from "react-icons/go";

const ContentButtonGroup = ({
    showNewQuestion,
    setShowNewQuestion,
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

    const renderButtonContainerClass = () => {
        return showNewQuestion
            ? "d-flex justify-content-evenly align-items-center mb-3 w-50"
            : "d-flex justify-content-start align-items-center mb-3 w-50";
    };

    return (
        <div className={renderButtonContainerClass()}>
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