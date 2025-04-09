import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const pageTitleMap = {
            '/': 'Landing - CRAFT',
            '/home': 'Home - CRAFT',
            '/login': 'Login - CRAFT',
            '/signup': 'Sign Up - CRAFT',
            '/participant-config': 'Participant Config - CRAFT',
            '/study/:studyId': 'Participant Response - CRAFT',
            '/study/new': 'Study New Wizard - CRAFT',
            '/study/dashboard/:studyId': 'Study Dashboard - CRAFT',
            '/study/response/:studyId': 'Study Response Wizard - CRAFT',
            '/password_reset': 'Password Reset - CRAFT',
            '/discussion/:taskId': 'Discussion Board - CRAFT',
            '/discussion/landing/:studyId': 'Discussion Board Wizard - CRAFT'        
        };

        const title = pageTitleMap[location.pathname] || 'CRAFT';
        document.title = title;

        ReactGA.send({
            hitType: 'pageview',
            page: location.pathname,
            title: title,
        });
    }, [location]);
};

export default usePageTracking;