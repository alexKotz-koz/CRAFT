import ButtonLink from './tools/ButtonLink';

const Landing = () => {

    return (
        <div className="px-4 py-5  text-center">
            <h2 className='mb-5'>
                Welcome to the Feedback System
            </h2>
            <h5 className='mb-3'>
                Please login to join a study
            </h5>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <ButtonLink to='/login' text="Login" additionalClasses="btn btn-primary btn-lg px-4 gap-3" />
                <ButtonLink to='/signup' text="Sign Up" additionalClasses="btn btn-secondary btn-lg px-4" />
            </div>
        </div>
    )
};

export default Landing;