import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const resolveImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x400?text=No+Image';
        if (typeof url !== 'string') return 'https://via.placeholder.com/400x400?text=No+Image';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return url;
        return `/${encodeURI(url)}`;
    };

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (error) {
                console.error('Failed to parse cart:', error);
                setCart([]);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1, customization = []) => {
        const productId = product?._id || product?.productId;
        const primaryImage = Array.isArray(product?.images) ? product.images[0] : null;
        const primaryImageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage?.url;
        const image = resolveImageUrl(primaryImageUrl || product?.image);

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                item => item.productId === productId && 
                JSON.stringify(item.customization) === JSON.stringify(customization)
            );

            if (existingIndex > -1) {
                // Update quantity if product already in cart
                const updatedCart = [...prevCart];
                updatedCart[existingIndex].quantity += quantity;
                return updatedCart;
            } else {
                // Add new item to cart
                return [
                    ...prevCart,
                    {
                        productId,
                        name: product.name,
                        price: product.salePrice || product.price,
                        image,
                        quantity,
                        customization
                    }
                ];
            }
        });
    };

    const updateQuantity = (productId, quantity, customization = []) => {
        if (quantity <= 0) {
            removeFromCart(productId, customization);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.productId === productId && 
                JSON.stringify(item.customization) === JSON.stringify(customization)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId, customization = []) => {
        setCart(prevCart =>
            prevCart.filter(
                item => !(item.productId === productId && 
                JSON.stringify(item.customization) === JSON.stringify(customization))
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal: getCartTotal(),
        cartCount: getCartCount()
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
