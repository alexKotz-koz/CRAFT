import { Link } from "react-router-dom";

import ButtonLink from './tools/ButtonLink';

import { useFetchFacilitatorStudiesQuery } from "../store";

import '../static/custom.css';

const Home = () => {
    const { data: userStudies, error, isLoading } = useFetchFacilitatorStudiesQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const numUserStudies = userStudies.length;

    // Group studies into chunks of 4
    const studyChunks = userStudies.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / 4);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    return (
        <div className="container">
            <h3>My Studies</h3>
            {studyChunks.map((chunk, chunkIndex) => (
                <div className="row" key={chunkIndex}>
                    <div className="card-group">
                        {chunk.map((study) => (
                            <div className="col-3" key={study._id}>
                                <div className="card p-3 h-100">
                                    <h5 className="card-title">
                                        {study.name}
                                    </h5>
                                    <p className="card-text description">{study.description}</p>
                                    <div className="mb-3"> 
                                        <p className="card-text fw-bold mt-3">Number of Participants: {study.participants.length}</p>
                                    </div>
                                    
                                    <div className="d-flex justify-content-center mt-auto mb-3">
                                        <ButtonLink to='#' additionalClasses="card-link me-auto" text='Edit' />
                                        <ButtonLink to='#' additionalClasses="card-link" text='View' />
                                    </div>
                                    <div className="card-footer">
                                        <small className="text-body-secondary">Date Created:                                             
                                            {new Date(study.dateCreated).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Home;