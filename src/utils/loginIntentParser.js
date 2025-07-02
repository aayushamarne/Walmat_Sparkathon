// src/utils/loginIntentParser.js

export const parseLoginIntent = (text) => {
  const command = text.toLowerCase();

  // Multi-language support
  const emailKeywords = ["email", "correo", "e-mail"];
  const passwordKeywords = ["password", "contraseña", "passwort"];
  const submitKeywords = ["submit", "sign in", "iniciar sesion", "einloggen", "anmelden"];

  // Words to skip between keyword and actual value
  const skipWords = ["as", "to", "equal","and", "or","is" ,"=", "es", "ist", "como"]; // English, Spanish, German filler words

  const clean = (val) => val?.trim().replace(/\s+/g, "") || "";

  const extractValue = (keywordList) => {
    for (let keyword of keywordList) {
      const index = command.indexOf(keyword);
      if (index !== -1) {
        let afterKeyword = command.slice(index + keyword.length).trim();

        const words = afterKeyword.split(/\s+/);
        let i = 0;

        // Skip filler words
        while (i < words.length && skipWords.includes(words[i])) {
          i++;
        }

        const valueWords = words.slice(i);

        // Stop collecting if next keyword starts
        const allKeywords = [...emailKeywords, ...passwordKeywords, ...submitKeywords];
        const stopIndex = valueWords.findIndex((w) => allKeywords.includes(w.toLowerCase()));
        const relevantWords = stopIndex !== -1 ? valueWords.slice(0, stopIndex) : valueWords;

        return clean(relevantWords.join(" "));
      }
    }
    return "";
  };

  const emailValue = extractValue(emailKeywords);
  const passwordValue = extractValue(passwordKeywords);
  const submit = submitKeywords.some((k) => command.includes(k));

  if (emailValue || passwordValue || submit) {
    return {
      action: "login_intent",
      entities: {
        email: emailValue,
        password: passwordValue,
        submit,
      },
    };
  }

  return { action: null };
};
