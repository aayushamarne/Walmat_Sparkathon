"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { processCommand } from "../../utils/intentParser";
import { parseLoginIntent } from "../../utils/loginIntentParser";
import { parseRegisterIntent } from "../../utils/registerIntentParser";
import { parseAccountIntent } from "../../utils/accountIntentParser";
import { BotIcon, BotOffIcon } from "lucide-react";

const VoiceAssistant = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Enhanced speak function with microphone control
  const speak = (text) => {
    console.log("🔊 Assistant says:", text);
    
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("🔇 Stopped recognition during speech");
      } catch (error) {
        console.log("Error stopping recognition:", error);
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
      console.log("🔊 Speech ended");
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      
      if (isListeningRef.current && recognitionRef.current) {
        startRecognitionSafely();
      }
    };
    
    utterance.onerror = () => {
      console.log("🔊 Speech error");
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      
      if (isListeningRef.current && recognitionRef.current) {
        startRecognitionSafely();
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Safely start recognition
  const startRecognitionSafely = () => {
    if (recognitionRef.current && !recognitionRef.current.running) {
      try {
        recognitionRef.current.start();
        console.log("🎤 Recognition started");
      } catch (error) {
        console.log("Error starting recognition:", error);
      }
    }
  };

  // Parse select or remove product intent with improved word-based matching
  const parseSelectRemoveProductIntent = (transcript) => {
    const numberWords = {
      "one": 1,
      "two": 2,
      "three": 3,
      "four": 4,
      "five": 5,
      "six": 6,
      "seven": 7,
      "eight": 8,
      "nine": 9,
      "ten": 10
    };

        // Navigation - Original logic
        const { action, path } = processCommand(transcript);
        if (action === "navigate" && path) {
          speak(`Going to ${path.replace("/", "")} page`);
          router.push(path);
          return;
        }

    // Match "select product [number]" or "select [number]" with flexible spacing
    const selectNumericMatch = transcript.match(/select\s*(?:product\s+)?(\d+)/i);
    if (selectNumericMatch) {
      const productNum = parseInt(selectNumericMatch[1], 10) - 1; // Convert to 0-based index
      return { action: "select_product", productNum };
    }

    // Match "remove product [number]" or "remove [number]" with flexible spacing
    const removeNumericMatch = transcript.match(/remove\s*(?:product\s+)?(\d+)/i);
    if (removeNumericMatch) {
      const productNum = parseInt(removeNumericMatch[1], 10) - 1; // Convert to 0-based index
      return { action: "remove_product", productNum };
    }

    // Match "select product [word]" or "select [word]" with flexible spacing
    for (let word in numberWords) {
      const selectPattern = new RegExp(`select\\s*(?:product\\s+)?${word}`, "i");
      if (selectPattern.test(transcript)) {
        const productNum = numberWords[word] - 1; // Convert to 0-based index
        return { action: "select_product", productNum };
      }
    }

    // Match "remove product [word]" or "remove [word]" with flexible spacing
    for (let word in numberWords) {
      const removePattern = new RegExp(`remove\\s*(?:product\\s+)?${word}`, "i");
      if (removePattern.test(transcript)) {
        const productNum = numberWords[word] - 1; // Convert to 0-based index
        return { action: "remove_product", productNum };
      }
    }

    return { action: null };
  };
  const roleRef = useRef(""); 


  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported.");
      return;
    }
    window.addEventListener("userRoleChanged", (e) => {
      const newRole = e.detail?.role;
      if (newRole) {
        roleRef.current = newRole;
        console.log("📣 Role received from register page:", newRole);
      }
    });
    

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // Using en-IN for Indian English
    recognition.interimResults = false;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    const stopPhrases = [
      "goodbye",
      "bye",
      "see you",
      "stop listening",
      "exit",
      "close assistant",
      "close"
    ];

    recognition.onresult = async (event) => {
      if (isSpeakingRef.current) {
        console.log("🔇 Ignoring input while speaking");
        return;
      }

      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🎤 You said (trimmed):", transcript);

      if (stopPhrases.some((phrase) => transcript.includes(phrase))) {
        speak("Goodbye!");
        setTimeout(() => stopAssistant(), 2000);
        return;
      }

      // Navigate to add to cart page
      // if (transcript.includes("go to add to cart")) {
      //   speak("Navigating to add to cart page");
      //   router.push("/pages/addtoCart");
      //   return;
      // }

      // Select or remove product by number (1 to 10) or word
      const selectRemoveIntent = parseSelectRemoveProductIntent(transcript);
      if (selectRemoveIntent.action) {
        const { action, productNum } = selectRemoveIntent;
        console.log("Attempting to", action, "product:", productNum);

        if (productNum >= 0 && productNum <= 9) {
          if (action === "select_product") {
            if (!selectedItems.includes(productNum)) {
              const newSelectedItems = [...selectedItems, productNum];
              setSelectedItems(newSelectedItems);
              speak(`Selected product ${productNum + 1}`);
              window.dispatchEvent(new CustomEvent("voiceSelectItem", { detail: { itemId: productNum } }));
              console.log("Selected items updated:", newSelectedItems);
            } else {
              speak(`Product ${productNum + 1} is already selected`);
              console.log("Product already selected:", productNum);
            }
          } else if (action === "remove_product") {
            if (selectedItems.includes(productNum)) {
              const newSelectedItems = selectedItems.filter((item) => item !== productNum);
              setSelectedItems(newSelectedItems);
              speak(`Removed product ${productNum + 1}`);
              window.dispatchEvent(new CustomEvent("voiceDeselectItem", { detail: { itemId: productNum } }));
              console.log("Removed items updated:", newSelectedItems);
            } else {
              speak(`Product ${productNum + 1} is not selected`);
              console.log("Product not selected:", productNum);
            }
          }
        } else {
          speak("Invalid product number. Please select a number between 1 and 10.");
        }
        return;
      }

      // Proceed to payment
      if (transcript.includes("proceed to payment")) {
        if (selectedItems.length > 0) {
          speak(`Proceeding to payment with ${selectedItems.length} selected items`);
          window.dispatchEvent(new CustomEvent("voiceProceedToPayment", { detail: { items: selectedItems } }));
        } else {
          speak("Please select at least one item before proceeding to payment");
        }
        return;
      }

  

      // Login - Original logic preserved
      const loginIntent = parseLoginIntent(transcript);
      if (loginIntent.action === "login_intent" && pathname === "/login") {
        const { email, password, submit } = loginIntent.entities;

        const performLoginActions = () => {
          let feedback = "";
          
          if (email || password) {
            if (email) feedback += `Email set to ${email}. `;
            if (password) feedback += "Password entered. ";
            
            window.dispatchEvent(
              new CustomEvent("voicePartialLogin", {
                detail: { email: email || "", password: password || "" },
              })
            );
          }
          if (submit) {
            feedback += "Submitting login.";
            window.dispatchEvent(new CustomEvent("voiceLoginSubmit"));
          }
          
          if (feedback) speak(feedback);
        };

        if (pathname !== "/login") {
          speak("Going to login page first");
          router.push("/login");
          const wait = () => {
            if (window.location.pathname === "/login") {
              performLoginActions();
            } else {
              setTimeout(wait, 200);
            }
          };
          wait();
        } else {
          performLoginActions();
        }
        return;
      }

      // Register - Original logic preserved
           const registerIntent = parseRegisterIntent(transcript, roleRef.current);
      if (registerIntent.action === "register_intent" && pathname === "/register") {
        const { email, password, phone, fullName, storeName, userType, submit } = registerIntent.entities;

        const targetPath = "/register";

        const performRegisterActions = () => {
          let feedback = "";
          
          if (userType) feedback += `Registering as ${userType}. `;
          if (fullName) feedback += `Name: ${fullName}. `;
          if (email) feedback += `Email: ${email}. `;
          if (phone) feedback += "Phone number entered. ";
          if (storeName) feedback += `Store: ${storeName}. `;
          if (password) feedback += "Password set. ";
          
          window.dispatchEvent(
            new CustomEvent("voiceRegister", {
              detail: { email, password, phone, fullName, storeName, userType },
            })
          );
          if (submit) {
            feedback += "Submitting registration.";
            window.dispatchEvent(new CustomEvent("voiceRegisterSubmit"));
          }
          
          if (feedback) speak(feedback);
        };

        const alreadySeller = pathname === "/register" && userType === "seller";
        const alreadyCustomer = pathname === "/register" && userType === "customer";

        if ((userType === "seller" && alreadySeller) || (userType === "customer" && alreadyCustomer)) {
          performRegisterActions();
        } else {
          speak("Going to registration page");
          router.push(targetPath);
          const wait = () => {
            if (window.location.pathname === targetPath) {
              performRegisterActions();
            } else {
              setTimeout(wait, 200);
            }
          };
          wait();
        }
        return;
      }
      //search
      // Handle voice-based search command
if (
  transcript.startsWith("search for") ||
  transcript.startsWith("find") ||
  transcript.startsWith("look for")
) {
  const query = transcript
    .replace(/^search for\s*/i, "")
    .replace(/^find\s*/i, "")
    .replace(/^look for\s*/i, "")
    .trim();

  const targetPath = `/search?query=${encodeURIComponent(query)}`;

  const performSearchNavigation = () => {
    if (!query) {
      speak("Please specify what you want to search for.");
      return;
    }

    speak(`Searching for ${query}`);
    router.push(targetPath);
  };

  if (pathname !== "/search") {
    speak("Taking you to the search results page");
    router.push(targetPath);

    const wait = () => {
      if (window.location.pathname.startsWith("/search")) {
        performSearchNavigation();
      } else {
        setTimeout(wait, 200);
      }
    };
    wait();
  } else {
    performSearchNavigation();
  }
  return;
}
    //open product
    if(pathname!="/account"){
    if (transcript.includes("open") || transcript.includes("show") || transcript.includes("display")) {
  const match = transcript.match(/open (.+)/i) || transcript.match(/show (.+)/i);
  if (match && match[1]) {
    const productTitle = match[1].trim();
    speak(`Opening ${productTitle}`);
    window.dispatchEvent(new CustomEvent("voiceOpenProduct", { detail: { productTitle } }));
    return;
  }
}
}

//select colour
if (transcript.includes("select color") || transcript.includes("select colour")) {
  const match = transcript.match(/select colou?r (.+)/i); // the `u?` makes "color" and "colour" both match
  if (match && match[1]) {
    const color = match[1].trim().toLowerCase();
    console.log("🎨 Voice selected color:", color);
    speak(`Selecting color ${color}`);
    window.dispatchEvent(new CustomEvent("voiceSelectColor", { detail: { color } }));
    return;
  } else {
    speak("Please say the color you want to select.");
    return;
  }
}
// 🎨 Flexible color selection handling
const colorMatch =
  transcript.match(/(?:select|choose|pick)\s+colou?r?\s*(\w+)/i) ||       // "select color red" / "choose colour black"
  transcript.match(/(?:select|choose|pick)\s+(\w+)\s+colou?r?/i) ||       // "pick red color"
  transcript.match(/(?:i would like to pick|i want|pick|choose)\s+(\w+)/i); // "I would like to pick blue"

if (colorMatch && colorMatch[1]) {
  const color = colorMatch[1].trim().toLowerCase();
  console.log("🎨 Voice selected color:", color);
  speak(`Selecting color ${color}`);
  window.dispatchEvent(
    new CustomEvent("voiceSelectColor", { detail: { color } })
  );
  return;
}

//select size
if (transcript.includes("select size") || transcript.includes("choose size")) {
  const match = transcript.match(/(?:select|choose) size (.+)/i);
  if (match && match[1]) {
    const size = match[1].trim();
    speak(`Selecting size ${size}`);
    window.dispatchEvent(new CustomEvent("voiceSelectSize", { detail: { size } }));
    return;
  }
}
//add to cart
if (transcript.includes("add to cart")) {
  speak("Adding item to cart");
  window.dispatchEvent(new CustomEvent("voiceAddToCart"));
  return;
}
//view reviews
if (transcript.includes("view reviews")) {
  speak("Opening customer reviews");
  window.dispatchEvent(new CustomEvent("voiceSearchReviews"));  return;
}

// Account Page
const accountIntent = parseAccountIntent(transcript);

if (accountIntent.action === "account_update" && pathname === "/account") {
  const { entities } = accountIntent;

  const performAccountActions = () => {
    if (entities.logout) {
      window.dispatchEvent(new CustomEvent("voiceLogout"));
      const speak = new SpeechSynthesisUtterance("Logging out");
      window.speechSynthesis.speak(speak);
    }

    if (entities.save) {
      window.dispatchEvent(new CustomEvent("voiceAccountSave"));
      const speak = new SpeechSynthesisUtterance("Saving your changes");
      window.speechSynthesis.speak(speak);
    }

    const flatFields = {
      name: entities.name,
      phone: entities.phone,
      address: entities.address,
      skinType: entities.skin_profile?.skin_type,
      skinTone: entities.skin_profile?.skin_tone,
    };

    Object.entries(flatFields).forEach(([field, value]) => {
      if (value) {
        window.dispatchEvent(
          new CustomEvent("voiceAccountUpdate", {
            detail: { field, value },
          })
        );

        const speak = new SpeechSynthesisUtterance(
          `${field} updated to ${value}`
        );
        window.speechSynthesis.speak(speak);
      }
    });
  };
  performAccountActions();
  return;
}

if(pathname === "/account"){
  const cleanedTranscript = transcript.toLowerCase().replace(/[^\w\s]/g, "").trim();
  console.log("Transcript: ",cleanedTranscript);
  const showKeywords = ["show", "available", "options", "display", "list", "what are", "tell me","view"];
const hasShowIntent = showKeywords.some((word) =>
  cleanedTranscript.includes(word)
);

const mentionsSkinType = ["skin type", "skin types"].some(p =>
  cleanedTranscript.includes(p)
);

const mentionsSkinTone = ["skin tone", "skin tones"].some(p =>
  cleanedTranscript.includes(p)
);


// Voice-only response to show dropdown options
if (hasShowIntent && (mentionsSkinType || mentionsSkinTone)) {
  if (mentionsSkinType) {
    const speak = new SpeechSynthesisUtterance(
      "Available skin types are: normal, oily, dry, and combination."
    );
    window.speechSynthesis.speak(speak);

    const dropdown = document.querySelector('select[name="skin_type"]');
    dropdown?.focus();

    const tooltip = document.getElementById("skinTypeToolTip");
    if (tooltip) {
      tooltip.classList.remove("hidden");
      setTimeout(() => tooltip.classList.add("hidden"), 5000);
    }
  }

  if (mentionsSkinTone) {
    const speak = new SpeechSynthesisUtterance(
      "Available skin tones are: fair, medium, and dark."
    );
    window.speechSynthesis.speak(speak);

    const dropdown = document.querySelector('select[name="skin_tone"]');
    dropdown?.focus();

    const tooltip = document.getElementById("skinToneToolTip");
    if (tooltip) {
      tooltip.classList.remove("hidden");
      setTimeout(() => tooltip.classList.add("hidden"), 5000);
    }
  }
  return; 
}
}


      // Fallback - Original logic
      speak("Sorry, I didn't understand that.");
    };

    recognition.onend = () => {
      console.log("🎤 Recognition ended");
      
      if (isListeningRef.current && !isSpeakingRef.current && recognitionRef.current && !recognitionRef.current.running) {
        startRecognitionSafely();
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (isSpeakingRef.current) {
        return;
      }
      if (isListeningRef.current && !isSpeakingRef.current && recognitionRef.current && !recognitionRef.current.running) {
        startRecognitionSafely();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [router, pathname, selectedItems]);

  const startAssistant = () => {
    if (!recognitionRef.current || isSpeakingRef.current) return;
    
    isListeningRef.current = true;
    setIsListening(true);
    startRecognitionSafely();
    speak("Assistant turned on.");
  };

  const stopAssistant = () => {
    if (!recognitionRef.current) return;
    
    isListeningRef.current = false;
    setIsListening(false);
    try {
      recognitionRef.current.stop();
      console.log("🎤 Recognition stopped");
    } catch (error) {
      console.log("Error stopping recognition:", error);
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    speak("Assistant turned off");
  };

  const toggleListening = () => {
    if (isListening) {
      stopAssistant();
    } else {
      startAssistant();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      <button
        onClick={toggleListening}
        style={{
          position: "relative",
          background: isListening ? "#28a745" : "#6c757d",
          color: "#fff",
          padding: "15px",
          borderRadius: "50%",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
        title={isListening ? "Assistant is listening" : "Assistant is off"}
      >
        {isListening ? <BotIcon size={28} /> : <BotOffIcon size={28} />}
        
        {isListening && (
          <div
            style={{
              position: "absolute",
              top: "-45px",
              left: "50%",
              transform: "translateX(-50%)",
              background: isSpeaking ? "#dc3545" : "#28a745",
              color: "white",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              whiteSpace: "nowrap",
              fontWeight: "bold",
            }}
          >
            {isSpeaking ? "🔊 AI Speaking" : "🎤 Listening"}
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;