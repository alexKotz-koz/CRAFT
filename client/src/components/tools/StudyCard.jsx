const StudyCard = ({ cardIndex, cardName, cardDescription, content }) => {

    // to add a line under the card title, switch the class from card-title to card-header
    return (
        <div className="card h-100" key={cardIndex}>
            <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2">{cardName}</h5>
                {cardDescription !== "" || cardDescription !== "TBD" || cardDescription && (
                    <p className="card-text description">{cardDescription}</p>
                )}
                {content}
            </div>
        </div>
    );
};

export default StudyCard;