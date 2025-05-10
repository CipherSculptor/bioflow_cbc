document.addEventListener("DOMContentLoaded", () => {
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");

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

  try {
    // Load user details and results
    const userData = JSON.parse(localStorage.getItem("userDetails") || "{}");
    console.log("User data from localStorage:", userData);

    // Check if we have prediction results
    if (!userData.results) {
      console.error("No results found in localStorage");
      alert("No results found. Redirecting to dashboard.");
      window.location.href = "dashboard.html";
      return;
    }

    // Display results in the form
    document.getElementById("resultName").value = userData.results.name || "-";

    // Display age
    document.getElementById("resultAge").value = userData.results.age || "-";

    // Display gender
    document.getElementById("resultGender").value =
      userData.results.gender || "-";

    // Check if we have the new nested results format
    const resultsData = userData.results.results || {};
    console.log("Results data:", resultsData);

    // Function to display a parameter value with status styling
    function displayParameter(elementId, paramKey) {
      const element = document.getElementById(elementId);
      if (!element) return; // Skip if element doesn't exist

      if (resultsData[paramKey]) {
        element.value = resultsData[paramKey].value || "-";
        applyStatusStyling(element, resultsData[paramKey].status);
      } else {
        element.value = "-";
      }
    }

    // Display all CBC parameters
    displayParameter("resultHemoglobin", "hgb");
    displayParameter("resultRBCCount", "rbc");
    displayParameter("resultWBCCount", "tlc");
    displayParameter("resultPlateletsCount", "plt");
    displayParameter("resultPCV", "pcv");
    displayParameter("resultMCV", "mcv");
    displayParameter("resultMCH", "mch");
    displayParameter("resultMCHC", "mchc");
    displayParameter("resultRDW", "rdw");

    console.log("Results displayed successfully");
  } catch (error) {
    console.error("Error loading results:", error);
    alert("Error loading results: " + error.message);
  }
});

// Function to apply styling based on status
function applyStatusStyling(element, status) {
  // Remove any existing status classes
  element.classList.remove("status-low", "status-normal", "status-high");

  // Add appropriate status class
  element.classList.add(`status-${status}`);

  // Add a status indicator element after the input
  const container = element.parentElement;

  // Remove any existing status indicators
  const existingIndicator = container.querySelector(".status-indicator");
  if (existingIndicator) {
    container.removeChild(existingIndicator);
  }

  // Create new status indicator
  const statusIndicator = document.createElement("div");
  statusIndicator.className = `status-indicator ${status}`;
  statusIndicator.textContent =
    status.charAt(0).toUpperCase() + status.slice(1);
  container.appendChild(statusIndicator);
}

// Function to generate and download PDF
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Function to add header to each page
    function addHeader(doc) {
      // Add header
      doc.setFillColor(248, 248, 255); // Light background
      doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

      doc.setFontSize(22);
      doc.setTextColor(120, 3, 3);
      doc.text("BioFlow - Blood Test Results", 105, 20, { align: "center" });

      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const today = new Date();
      doc.text(`Date: ${today.toLocaleDateString()}`, 105, 30, {
        align: "center",
      });

      // Add a subtle line under the header
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
    }

    // We'll add headers after all content is added

    // Add content
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    // Get basic patient information
    const name = document.getElementById("resultName").value;
    const age = document.getElementById("resultAge").value;
    const gender = document.getElementById("resultGender").value;

    // Get all CBC parameters
    const hemoglobin = document.getElementById("resultHemoglobin").value;
    const rbcCount = document.getElementById("resultRBCCount").value;
    const wbcCount = document.getElementById("resultWBCCount")?.value || "";
    const plateletsCount = document.getElementById(
      "resultPlateletsCount"
    ).value;
    const pcv = document.getElementById("resultPCV")?.value || "";
    const mcv = document.getElementById("resultMCV")?.value || "";
    const mch = document.getElementById("resultMCH")?.value || "";
    const mchc = document.getElementById("resultMCHC")?.value || "";
    const rdw = document.getElementById("resultRDW")?.value || "";

    // Get status information if available
    const userData = JSON.parse(localStorage.getItem("userDetails") || "{}");
    const resultsData = userData.results?.results || {};

    // Function to add a parameter to the PDF with its status
    function addParameterToPdf(doc, label, value, status, x, y) {
      if (!value || value === "-") return y; // Skip if no value

      // Check if we're getting too close to the bottom of the page
      const pageHeight = doc.internal.pageSize.height;
      if (y > pageHeight - 40) {
        // Leave 40 units margin at the bottom
        doc.addPage();
        y = 30; // Reset Y position on the new page
      }

      // Draw a light background for better readability
      doc.setFillColor(248, 248, 248);
      doc.rect(x - 5, y - 15, 180, 20, "F");

      // Add the parameter text
      doc.text(`${label}: ${value}`, x, y);

      // Add status if available
      if (status) {
        doc.setFontSize(12);
        setStatusColor(doc, status);
        doc.text(`Status: ${status.toUpperCase()}`, 150, y);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
      }

      return y + 25; // Return the next Y position with more spacing
    }

    // Add patient information - start below the header
    doc.text(`Name: ${name}`, 20, 60);
    doc.text(`Age: ${age}`, 20, 80);
    doc.text(`Gender: ${gender}`, 20, 100);

    // Add CBC parameters with status
    let currentY = 120;

    // First page parameters
    currentY = addParameterToPdf(
      doc,
      "Hemoglobin (HGB)",
      hemoglobin,
      resultsData.hgb?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "RBC Count",
      rbcCount,
      resultsData.rbc?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "WBC Count",
      wbcCount,
      resultsData.tlc?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "Platelets Count",
      plateletsCount,
      resultsData.plt?.status,
      20,
      currentY
    );

    // Additional parameters
    currentY = addParameterToPdf(
      doc,
      "Hematocrit (PCV)",
      pcv,
      resultsData.pcv?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "Mean Cell Volume (MCV)",
      mcv,
      resultsData.mcv?.status,
      20,
      currentY
    );

    currentY = addParameterToPdf(
      doc,
      "Mean Cell Hemoglobin (MCH)",
      mch,
      resultsData.mch?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "MCHC",
      mchc,
      resultsData.mchc?.status,
      20,
      currentY
    );
    currentY = addParameterToPdf(
      doc,
      "Red Cell Distribution Width (RDW)",
      rdw,
      resultsData.rdw?.status,
      20,
      currentY
    );

    // Now add headers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeader(doc);
    }

    // Add footer to each page
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 10;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "This report is generated by BioFlow. Results are based on machine learning predictions.",
        105,
        footerY,
        { align: "center" }
      );

      // Add page numbers
      doc.text(`Page ${i} of ${totalPages}`, 105, footerY - 10, {
        align: "center",
      });
    }

    // Save the PDF
    doc.save(`BioFlow_Report_${name.replace(/\s+/g, "_")}.pdf`);

    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF: " + error.message);
  }
}

// Helper function to set PDF text color based on status
function setStatusColor(doc, status) {
  switch (status) {
    case "low":
      doc.setTextColor(255, 0, 0); // Red
      break;
    case "high":
      doc.setTextColor(255, 165, 0); // Orange
      break;
    case "normal":
      doc.setTextColor(0, 128, 0); // Green
      break;
    default:
      doc.setTextColor(0, 0, 0); // Black
  }
}
