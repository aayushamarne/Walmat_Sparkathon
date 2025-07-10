export const  parseRegisterIntent = (text,role) => {
  const command = text.toLowerCase();

  const skipWords = ["as", "is", "es", "como", "ist","=","and","or","equal","has","to","should","be","set"];

  const emailKeywords = ["email", "correo", "e-mail"];
  const passwordKeywords = ["password", "contraseña", "passwort"];
  const phoneKeywords = ["phone", "número", "telefonnummer"];
  const storeKeywords = ["store name","store", "tienda", "laden"];
  const nameKeywords = ["name", "nombre", "voller name"];
  const customerKeywords = ["customer", "cliente", "kunde"];
  const sellerKeywords = ["seller", "vendedor", "verkaufer"];
  const submitKeywords = ["sign up", "submit", "save","crear cuenta", "registrieren"];

  const clean = (val) => val?.trim().replace(/\s+/g, "") || "";
  const keepCharsAndSpaces = (val) =>
    val?.replace(/[^a-zA-Z\s]/g, "").trim() || "";
  const keepDigitsOnly = (val) => val?.replace(/\D/g, "").trim() || "";

  const extractValue = (keywordList, mode = "default") => {
      for (let keyword of keywordList.sort((a, b) => b.length - a.length)) {
        const pattern = new RegExp(`\\b${keyword}\\b`, "i");  // match whole word
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

            const filteredWords = relevantWords.filter(
              (word) => !skipWords.includes(word.toLowerCase())
            );
            const value = filteredWords.join(" ");
      
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
  let storeName="";
  if(role=="seller"){
  storeName = extractValue(storeKeywords, "text");
  }
  const fullName = extractValue(nameKeywords, "text");
  const submit = submitKeywords.some((k) => command.includes(k));
  const isSeller = sellerKeywords.some((k) => command.includes(k));
  const isCustomer = customerKeywords.some((k) => command.includes(k));


if (email || password || phone || fullName || storeName || submit || role) {
  let resolvedFullName = fullName;
  let resolvedStoreName = storeName ;

  if (role === "customer") {
    if (fullName || storeName ) {
      resolvedFullName = fullName || storeName;
      resolvedStoreName = "";
    }
  } else if (role === "seller") {
    if (fullName && !storeName) {
      resolvedStoreName = "";
      resolvedFullName = fullName;
    }
    else if(fullName != storeName){
      resolvedStoreName = storeName;
      resolvedFullName = fullName;
    }
    else{
      resolvedStoreName = storeName;
      resolvedFullName = "";
    }
    console.log("lfgsh:" ,role);
  }

    return {
      action: "register_intent",
      entities: {
        email,
        password,
        phone,
        fullName: resolvedFullName,
        storeName: (role=="seller") ? storeName : "",
        role,
        submit,
      },
    };
  }
  return { action: null };
};      