const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = require('docx');

function createDoc() {
  const primaryColor = "1E3A8A"; // Deep Navy/Indigo
  const accentColor = "2563EB"; // Royal Blue
  const darkTextColor = "0F172A";
  const lightBgColor = "F8FAFC";
  const borderColor = "CBD5E1";

  // Helper for Section Headings
  const createH1 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 150 },
    run: {
      color: primaryColor,
      bold: true,
      size: 32, // 16pt
      font: "Calibri"
    }
  });

  const createH2 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    run: {
      color: accentColor,
      bold: true,
      size: 26, // 13pt
      font: "Calibri"
    }
  });

  const createH3 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    run: {
      color: primaryColor,
      bold: true,
      size: 22, // 11pt
      font: "Calibri"
    }
  });

  const createP = (text, bold = false) => new Paragraph({
    spacing: { before: 60, after: 100, line: 280 },
    children: [
      new TextRun({
        text: text,
        bold: bold,
        size: 22,
        color: darkTextColor,
        font: "Calibri"
      })
    ]
  });

  const createBullet = (label, text) => new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    children: [
      new TextRun({ text: label + ": ", bold: true, color: primaryColor, size: 21, font: "Calibri" }),
      new TextRun({ text: text, color: darkTextColor, size: 21, font: "Calibri" })
    ]
  });

  const createCallout = (title, text) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "EFF6FF", type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: accentColor }
            },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: title + "\n", bold: true, color: primaryColor, size: 22, font: "Calibri" }),
                  new TextRun({ text: text, color: darkTextColor, size: 20, font: "Calibri" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Table Helpers
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 4, color: borderColor }
  };

  const createHeaderCell = (text, widthPercent) => new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: primaryColor, type: ShadingType.CLEAR },
    borders: cellBorder,
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: text, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })]
      })
    ]
  });

  const createBodyCell = (text, widthPercent, isCode = false) => new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
    borders: cellBorder,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            font: isCode ? "Consolas" : "Calibri",
            size: isCode ? 18 : 20,
            color: isCode ? "0F172A" : darkTextColor
          })
        ]
      })
    ]
  });

  // Build Tables
  const techStackTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Layer / Component", 25),
          createHeaderCell("Technology Used", 30),
          createHeaderCell("Role & Architectural Purpose", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("Frontend Framework", 25),
          createBodyCell("React 18 + Vite (TypeScript)", 30),
          createBodyCell("Fast, modular single-page architecture with reactive state hooks.", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("UI & Styling", 25),
          createBodyCell("Tailwind CSS + Lucide Icons", 30),
          createBodyCell("Accessible, responsive design for desktop and mobile devices.", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("Backend Server", 25),
          createBodyCell("Node.js + Express (TypeScript)", 30),
          createBodyCell("Full-stack REST API proxy, keeping API keys secure on server-side.", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("Artificial Intelligence", 25),
          createBodyCell("@google/genai (Gemini 3.7)", 30),
          createBodyCell("Multi-turn safety chat, phonetic cultural translation, and complaint formulation.", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("Data Persistence", 25),
          createBodyCell("In-Memory DB + LocalStorage Sync", 30),
          createBodyCell("Instant real-time synchronization with resilient offline failover.", 45)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("Security & Auth", 25),
          createBodyCell("JWT + bcrypt.js", 30),
          createBodyCell("Stateless token authorization with encrypted user credentials.", 45)
        ]
      })
    ]
  });

  const apiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Method", 15),
          createHeaderCell("Endpoint Route", 35),
          createHeaderCell("Functional Description", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/auth/login", 35, true),
          createBodyCell("Validates credentials and issues secure JWT bearer token.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/auth/register", 35, true),
          createBodyCell("Onboards new domestic or international traveller profiles.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/price/check", 35, true),
          createBodyCell("Evaluates quoted fare against legal city tariffs and distance heuristics.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("GET", 15, true),
          createBodyCell("/api/providers", 35, true),
          createBodyCell("Lists verified tour, hotel, and transport vendors with trust scores.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("GET", 15, true),
          createBodyCell("/api/providers/:id", 35, true),
          createBodyCell("Retrieves granular 100-point trust score audit for specific vendor.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/ai/chat", 35, true),
          createBodyCell("Interactive travel guidance powered by Google Gemini 3.7 Flash.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/ai/translate", 35, true),
          createBodyCell("Cultural Hindi/English phrase translation with phonetic pronunciation.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("POST", 15, true),
          createBodyCell("/api/ai/complaint-assist", 35, true),
          createBodyCell("Converts raw tourist incident narratives into structured legal drafts.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("GET / POST", 15, true),
          createBodyCell("/api/complaints", 35, true),
          createBodyCell("Logs and tracks consumer grievances with case IDs (TS-2026-XXXXX).", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("GET", 15, true),
          createBodyCell("/api/safety/alerts", 35, true),
          createBodyCell("Delivers verified city advisories, scam hotspots, and safe zones.", 50)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("GET", 15, true),
          createBodyCell("/api/map/markers", 35, true),
          createBodyCell("Provides geo-coordinates of tourist police kiosks, hospitals, and prepaid booths.", 50)
        ]
      })
    ]
  });

  const helplinesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Helpline Number", 25),
          createHeaderCell("Service Authority", 35),
          createHeaderCell("Operating Scope & Availability", 40)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("112", 25, true),
          createBodyCell("National Emergency Response (ERSS)", 35),
          createBodyCell("All-in-one Police, Fire, and Ambulance dispatch across India.", 40)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("1363", 25, true),
          createBodyCell("Ministry of Tourism Helpline", 35),
          createBodyCell("24/7 Multi-lingual assistance for foreign and domestic tourists.", 40)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("1091", 25, true),
          createBodyCell("National Women Helpline", 35),
          createBodyCell("Dedicated 24/7 security and emergency response for women.", 40)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("139", 25, true),
          createBodyCell("RailMadad / Railway Protection Force", 35),
          createBodyCell("Train travel safety, medical emergencies on board, and theft reporting.", 40)
        ]
      }),
      new TableRow({
        children: [
          createBodyCell("1915", 25, true),
          createBodyCell("National Consumer Helpline (NCH)", 35),
          createBodyCell("Official redressal for overcharging, counterfeit sales, and service fraud.", 40)
        ]
      })
    ]
  });

  const doc = new Document({
    creator: "TravelShield Engineering Team",
    title: "TravelShield - Project Specification & Prompt Document",
    description: "Complete technical, architectural, and functional specification for the TravelShield platform.",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // Document Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "TRAVELSHIELD",
                bold: true,
                size: 44,
                color: primaryColor,
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Comprehensive Project Specification, System Architecture & Prompt Document",
                italics: true,
                size: 24,
                color: accentColor,
                font: "Calibri"
              })
            ]
          }),

          createCallout(
            "Executive Overview",
            "TravelShield is an intelligent, full-stack tourist empowerment platform engineered to protect international and domestic travellers in India. The application combats overcharging, prevents common tourist scams, translates regional dialects with cultural context, validates vendor credentials, and connects travellers with official 24/7 emergency response networks."
          ),

          new Paragraph({ spacing: { after: 200 } }),

          // 1. Project Background & Vision
          createH1("1. Project Background & Strategic Vision"),
          createP("Tourism in India attracts millions of international and domestic visitors annually. While the country offers extraordinary cultural richness, visitors frequently encounter challenges such as unregulated transit pricing, aggressive touts at transit hubs, language barriers, and uncertainty regarding legitimate service providers."),
          createP("TravelShield provides a digital sanctuary that operates seamlessly on mobile and desktop. It empowers travellers with authoritative pricing data, real-time Gemini-powered conversational guidance, a 100-point vendor trust verification score, and rapid access to the Ministry of Tourism's 1363 helpline."),

          // 2. Master System Prompt
          createH1("2. Master AI System Prompt"),
          createP("Below is the formal master prompt governing the conversational and analytical behavior of the TravelShield AI engine:"),
          createCallout(
            "System Prompt: TravelShield AI Intelligence",
            "Role: You are TravelShield AI, an authoritative, culturally nuanced, and empathetic safety advisor for travellers in India.\n\n" +
            "Knowledge Base:\n" +
            "• Grounded in verified tariffs (prepaid taxi counters at IGI, CSMT, NDLS, and regulated metered auto-rickshaws).\n" +
            "• Aware of classic transit tout scams (e.g. 'hotel has burned down', 'road is blocked for festival', unofficial booking offices).\n" +
            "• Proficient in Hindi and English cultural context, recommending respectful bargaining and boundary phrases.\n" +
            "• Instructs travellers on women's safety (designated metro coaches, GPS tracking verification, well-lit pedestrian corridors).\n" +
            "• In emergency contexts, directs users instantly to 112 (Universal Emergency) or 1363 (Tourist Police)."
          ),

          // 3. Technical Architecture
          createH1("3. System Architecture & Technology Stack"),
          createP("The platform adopts a decoupled full-stack architecture running inside a cloud container. All third-party secrets and Gemini AI tokens remain strictly encapsulated within the Node.js Express server to ensure total client-side security."),
          techStackTable,

          new Paragraph({ spacing: { after: 200 } }),

          // 4. Detailed Functional Modules
          createH1("4. Core Functional Modules"),

          createH2("4.1. Fair Price & Transport Fare Checker (/price-check)"),
          createP("Prevents airport, train station, and street overcharging by benchmarking user-entered quotes against legal tariffs and distance heuristics."),
          createBullet("Route Benchmarking", "Maintains calibrated tariff reference tables for major transit pairs (e.g. IGI Airport to Central Delhi, Old Delhi Railway Station to South Extension)."),
          createBullet("Dynamic Kilometric Heuristic", "When an unlisted route is entered, calculates reference bounds: Base Fare (₹30) + (Distance in km × ₹11 to ₹25 rate card) + night surcharges."),
          createBullet("Status Classification", "Outputs structured verdict: FAIR (within 15% of standard), HIGH (16%–60% above standard), or POSSIBLE OVERCHARGING (scam risk)."),
          createBullet("Alternative Recommendations", "Recommends official government prepaid booths and certified metro connections."),

          createH2("4.2. TravelShield AI Assistant (/ai-assistant)"),
          createP("A multi-turn conversational interface powered by Google Gemini 3.7 Flash."),
          createBullet("Scam Defense", "Evaluates real-time scenarios described by users and alerts them if they are targeted by known tout strategies."),
          createBullet("Solo Travel Guidance", "Advises on safe transit timings, verified accommodations, and cultural etiquette."),
          createBullet("Food & Water Safety", "Delivers hygiene tips regarding bottled water seals, street food safety, and reputable dining hubs."),

          createH2("4.3. Smart Cultural Translator (/translate)"),
          createP("Goes beyond literal translation by equipping visitors with local context and phonetic guidance."),
          createBullet("Phonetic Pronunciation", "Provides easy Romanized pronunciation (e.g. 'Meter se chaloge?')."),
          createBullet("Cultural Context Note", "Explains the tone, etiquette, and social expectations behind phrases."),
          createBullet("Negotiation Safety Tips", "Recommends appropriate counter-phrases to prevent misunderstandings or exploitation."),

          createH2("4.4. Verified Provider Trust Engine (/services)"),
          createP("A searchable directory of audited hotels, transport operators, guides, and restaurants."),
          createBullet("100-Point Algorithmic Score", "30% Official License Verification + 25% Verified Reviews + 20% Clean Grievance Record + 15% Transparent Invoicing + 10% Safety Equipment."),
          createBullet("Trust Badges", "Categorizes vendors into 'Highly Trusted' (90–100), 'Trusted' (75–89), 'Moderate' (60–74), and 'Needs Caution' (<60)."),

          createH2("4.5. Grievance & Complaint Redressal Assistant (/complaints)"),
          createP("Transforms informal user complaints into structured, legally actionable consumer grievance reports."),
          createBullet("Automated Case ID Generation", "Issues formal reference identifiers (e.g. TS-2026-88192)."),
          createBullet("Statutory Reference", "Cites relevant sections of the Indian Consumer Protection Act 2019 and Motor Vehicles Act."),
          createBullet("Evidence Checklist", "Advises on preserving UPI transaction receipts, vehicle registration photos, and ticket stubs."),

          createH2("4.6. Safety Radar & Emergency SOS (/safety)"),
          createP("Real-time geolocation-based situational awareness."),
          createBullet("City Advisories", "Active notices for high-density tout areas, seasonal weather alerts, and transport strikes."),
          createBullet("Point of Interest Mapping", "Interactive map displaying Tourist Police booths, 24-hour hospitals, and official helpdesks."),
          createBullet("1-Click Emergency SOS", "Instant dialer interface for national helplines."),

          createH2("4.7. Trip Safety Vault (/my-trips)"),
          createP("Allows travellers to store emergency contacts, hotel bookings, and generated itinerary safety tokens (e.g. TS-TRIP-9921) to share with embassies or family."),

          // 5. REST API Documentation
          createH1("5. REST API Endpoints Specification"),
          createP("All endpoints conform to standard REST conventions and communicate via JSON:"),
          apiTable,

          new Paragraph({ spacing: { after: 200 } }),

          // 6. Emergency Directory
          createH1("6. Official Indian Emergency Helpline Directory"),
          createP("The application natively incorporates direct telephone and protocol links to verified national public safety services:"),
          helplinesTable,

          new Paragraph({ spacing: { after: 250 } }),

          // 7. Security & Compliance
          createH1("7. Security, Privacy & Reliability Mandates"),
          createBullet("Zero API Key Leakage", "All Gemini and server-side secret tokens are stored in environment variables on the backend."),
          createBullet("Offline Resilience", "In the event of network disruption or spotty roaming data, the client application falls back onto calibrated local databases without throwing unhandled exceptions."),
          createBullet("Data Privacy", "Tourist travel itineraries and complaint logs are stored locally with stateless JWT authorization."),

          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "— End of Official TravelShield Documentation —",
                italics: true,
                color: "64748B",
                size: 20,
                font: "Calibri"
              })
            ]
          })
        ]
      }
    ]
  });

  return doc;
}

async function main() {
  const doc = createDoc();
  const buffer = await Packer.toBuffer(doc);
  
  // Save in root
  const rootFilePath = path.join(process.cwd(), 'TravelShield_Project_Documentation.docx');
  fs.writeFileSync(rootFilePath, buffer);
  console.log(`Saved docx to: ${rootFilePath} (${buffer.length} bytes)`);

  // Ensure public/ directory exists and save there
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicFilePath = path.join(publicDir, 'TravelShield_Project_Documentation.docx');
  fs.writeFileSync(publicFilePath, buffer);
  console.log(`Saved docx to: ${publicFilePath}`);

  // Also save in dist/ if dist exists
  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const distFilePath = path.join(distDir, 'TravelShield_Project_Documentation.docx');
    fs.writeFileSync(distFilePath, buffer);
    console.log(`Saved docx to: ${distFilePath}`);
  }
}

main().catch(err => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
