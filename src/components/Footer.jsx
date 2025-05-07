import "./home.css";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
function Footer() {
    return (
        <footer className="text-center py-4  border-top ">
            <div className="d-flex justify-content-center gap-4">
                <Link to="/home" className="text-light">Contact</Link>
                <Link to="/home" className="text-light">Privacy Policy</Link>
                <Link to="/home" className="text-light">Terms & Conditions</Link>
            </div>
            <a href="#" className="mx-4 text-primary" data-bs-toggle="tooltip" title="Coming Soon">
                <i className="fab fa-facebook fa-2x"></i>
            </a>
            <a href="#" className="mx-4 text-info" data-bs-toggle="tooltip" title="Coming Soon">
                <i className="fab fa-twitter fa-2x"></i>
            </a>
            <a href="#" className="mx-4 text-danger" data-bs-toggle="tooltip" title="Coming Soon">
                <i className="fab fa-instagram fa-2x"></i>
            </a>
            <p className="mt-3 text-light">Made by Sheetal with ❤️</p>
        </footer>
    );
};

export default Footer;