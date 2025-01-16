import { Link } from "react-router-dom";
import PropTypes from "prop-types";
const ButtonLink = ({ to, text, type, additionalClasses = "", ...props }) => {
    return (
        <button className={`btn ${additionalClasses}`} type={type || "button"} {...props}>
            <Link to={to} className="text-decoration-none text-white">
                {text}
            </Link>
        </button>
    );
};
ButtonLink.propTypes = {
    to: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string,
    additionalClasses: PropTypes.string,
  };
export default ButtonLink;