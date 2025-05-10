document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("evaluationForm");
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");
  const userDisplayName = document.getElementById("user-display-name");
  const logoutButton = document.getElementById("logout-button");

  // Check authentication state
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in
      console.log("User is signed in:", user);

      // Update display name
      if (user.displayName) {
        userDisplayName.textContent = user.displayName;
      } else if (user.email) {
        // If no display name, use email without domain
        userDisplayName.textContent = user.email.split("@")[0];
      }

      // Store user info in localStorage for other pages
      localStorage.setItem("userEmail", user.email);
      if (user.displayName) {
        localStorage.setItem("userName", user.displayName);
      }

      // Pre-fill the name field with user's display name or email username
      const nameInput = document.getElementById("userName");
      if (nameInput) {
        if (user.displayName) {
          nameInput.value = user.displayName;
        } else if (user.email) {
          // If no display name, use email without domain
          nameInput.value = user.email.split("@")[0];
        }

        // Also check if there's a stored name from previous submissions
        const storedUserDetails = JSON.parse(
          localStorage.getItem("userDetails") || "{}"
        );
        if (storedUserDetails.name) {
          nameInput.value = storedUserDetails.name;
        }
      }
    } else {
      // No user is signed in, redirect to login
      console.log("No user is signed in. Redirecting to login...");
      window.location.href = "index.html";
    }
  });

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();

      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful
          console.log("User signed out successfully");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          window.location.href = "index.html";
        })
        .catch((error) => {
          // An error happened
          console.error("Error signing out:", error);
          alert("Failed to sign out: " + error.message);
        });
    });
  }

  // Toggle profile dropdown
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target)) {
      profileDropdown.classList.remove("show");
    }
  });

  // Update API URL to work with Netlify environment variables or custom URL
  // Check for a custom API URL in localStorage first
  const customApiUrl = localStorage.getItem("customApiUrl");

  // Use the custom URL if available, otherwise use the Netlify environment variable or fallback to production URL
  const apiUrl =
    customApiUrl ||
    (window.netlifyEnv && window.netlifyEnv.API_URL) ||
    "https://bioflow-2.onrender.com"; // Production URL

  // Add a button to allow changing the API URL
  const headerRight = document.querySelector(".header-right");
  if (headerRight) {
    const settingsBtn = document.createElement("button");
    settingsBtn.className = "settings-btn";
    settingsBtn.innerHTML = "⚙️";
    settingsBtn.title = "Change API Server";
    settingsBtn.style.marginRight = "15px";
    settingsBtn.style.background = "none";
    settingsBtn.style.border = "none";
    settingsBtn.style.fontSize = "20px";
    settingsBtn.style.cursor = "pointer";

    settingsBtn.addEventListener("click", () => {
      const newUrl = prompt("Enter the backend API URL:", apiUrl);
      if (newUrl && newUrl !== apiUrl) {
        localStorage.setItem("customApiUrl", newUrl);
        alert(
          `API URL updated to: ${newUrl}\nPlease refresh the page to apply changes.`
        );
        location.reload();
      }
    });

    headerRight.insertBefore(settingsBtn, headerRight.firstChild);
  }

  // Add loading overlay styles if not already in CSS
  if (!document.getElementById("loading-styles")) {
    const style = document.createElement("style");
    style.id = "loading-styles";
    style.textContent = `
            #loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 1000;
                color: white;
                font-size: 1.2rem;
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 20px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-message {
                margin-top: 15px;
                text-align: center;
                max-width: 80%;
                line-height: 1.5;
            }

            .server-status {
                margin-top: 15px;
                padding: 10px 15px;
                border-radius: 5px;
                background-color: rgba(255, 255, 255, 0.1);
                text-align: center;
                max-width: 80%;
            }

            .server-status.error {
                background-color: rgba(220, 53, 69, 0.2);
                border: 1px solid rgba(220, 53, 69, 0.5);
            }

            .server-status.warning {
                background-color: rgba(255, 193, 7, 0.2);
                border: 1px solid rgba(255, 193, 7, 0.5);
            }

            .server-status.success {
                background-color: rgba(40, 167, 69, 0.2);
                border: 1px solid rgba(40, 167, 69, 0.5);
            }

            .timeout-btn, .retry-btn {
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #4d68b2;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s;
            }

            .timeout-btn:hover, .retry-btn:hover {
                background-color: #3a4f87;
            }

            .retry-btn {
                background-color: #28a745;
                margin-left: 10px;
            }

            .retry-btn:hover {
                background-color: #218838;
            }

            .server-message {
                font-size: 1rem;
                margin-top: 10px;
                color: #f8f9fa;
            }

            .progress-bar-container {
                width: 100%;
                max-width: 300px;
                height: 10px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                margin-top: 15px;
                overflow: hidden;
            }

            .progress-bar {
                height: 100%;
                width: 0%;
                background-color: #4d68b2;
                border-radius: 5px;
                transition: width 0.5s;
            }
        `;
    document.head.appendChild(style);
  }

  // Show enhanced loading state
  function showLoadingState(
    message = "Processing your request...",
    status = null
  ) {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById("loading-overlay");
    let progressBar = null;
    let progressValue = 0;

    if (!loadingOverlay) {
      loadingOverlay = document.createElement("div");
      loadingOverlay.id = "loading-overlay";

      // Basic structure with spinner and message
      loadingOverlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="server-progress-bar"></div>
                </div>
            `;

      // Add status message if provided
      if (status) {
        const statusDiv = document.createElement("div");
        statusDiv.className = `server-status ${status.type || ""}`;
        statusDiv.innerHTML = `
                    <strong>${status.title || ""}</strong>
                    <div class="server-message">${status.message || ""}</div>
                `;

        // Add buttons if provided
        if (status.buttons) {
          const buttonContainer = document.createElement("div");
          buttonContainer.style.marginTop = "15px";

          status.buttons.forEach((btn) => {
            const button = document.createElement("button");
            button.className = btn.class || "timeout-btn";
            button.id = btn.id || "";
            button.textContent = btn.text || "Button";
            buttonContainer.appendChild(button);
          });

          statusDiv.appendChild(buttonContainer);
        }

        loadingOverlay.appendChild(statusDiv);
      }

      document.body.appendChild(loadingOverlay);

      // Start progress animation
      progressBar = document.getElementById("server-progress-bar");
      if (progressBar && message.includes("Connecting")) {
        const interval = setInterval(() => {
          progressValue += 1;
          if (progressValue <= 100) {
            progressBar.style.width = `${progressValue}%`;
          } else {
            clearInterval(interval);
          }
        }, 500);
      }
    } else {
      // Update existing overlay
      const messageEl = loadingOverlay.querySelector(".loading-message");
      if (messageEl) messageEl.textContent = message;

      // Update or add status if provided
      if (status) {
        let statusDiv = loadingOverlay.querySelector(".server-status");

        if (!statusDiv) {
          statusDiv = document.createElement("div");
          statusDiv.className = `server-status ${status.type || ""}`;
          loadingOverlay.appendChild(statusDiv);
        } else {
          statusDiv.className = `server-status ${status.type || ""}`;
        }

        statusDiv.innerHTML = `
                    <strong>${status.title || ""}</strong>
                    <div class="server-message">${status.message || ""}</div>
                `;

        // Add buttons if provided
        if (status.buttons) {
          const buttonContainer = document.createElement("div");
          buttonContainer.style.marginTop = "15px";

          status.buttons.forEach((btn) => {
            const button = document.createElement("button");
            button.className = btn.class || "timeout-btn";
            button.id = btn.id || "";
            button.textContent = btn.text || "Button";
            buttonContainer.appendChild(button);

            // Add event listener if provided
            if (btn.onClick) {
              button.addEventListener("click", btn.onClick);
            }
          });

          statusDiv.appendChild(buttonContainer);
        }
      }

      loadingOverlay.style.display = "flex";

      // Update progress bar if connecting
      if (message.includes("Connecting")) {
        progressBar = document.getElementById("server-progress-bar");
        if (progressBar) {
          progressValue = 0;
          const interval = setInterval(() => {
            progressValue += 1;
            if (progressValue <= 100) {
              progressBar.style.width = `${progressValue}%`;
            } else {
              clearInterval(interval);
            }
          }, 500);
        }
      }
    }

    // Disable the submit button
    const submitBtn = form.querySelector(".evaluate-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }
  }

  // Hide loading state
  function hideLoadingState() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }

    // Re-enable the submit button
    const submitBtn = form.querySelector(".evaluate-btn");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Evaluate";
    }
  }

  // Show server error state with retry option
  function showServerError(errorMessage, isStartingUp = false) {
    const status = {
      type: isStartingUp ? "warning" : "error",
      title: isStartingUp ? "Server is Starting Up" : "Connection Error",
      message: `${errorMessage}\n\nCurrent API URL: ${apiUrl}`,
      buttons: [
        {
          id: "cancel-request-btn",
          text: "Cancel",
          class: "timeout-btn",
          onClick: () => {
            hideLoadingState();
          },
        },
        {
          id: "retry-request-btn",
          text: "Retry",
          class: "retry-btn",
          onClick: () => {
            // Reset the form submission
            showLoadingState("Reconnecting to the server...");

            // Try to ping the server again
            fetch(`${apiUrl}/test`)
              .then((response) => {
                if (response.ok) {
                  showLoadingState("Server is now available!", {
                    type: "success",
                    title: "Connected Successfully",
                    message: "You can now submit your data for analysis.",
                    buttons: [
                      {
                        id: "continue-btn",
                        text: "Continue",
                        class: "retry-btn",
                        onClick: () => {
                          hideLoadingState();
                        },
                      },
                    ],
                  });
                } else {
                  showServerError(
                    "Server is still unavailable. Please try again later.",
                    true
                  );
                }
              })
              .catch(() => {
                showServerError(
                  "Could not connect to the server. Please try again later.",
                  true
                );
              });
          },
        },
        {
          id: "change-server-btn",
          text: "Change Server URL",
          class: "timeout-btn",
          onClick: () => {
            // Show a form to enter a new server URL
            const currentUrl = apiUrl;
            const newUrl = prompt(
              "Enter the backend server URL (e.g., https://your-app.onrender.com):",
              currentUrl
            );

            if (newUrl && newUrl !== currentUrl) {
              // Store the new URL in localStorage
              localStorage.setItem("customApiUrl", newUrl);

              // Update the current apiUrl variable
              window.netlifyEnv.API_URL = newUrl;

              // Show message about the change
              showLoadingState("Server URL updated", {
                type: "success",
                title: "URL Changed",
                message: `The server URL has been changed to: ${newUrl}. Trying to connect...`,
                buttons: [
                  {
                    id: "test-new-url-btn",
                    text: "Test Connection",
                    class: "retry-btn",
                    onClick: () => {
                      showLoadingState("Testing connection to new server...");

                      // Try to ping the new server
                      fetch(`${newUrl}/test`)
                        .then((response) => {
                          if (response.ok) {
                            showLoadingState("New server is available!", {
                              type: "success",
                              title: "Connected Successfully",
                              message:
                                "You can now submit your data for analysis with the new server.",
                              buttons: [
                                {
                                  id: "continue-new-server-btn",
                                  text: "Continue",
                                  class: "retry-btn",
                                  onClick: () => {
                                    hideLoadingState();
                                  },
                                },
                              ],
                            });
                          } else {
                            showServerError(
                              "New server URL is not responding correctly. Please check the URL and try again.",
                              false
                            );
                          }
                        })
                        .catch(() => {
                          showServerError(
                            "Could not connect to the new server URL. Please check the URL and try again.",
                            false
                          );
                        });
                    },
                  },
                ],
              });
            } else if (newUrl === currentUrl) {
              showLoadingState("No change made", {
                type: "warning",
                title: "Same URL",
                message:
                  "You entered the same URL that was already being used.",
                buttons: [
                  {
                    id: "ok-btn",
                    text: "OK",
                    class: "retry-btn",
                    onClick: () => {
                      hideLoadingState();
                    },
                  },
                ],
              });
            }
          },
        },
      ],
    };

    showLoadingState("Waiting for server...", status);
  }

  // Add a function to handle backend timeouts
  function handleLongRequest(timeout = 30000) {
    return new Promise((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        showServerError(
          "The server is taking longer than expected. This usually happens when the server is starting up after being inactive. Please wait or try again in a minute.",
          true
        );
      }, timeout);

      // Clear timeout on resolve
      resolve(() => clearTimeout(timeoutId));
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Get form elements by ID
      const nameInput = document.getElementById("userName");
      const ageInput = document.getElementById("userAge");
      const genderSelect = document.getElementById("userGender");
      const permittivityInput = document.getElementById("userPermittivity");

      // Basic validation
      if (!ageInput || !ageInput.value) {
        throw new Error("Age is required");
      }

      if (!genderSelect || !genderSelect.value) {
        throw new Error("Gender is required");
      }

      if (!permittivityInput || permittivityInput.value === "") {
        throw new Error("Permittivity value is required");
      }

      // Convert permittivity to float
      const permittivityValue = parseFloat(permittivityInput.value);

      if (isNaN(permittivityValue)) {
        throw new Error("Permittivity must be a valid number");
      }

      // Create the form data object with selected values
      let userName = nameInput ? nameInput.value.trim() : "";

      // If name is empty, try to get it from localStorage or Firebase user
      if (!userName) {
        // Try to get from localStorage
        const storedName = localStorage.getItem("userName");
        if (storedName) {
          userName = storedName;
        } else {
          // Try to get from Firebase user
          const user = firebase.auth().currentUser;
          if (user) {
            if (user.displayName) {
              userName = user.displayName;
            } else if (user.email) {
              userName = user.email.split("@")[0];
            }
          }
        }

        // Update the input field with the found name
        if (userName && nameInput) {
          nameInput.value = userName;
        }
      }

      const formData = {
        name: userName,
        age: ageInput ? parseInt(ageInput.value) || 0 : 0,
        gender: genderSelect ? genderSelect.value : "",
        permittivity: permittivityValue,
      };

      // Show enhanced loading state
      showLoadingState("Getting ready to process your data...");

      // Start the timeout handler
      const clearTimeout = await handleLongRequest(5000);

      try {
        // Try to check API availability first
        showLoadingState("Connecting to the server...");

        // First try to ping the endpoint to wake up the server
        try {
          const testResponse = await fetch(`${apiUrl}/test`);
          if (!testResponse.ok) {
            throw new Error("Server test endpoint returned an error");
          }
          console.log("Server is available and responding");
        } catch (pingError) {
          console.log("API ping failed, server might be starting up");

          // Show a more user-friendly message about server startup
          showServerError(
            "The server appears to be starting up. This is normal after a period of inactivity and usually takes about 30-60 seconds. You can wait or try again later.",
            true
          );

          // Stop further execution
          return;
        }

        // Now send the actual prediction request
        showLoadingState("Analyzing data...");

        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Clear the timeout since request completed
        clearTimeout();

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get prediction");
        }

        const responseData = await response.json();

        // Store both form data and results
        localStorage.setItem(
          "userDetails",
          JSON.stringify({
            ...formData,
            results: responseData,
          })
        );

        // Redirect to results page
        window.location.href = "results.html";
      } catch (networkError) {
        // Clear timeout
        clearTimeout();

        console.error("Network error:", networkError);

        if (
          networkError.message.includes("Failed to fetch") ||
          networkError.message.includes("NetworkError") ||
          networkError.message.includes("offline")
        ) {
          // Show a better UI for connection errors
          showServerError(
            "The server appears to be offline or unreachable. This might be because it's starting up after being inactive (which takes about 30-60 seconds) or experiencing temporary issues. You can wait or try again later.",
            true
          );
        } else {
          // Show other errors in the UI instead of an alert
          showServerError(`Error: ${networkError.message}`, false);
        }
      }
    } catch (error) {
      hideLoadingState();
      console.error("Form error:", error);
      alert(`Error: ${error.message}`);
    }
  });
});
