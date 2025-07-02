export const parseRegisterIntent = (text) => {
    const command = text.toLowerCase();
  
    const skipWords = ["as", "is", "es", "como", "ist", "="];
  
    const emailKeywords = ["email", "correo", "e-mail"];
    const passwordKeywords = ["password", "contraseña", "passwort"];
    const phoneKeywords = ["phone", "número", "telefonnummer"];
    const nameKeywords = ["name", "nombre", "voller name"];
    const storeKeywords = ["store name","store", "tienda", "laden"];
    const customerKeywords = ["customer", "cliente", "kunde"];
    const sellerKeywords = ["seller", "vendedor", "verkäufer"];
    const submitKeywords = ["sign up", "submit", "crear cuenta", "registrieren"];
  
    const clean = (val) => val?.trim().replace(/\s+/g, "") || "";
    const keepCharsAndSpaces = (val) =>
      val?.replace(/[^a-zA-Z\s]/g, "").trim() || "";
    const keepDigitsOnly = (val) => val?.replace(/\D/g, "").trim() || "";
  
    const extractValue = (keywordList, mode = "default") => {
        for (let keyword of keywordList.sort((a, b) => b.length - a.length)) {
          const pattern = new RegExp(`\\b${keyword}\\b`, "i"); // match whole word
          const match = pattern.exec(command);
          if (match) {
            const index = match.index;
            let afterKeyword = command.slice(index + keyword.length).trim();
            const words = afterKeyword.split(/\s+/);
      
            let i = 0;
            while (i < words.length && skipWords.includes(words[i])) {
              i++;
            }
      
            const valueWords = words.slice(i);
      
            const allKeywords = [
              ...emailKeywords,
              ...passwordKeywords,
              ...phoneKeywords,
              ...storeKeywords,
              ...nameKeywords,
              ...submitKeywords,
              ...customerKeywords,
              ...sellerKeywords,
            ];
            const stopIndex = valueWords.findIndex((w) =>
              allKeywords.includes(w.toLowerCase())
            );
            const relevantWords =
              stopIndex !== -1 ? valueWords.slice(0, stopIndex) : valueWords;
      
            const value = relevantWords.join(" ");
            if (mode === "nospace") return clean(value);
            if (mode === "digits") return keepDigitsOnly(value);
            if (mode === "text") return keepCharsAndSpaces(value);
            return value;
          }
        }
        return "";
      };
      
  
    const email = extractValue(emailKeywords, "nospace");
    const password = extractValue(passwordKeywords, "nospace");
    const phone = extractValue(phoneKeywords, "digits");
    const storeName = extractValue(storeKeywords, "text");
    const fullName = extractValue(nameKeywords, "text");
    const submit = submitKeywords.some((k) => command.includes(k));
    const isSeller = sellerKeywords.some((k) => command.includes(k));
    const isCustomer = customerKeywords.some((k) => command.includes(k));
  
    const userType = isSeller ? "seller" : isCustomer ? "customer" : "";
  
    if (email || password || phone || fullName || storeName || submit || userType) {
      // Decide whether storeName should go to storeName or fullName based on userType
      let resolvedFullName = fullName;
      let resolvedStoreName = storeName;
      console.log("usertype: ",userType);
    
      if (storeName && userType === "customer") {
        // No store field for customer — treat it as fullName
        resolvedFullName = storeName;
        resolvedStoreName = "";
      }
    
      return {
        action: "register_intent",
        entities: {
          email,
          password,
          phone,
          fullName: resolvedFullName,
          storeName: resolvedStoreName,
          role,
          submit,
        },
      };
    }

  
    return { action: null };
  };
  