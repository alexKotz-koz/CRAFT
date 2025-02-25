const StudyCard = ({ cardIndex, cardName, cardDescription, content}) => {

    // to add a line under the card title, switch the class from card-title to card-header
    return (
        <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4" key={cardIndex}>
            <div className="card h-100">
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-2">{cardName}</h5>
                    <p className="card-text description">{cardDescription}</p>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default StudyCard;