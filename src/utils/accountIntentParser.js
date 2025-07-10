export const parseAccountIntent = (text) => {
    const command = text.toLowerCase();
  
    const skipWords = ["as", "is", "to", "be", "set", "=", "should", "and", "or"];
  
    const phoneKeywords = ["phone", "number", "numero", "telefonnummer"];
    const nameKeywords = ["name", "nombre", "voller name"];
    const addressKeywords = ["address", "direccion", "adresse"];
    const skinTypeKeywords = ["skin type", "tipo de piel", "hauttyp"];
    const skinToneKeywords = ["skin tone", "tono de piel", "hautton"];
    const saveKeywords = ["save", "submit", "guardar", "sichern"];
    const logoutKeywords = ["logout", "log out", "update profile", "update account", "cerrar sesion", "abmelden"];
  
    // ✅ Allowed options
    const validSkinTypes = ["dry", "oily", "normal", "combination"];
    const validSkinTones = ["fair", "medium", "dark"];
  
    const clean = (val) => val?.trim().replace(/\s+/g, "") || "";
    const keepCharsAndSpaces = (val) => val?.replace(/[^a-zA-Z\s]/g, "").trim() || "";
    const keepDigitsOnly = (val) => val?.replace(/\D/g, "").trim() || "";
  
    const validateOption = (val, validList) => {
      const cleanVal = val.toLowerCase().trim();
      return validList.includes(cleanVal) ? cleanVal : "";
    };
  
    const extractMultiple = (keywordList, mode = "default") => {
      const results = [];
  
      for (let keyword of keywordList.sort((a, b) => b.length - a.length)) {
        const pattern = new RegExp(`\\b${keyword}\\b`, "ig");
        let match;
  
        while ((match = pattern.exec(command))) {
          const index = match.index;
          let after = command.slice(index + keyword.length).trim();
          const words = after.split(/\s+/);
          let i = 0;
          while (i < words.length && skipWords.includes(words[i])) i++;
  
          const valueWords = words.slice(i);
          const allKeywords = [
            ...phoneKeywords,
            ...nameKeywords,
            ...addressKeywords,
            ...skinTypeKeywords,
            ...skinToneKeywords,
            ...saveKeywords,
            ...logoutKeywords,
          ];
          const stopIndex = valueWords.findIndex((w) =>
            allKeywords.includes(w.toLowerCase())
          );
          const relevant = stopIndex !== -1
            ? valueWords.slice(0, stopIndex)
            : valueWords;
  
          const filtered = relevant.filter(
            (word) => !skipWords.includes(word.toLowerCase())
          );
          const value = filtered.join(" ");
  
          if (mode === "nospace") results.push(clean(value));
          else if (mode === "digits") results.push(keepDigitsOnly(value));
          else if (mode === "text") results.push(keepCharsAndSpaces(value));
          else results.push(value);
        }
      }
  
      return results[0] || "";
    };
  
    const name = extractMultiple(nameKeywords, "text");
    const phone = extractMultiple(phoneKeywords, "digits");
    const address = extractMultiple(addressKeywords, "text");
  
    // ✅ Extract and validate
    const rawSkinType = extractMultiple(skinTypeKeywords, "text");
    const rawSkinTone = extractMultiple(skinToneKeywords, "text");
  
    const skin_type = validateOption(rawSkinType, validSkinTypes);
    const skin_tone = validateOption(rawSkinTone, validSkinTones);
  
    const save = saveKeywords.some((k) => command.includes(k));
    const logout = logoutKeywords.some((k) => command.includes(k));
  
    // Return action only if at least one valid update is present
    if (name || phone || address || skin_type || skin_tone || save || logout) {
      return {
        action: "account_update",
        entities: {
          name,
          phone,
          address,
          skin_profile: {
            skin_type,
            skin_tone,
          },
          save,
          logout,
        },
      };
    }
  
    return { action: null };
  };
  