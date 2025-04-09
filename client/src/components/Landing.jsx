import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import ButtonLink from './tools/ButtonLink';

const Landing = () => {

    useEffect(() => {
        ReactGA.send({
            hitType: "pageview",
            page: "/",
            title: "Landing - CRAFT",
        });
    }, []);

    return (
        <div className="px-4 py-5  text-center">
            <h2 className='mb-5'>
                Welcome to the <strong><u>C</u>ollaborative <u>R</u>emote <u>A</u>synchrounous <u>F</u>eedback <u>T</u>ool</strong>
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