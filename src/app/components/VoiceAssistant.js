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
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
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
    recognition.lang = "en-US";
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
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("🎤 You said:", transcript);

      if (stopPhrases.some((phrase) => transcript.includes(phrase))) {
        const goodbye = new SpeechSynthesisUtterance("Goodbye!");
        window.speechSynthesis.speak(goodbye);
        stopAssistant();
        return;
      }

      // Navigation
      const { action, path } = processCommand(transcript);
      if (action === "navigate" && path) {
        router.push(path);
        return;
      }

      // Login
      const loginIntent = parseLoginIntent(transcript);
        if (loginIntent.action === "login_intent" && pathname === "/login") {
        const { email, password, submit } = loginIntent.entities;

        const performLoginActions = () => {
          if (email || password) {
            window.dispatchEvent(
              new CustomEvent("voicePartialLogin", {
                detail: {
                  email: email || "",
                  password: password || "",
                },
              })
            );
          }
          if (submit) {
            window.dispatchEvent(new CustomEvent("voiceLoginSubmit"));
          }
        };

        if (pathname !== "/login") {
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

      
     // Register
     const registerIntent = parseRegisterIntent(transcript, roleRef.current);
if (registerIntent.action === "register_intent" && pathname === "/register") {
  const {
    email,
    password,
    phone,
    fullName,
    storeName,
    userType,
    submit,
  } = registerIntent.entities;

  const targetPath = "/register";

  const performRegisterActions = () => {
    window.dispatchEvent(
      new CustomEvent("voiceRegister", {
        detail: {
          email,
          password,
          phone,
          fullName,
          storeName,
          userType, 
        },
      })
    );
    if (submit) {
      window.dispatchEvent(new CustomEvent("voiceRegisterSubmit"));
    }
  };

const alreadySeller = pathname === "/register" && userType === "seller";
const alreadyCustomer = pathname === "/register" && userType === "customer";

// If already on correct view, just fill the form
if ((userType === "seller" && alreadySeller) || (userType === "customer" && alreadyCustomer)) {
  performRegisterActions();
} else {
  // Navigate to register and wait for page load
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
  const showKeywords = ["show", "available", "options", "display", "list", "what are", "tell me"];
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

      // Fallback
      const fallback = new SpeechSynthesisUtterance(
        "Sorry, I didn’t understand that."
      );
      window.speechSynthesis.speak(fallback);
    };

    recognition.onend = () => {
      if (isListeningRef.current && recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    return () => {
      recognition.stop();
    };
  }, [router, pathname]);

  const startAssistant = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    isListeningRef.current = true;
    setIsListening(true);
    const speak = new SpeechSynthesisUtterance("Assistant turned on.");
    window.speechSynthesis.speak(speak);
  };

  const stopAssistant = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    isListeningRef.current = false;
    setIsListening(false);
    const speak = new SpeechSynthesisUtterance("Assistant turned off.");
    window.speechSynthesis.speak(speak);
  };

  const toggleListening = () => {
    if (isListening) {
      stopAssistant();
    } else {
      startAssistant();
    }
  };

  return (
    <button
      onClick={toggleListening}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: isListening ? "#28a745" : "#6c757d",
        color: "#fff",
        padding: "15px",
        borderRadius: "50%",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
      title={isListening ? "Assistant is listening" : "Assistant is off"}
    >
      {isListening ? <BotIcon size={28} /> : <BotOffIcon size={28} />}
    </button>
  );
};

export default VoiceAssistant;
