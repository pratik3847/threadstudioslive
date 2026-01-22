import './AboutPage.css';

const AboutPage = () => {
    return (
        <div className="about-page">
            <div className="about-hero">
                <h1>About The Thread Studioss</h1>
                <p>Crafting magic, one stitch at a time</p>
            </div>

            <div className="about-content">
                <section className="about-section">
                    <h2>Our Story</h2>
                    <p>
                        The Thread Studioss is a passion-driven handcraft venture that brings magic to life 
                        through the art of crochet. Founded with love and dedication, we create unique pieces 
                        that bring joy and warmth to your life.
                    </p>
                    <p>
                        Every item in our collection is carefully handcrafted with premium materials, 
                        attention to detail, and lots of love. From personalized keychains to beautiful 
                        floral arrangements, each piece tells its own story.
                    </p>
                </section>

                <section className="about-section">
                    <h2>What We Do</h2>
                    <p>
                        We specialize in creating handmade crochet products that are perfect for gifting 
                        or adding a personal touch to your space. Our product range includes:
                    </p>
                    <ul>
                        <li>Personalized keychains and accessories</li>
                        <li>Beautiful flower bouquets that never wilt</li>
                        <li>Decorative baskets and home decor</li>
                        <li>Custom orders tailored to your preferences</li>
                    </ul>
                </section>

                <section className="about-section">
                    <h2>Why Choose Us</h2>
                    <ul>
                        <li>✨ Handcrafted with love and care</li>
                        <li>🌟 Premium quality materials</li>
                        <li>🎨 Unique, one-of-a-kind designs</li>
                        <li>🎁 Perfect for gifting</li>
                        <li>♻️ Eco-friendly and sustainable</li>
                        <li>💝 Customization available</li>
                    </ul>
                </section>

                <section className="about-section">
                    <h2>Connect With Us</h2>
                    <p>
                        Follow us on Instagram 
                        <a href="https://www.instagram.com/thethreadstudioss" target="_blank" rel="noopener noreferrer">
                            {' '}@thethreadstudioss{' '}
                        </a>
                        to see our latest creations and behind-the-scenes content!
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
