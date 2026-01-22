import { Link } from 'react-router-dom';
import ProductsSection from '../components/ProductsSection';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <h1>The Thread Studioss</h1>
                    <p>Handcrafted crochet art made with love, care, and a touch of magic ✨</p>
                    <Link to="/products" className="btn btn-primary">
                        Shop Now
                    </Link>
                </div>
            </section>

            <ProductsSection />

            <section className="about-preview">
                <div className="container">
                    <h2>About Us</h2>
                    <p>
                        The Thread Studioss is a passion-driven handcraft venture that brings magic to life 
                        through the art of crochet. Every piece is carefully crafted with premium materials, 
                        attention to detail, and lots of love.
                    </p>
                    <Link to="/about" className="btn btn-secondary">
                        Learn More
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
