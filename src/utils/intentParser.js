export const processCommand = (text) => {
    const command = text.toLowerCase();
    
    // Language patterns
    const clothingKeywords = ["clothing","clothes","fashion","ropa", "kleidung"];
    const cartKeywords = ["cart", "carrito", "warenkorb"];
    const addToCartKeywords = ["add", "anadir", "hinzufugen"];
    const checkoutKeywords = ["checkout", "payment", "pago", "kasse"];
    const groceryKeywords = ["grocery", "comestibles", "lebensmittel"];
    const electronicsKeywords = ["electronics", "electronicos", "elektronik"];
    const loginKeywords = ["login","sign in", "iniciar sesión", "anmelden"];
    const registerKeywords = ["register", "sign up", "registrarse", "registrieren"];
    const reorderKeywords = ["reorder", "reordenar", "nachbestellen"];
    const accountKeywords = ["account","my profile","cuenta", "konto"];
    const homeKeywords = ["home", "go home", "homepage", "main page", "inicio", "pagina principal", "startseite", "hauptseite", "zuhause"];

    
    const includesKeyword = (keywords) => keywords.some(k => command.includes(k));
    
    // Add to cart
    if (includesKeyword(addToCartKeywords) && includesKeyword(cartKeywords)) {
    return { action: "addToCart" };
    }
    
    // Go to cart
    if (includesKeyword(cartKeywords)) {
    return { action: "navigate" , path: "/pages/addtoCart"};
    }
    
    // Checkout
    if (includesKeyword(checkoutKeywords)) {
    return { action: "checkout" };
    }
    
    // Login
    if (includesKeyword(loginKeywords)) {
    return { action: "navigate" ,path: "/login"};
    }

    //Register
    if (includesKeyword(registerKeywords)) {
        return { action: "navigate", path: "/register" };
        }
        
        // Reorder
        if (includesKeyword(reorderKeywords)) {
        return { action: "navigate", path: "/reorder" };
        }
        
        // Account
        if (includesKeyword(accountKeywords)) {
        return { action: "navigate", path: "/account" };
        }

        //Home
        if (includesKeyword(homeKeywords)) {
            return { action: "navigate", path: "/" };
            }

    // Routing
    if (includesKeyword(clothingKeywords)) {
    return { action: "navigate", path: "/pages/clothing/all-clothing" };
    }
    if (includesKeyword(groceryKeywords)) {
    return { action: "navigate", path: "/pages/grocery" }; // Replace with actual path
    }
    if (includesKeyword(electronicsKeywords)) {
    return { action: "navigate", path: "/pages/electronics" }; // Replace with actual path
    }
    
    return { action: null };
    };