// ============================================================
// Figma Plugin – Catalin Sandru Portfolio
// Recreates index.html at 1440px desktop width.
//
// FONTS: Uses "Inter" (always bundled in Figma) as a stand-in
// for AvantGardePro. After the frames are created, select all
// text and swap to ITCAvantGardePro if you have it installed.
// ============================================================

async function loadAllFonts() {
  const variants = ["Regular", "Light", "Medium", "SemiBold", "Bold"];
  for (const style of variants) {
    await figma.loadFontAsync({ family: "Inter", style });
  }
}

// ── Color helpers ────────────────────────────────────────────
function rgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}
function fill(hex, opacity = 1) {
  return [{ type: "SOLID", color: rgb(hex), opacity }];
}
function noFill() {
  return [];
}

// ── Primitive helpers ────────────────────────────────────────
function rect(parent, x, y, w, h, hex, opacity = 1, name = "Rect") {
  const r = figma.createRectangle();
  r.name = name;
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = fill(hex, opacity);
  parent.appendChild(r);
  return r;
}

function frame(parent, x, y, w, h, hex, name = "Frame") {
  const f = figma.createFrame();
  f.name = name;
  f.x = x; f.y = y;
  f.resize(w, h);
  f.fills = hex ? fill(hex) : noFill();
  f.clipsContent = false;
  if (parent) parent.appendChild(f);
  return f;
}

// ── Text helper ──────────────────────────────────────────────
// All fonts must already be loaded before calling this.
function txt(parent, content, x, y, opts = {}) {
  const {
    size = 16,
    weight = "Regular",
    color = "#161616",
    opacity = 1,
    fixedW = null,
    lineH = null,
    tracking = 0,
    align = "LEFT",
    decoration = "NONE",
    name = "Text",
  } = opts;

  const node = figma.createText();
  node.name = name;
  node.fontName = { family: "Inter", weight: weight, style: weight };
  node.fontSize = size;
  node.letterSpacing = { value: tracking, unit: "PIXELS" };
  if (lineH) node.lineHeight = { value: lineH, unit: "PIXELS" };
  node.textAlignHorizontal = align;
  if (decoration !== "NONE") node.textDecoration = decoration;

  if (fixedW) {
    node.textAutoResize = "HEIGHT";
    node.resize(fixedW, 40);
  } else {
    node.textAutoResize = "WIDTH_AND_HEIGHT";
  }

  node.characters = content;
  node.fills = fill(color, opacity);
  node.x = x;
  node.y = y;

  if (parent) parent.appendChild(node);
  return node;
}

// Inline mixed-color text (blue year + dark company)
function inlineRow(parent, x, y, blueStr, darkStr) {
  const blue = txt(parent, blueStr, x, y, { size: 16, weight: "Bold", color: "#005397" });
  txt(parent, "  " + darkStr, x + blue.width, y, {
    size: 16, weight: "Regular", color: "#1d1d1d", opacity: 0.68
  });
  return 30; // height consumed per row
}

// ── Button helper ────────────────────────────────────────────
function btn(parent, label, x, y, borderHex = "#161616", textHex = "#161616") {
  const W = 164, H = 52;
  const f = figma.createFrame();
  f.name = `Button – ${label}`;
  f.resize(W, H);
  f.x = x; f.y = y;
  f.fills = noFill();
  f.strokes = [{ type: "SOLID", color: rgb(borderHex) }];
  f.strokeWeight = 2;
  f.strokeAlign = "INSIDE";
  f.clipsContent = false;
  parent.appendChild(f);

  const t = figma.createText();
  t.fontName = { family: "Inter", style: "Medium" };
  t.fontSize = 14;
  t.letterSpacing = { value: 1.2, unit: "PIXELS" };
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  t.characters = label;
  t.fills = fill(textHex);
  t.x = (W - t.width) / 2;
  t.y = (H - t.height) / 2;
  f.appendChild(t);
  return f;
}

// ════════════════════════════════════════════════════════════
// MAIN BUILD FUNCTION
// ════════════════════════════════════════════════════════════
async function build() {
  await loadAllFonts();

  const FW    = 1440;   // total frame width
  const GW    = 1200;   // grid width
  const GX    = (FW - GW) / 2;   // 120 px – grid left edge
  const COL   = GW / 2;           // 600 px – column width

  // ── Root frame ──────────────────────────────────────────
  const root = frame(null, 0, 0, FW, 100, "#ffffff", "Portfolio – Catalin Sandru");
  figma.currentPage.appendChild(root);

  let Y = 0; // running y-position inside root

  // ══════════════════════════════════════════════════════════
  // 1. HERO SECTION  (960 px tall)
  // ══════════════════════════════════════════════════════════
  const HERO_H = 960;
  const hero = frame(root, 0, Y, FW, HERO_H, null, "Section – Hero");
  hero.clipsContent = true;

  // Dark video-background fill
  rect(hero, 0, 0, FW, HERO_H, "#1a1208", 1, "Video BG");

  // Semi-transparent white overlay (rgba 255,255,255 / 0.7)
  const ov = figma.createRectangle();
  ov.name = "White Overlay";
  ov.resize(FW, HERO_H);
  ov.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.7 }];
  hero.appendChild(ov);

  // ── Hamburger  (top-right black box) ──
  const hamX = FW - Math.round(FW * 0.05) - 60;
  const ham = frame(hero, hamX, 0, 60, 60, "#161616", "Hamburger");
  for (const ly of [19, 29, 39]) {
    const bar = figma.createRectangle();
    bar.resize(32, 2); bar.x = 14; bar.y = ly;
    bar.fills = fill("#FEFEFE");
    ham.appendChild(bar);
  }

  // ── Logo-mark placeholder (top-left) ──
  rect(hero, 20, 20, 40, 40, "#161616", 1, "Logo Mark");

  // ── Rotated label (left edge, vertically centered) ──
  // "Catalin Sandru" + "Product Designer", rotated -90°
  const logoGroup = frame(hero, 0, 0, 200, 60, null, "Logo Label");
  const logoName = txt(logoGroup, "Catalin Sandru", 0, 0, {
    size: 24, weight: "Bold", color: "#161616", decoration: "UNDERLINE"
  });
  txt(logoGroup, "Product Designer", 0, logoName.height + 4, {
    size: 16, weight: "Regular", color: "#161616"
  });
  logoGroup.resize(Math.max(logoName.width, 160), 60);
  logoGroup.rotation = -90;
  // After -90° rotation the origin shifts; position on left edge mid-height
  logoGroup.x = -20;
  logoGroup.y = Math.round(HERO_H / 2) + Math.round(logoGroup.width / 2);

  // ── Right contact block ──
  const RX = FW - Math.round(FW * 0.05); // right anchor x
  const CY = Math.round(HERO_H / 2);

  const emailNode = txt(hero, "hi@catasandru.com", 0, CY - 40, {
    size: 20, weight: "Bold", color: "#161616", name: "Email"
  });
  emailNode.x = RX - emailNode.width;

  const divLine = rect(hero, RX - 190, CY - 40 + emailNode.height + 20, 190, 5, "#161616", 1, "Contact Divider");

  const iconLabels = ["Dribbble", "Instagram", "Behance", "Skype"];
  let ix = RX - (24 * 4 + 24 * 3);
  const iy = divLine.y + 5 + 16;
  for (const lbl of iconLabels) {
    const ic = figma.createRectangle();
    ic.name = lbl; ic.resize(24, 24); ic.x = ix; ic.y = iy;
    ic.fills = fill("#161616"); ic.cornerRadius = 4;
    hero.appendChild(ic);
    ix += 48;
  }

  // ── Hero H1 "PRODUCT DESIGNER" (centered, 74 px) ──
  const h1 = txt(hero, "PRODUCT DESIGNER", 0, Math.round(HERO_H * 0.38), {
    size: 74, weight: "Bold", color: "#161616",
    fixedW: FW, lineH: 180, tracking: 2,
    align: "CENTER", name: "Hero H1"
  });

  // ── Hero description block ──
  const textY = h1.y + h1.height - 16;
  const textW = FW - 200;
  rect(hero, 100, textY, textW, 8, "#333333", 1, "Hero Border");

  txt(hero,
    "I'm Catalin Sandru a Product designer born in Romania, currently living in Bucharest, and working as an in-house designer.\n" +
    "Strengths – website and app design.\n" +
    "Co-founder of Places2Go.co\n" +
    "If you want to know more about me, my work or if you're a Nigerian prince who wants to offer me a lot of money, feel free to contact me on hi[at]catasandru.com",
    100, textY + 16,
    { size: 28, weight: "SemiBold", color: "#161616", fixedW: textW, lineH: 50, name: "Hero Description" }
  );

  Y += HERO_H;

  // ══════════════════════════════════════════════════════════
  // 2. PROJECTS SECTION  (dark #161616 background)
  // ══════════════════════════════════════════════════════════
  const ROW_H = [650, 700, 698];
  const PROJ_TOTAL = 80 + 120 + ROW_H[0] + 40 + ROW_H[1] + 40 + ROW_H[2] + 80;

  const projSec = frame(root, 0, Y, FW, PROJ_TOTAL, "#161616", "Section – Projects");
  projSec.clipsContent = false;

  // "Selected Projects" heading
  const selH = txt(projSec, "Selected Projects", GX, 80, {
    size: 74, weight: "Bold", color: "#ffffff", lineH: 111, name: "Selected Projects"
  });

  let ry = 80 + selH.height + 40;

  // ── Project rows ──────────────────────────────────────────
  const projects = [
    {
      imageLeft: true,
      imageBg: "#DDE7E7",
      contentBg: "#DDE7E7",
      h: ROW_H[0],
      title: "Places2go.co",
      desc: "Personal projects are usually the most complicated ones. This was not the case for Places2Go. Yeah... it actually was. A website for traveling with locals that focuses on making website interactions so easy that even grandmas understand how to use the platform.",
      role: "Co-Founder",
      year: "2017 - Present",
      btnLabel: "VIEW PROJECT",
      dark: false,
    },
    {
      imageLeft: false,
      imageBg: "#161616",
      contentBg: "#161616",
      h: ROW_H[1],
      title: "Mobile Banking App",
      desc: "In-house UI designer, UX and project manager – my roles in this project. This meant a 360 degrees view of a behavior-learning mobile banking app.\nIn addition to regular banking features, savings are automatically sent to a separate account based on the clients' buying behavior and the financial goals set.",
      role: "Product Designer",
      year: "2017",
      btnLabel: "View Project",
      dark: true,
    },
    {
      imageLeft: true,
      imageBg: "#161616",
      contentBg: "#161616",
      h: ROW_H[2],
      title: "Cloudfinity Responsive App",
      desc: "A project that started with an idea. No features, no plans.\nLots of meetings and Skype calls, product goals and wireframes later, the project turned into a 46 pages responsive app.",
      role: "Product Designer",
      year: "2016 - Present",
      btnLabel: "View Project",
      dark: true,
    },
  ];

  for (const p of projects) {
    const leftBg  = p.imageLeft ? p.imageBg    : p.contentBg;
    const rightBg = p.imageLeft ? p.contentBg  : p.imageBg;

    // Left column
    const lCol = frame(projSec, GX, ry, COL, p.h, leftBg,
      p.imageLeft ? `${p.title} – Image` : `${p.title} – Content`);

    // Right column
    const rCol = frame(projSec, GX + COL, ry, COL, p.h, rightBg,
      p.imageLeft ? `${p.title} – Content` : `${p.title} – Image`);

    // Image column: label placeholder
    const imgCol  = p.imageLeft ? lCol : rCol;
    txt(imgCol, "[Image: " + p.title + "]",
      COL / 2 - 80, p.h / 2 - 10,
      { size: 14, weight: "Regular", color: p.dark ? "#555555" : "#888888" });

    // Content column
    const cCol = p.imageLeft ? rCol : lCol;

    const headC = p.dark ? "#fafefe" : "#161616";
    const bodyC = p.dark ? "#999999" : "#5a5a5a";
    const listC = p.dark ? "#cccccc" : "#161616";
    const btnC  = p.dark ? "#ffffff" : "#161616";

    // Content x: 400px wide, right margin 24% of COL (144px)
    // → x = COL - 400 - 144 = 56px inside the content column
    const cX = COL - 400 - Math.round(COL * 0.24); // 56
    let cY = Math.round(p.h * 0.2);

    const tNode = txt(cCol, p.title, cX, cY, {
      size: 50, weight: "Bold", color: headC,
      fixedW: 400, lineH: 75, tracking: 1, name: "Project Title"
    });
    cY += tNode.height + 24;

    const dNode = txt(cCol, p.desc, cX, cY, {
      size: 16, weight: "Light", color: bodyC,
      fixedW: 400, lineH: 24, tracking: 1, name: "Project Description"
    });
    cY += dNode.height + 30;

    // Info row
    const info = frame(cCol, cX, cY, 300, 56, null, "Info");
    txt(info, "My role", 0,   0,  { size: 17, weight: "SemiBold", color: listC });
    txt(info, p.role,    0,   22, { size: 14, weight: "Regular",  color: listC });
    txt(info, "Year",    160, 0,  { size: 17, weight: "SemiBold", color: listC });
    txt(info, p.year,    160, 22, { size: 14, weight: "Regular",  color: listC });
    cY += 56 + 50;

    btn(cCol, p.btnLabel, cX, cY, btnC, btnC);

    ry += p.h + 40;
  }

  Y += PROJ_TOTAL;

  // ══════════════════════════════════════════════════════════
  // 3. ABOUT SECTION  (#F5F9FC)
  // ══════════════════════════════════════════════════════════
  const aboutSec = frame(root, 0, Y, FW, 900, "#F5F9FC", "Section – About");
  aboutSec.clipsContent = false;

  let leftY = 80;
  let rightY = 80;

  // ── Left column: Experience ──
  const expTitle = txt(aboutSec, "Experience", GX, leftY, {
    size: 64, weight: "Bold", color: "#1d1d1d", lineH: 60, name: "Experience Heading"
  });
  leftY += expTitle.height + 32;

  const expRows = [
    ["2016 - Present", "Docler Holding Luxembourg"],
    ["2013 - 2016",    "Commercial Carpatica Bank, Sibiu, Romania"],
    ["2010 - 2013",    "Commercial Carpatica Bank, Sibiu, Romania"],
    ["2006 - 2010",    "Freelancer"],
  ];
  for (const [yr, co] of expRows) {
    leftY += inlineRow(aboutSec, GX, leftY, yr, co);
  }

  // ── Right column: Languages ──
  const langX = GX + COL;

  const langTitle = txt(aboutSec, "Languages", langX, rightY, {
    size: 64, weight: "Bold", color: "#1d1d1d", lineH: 60, name: "Languages Heading"
  });
  rightY += langTitle.height + 32;

  const langRows = [
    ["English",   "Fluent"],
    ["Italian",   "Intermediate"],
    ["Romanian",  "Native"],
  ];
  for (const [lang, lvl] of langRows) {
    rightY += inlineRow(aboutSec, langX, rightY, lang, lvl);
  }
  rightY += 48; // padding-top for skills

  const skillTitle = txt(aboutSec, "Skills", langX, rightY, {
    size: 64, weight: "Bold", color: "#1d1d1d", lineH: 60, name: "Skills Heading"
  });
  rightY += skillTitle.height + 16;

  const skillNode = txt(aboutSec,
    "Photoshop, Sketch, Illustrator, Lightroom.\nInvision and a good understanding of front end development.",
    langX, rightY,
    { size: 16, weight: "Regular", color: "#1d1d1d", fixedW: COL - 40, lineH: 30 }
  );

  // ── Footer strip (full-width, centered) ──
  const fTopY = Math.max(leftY, rightY + skillNode.height) + 80;

  const linkedinBtn = btn(aboutSec, "View LinkedIn", 0, fTopY);
  linkedinBtn.x = Math.round((FW - 164) / 2);

  const fEmailY = fTopY + 52 + 48;
  const fEmail = txt(aboutSec, "hi@catasandru.com", 0, fEmailY, {
    size: 20, weight: "Bold", color: "#161616", align: "CENTER", name: "Footer Email"
  });
  fEmail.x = Math.round((FW - fEmail.width) / 2);

  const fDivY = fEmailY + fEmail.height + 16;
  rect(aboutSec, Math.round((FW - 190) / 2), fDivY, 190, 5, "#161616", 1, "Footer Divider");

  const fSocialY = fDivY + 5 + 16;
  let fIconX = Math.round((FW - (24 * 4 + 24 * 3)) / 2);
  for (const lbl of ["Dribbble", "Instagram", "Behance", "Skype"]) {
    const ic = figma.createRectangle();
    ic.name = lbl; ic.resize(24, 24); ic.x = fIconX; ic.y = fSocialY;
    ic.fills = fill("#161616"); ic.cornerRadius = 4;
    aboutSec.appendChild(ic);
    fIconX += 48;
  }

  const finalAboutH = fSocialY + 24 + 80;
  aboutSec.resize(FW, finalAboutH);
  Y += finalAboutH;

  // ── Final resize of root ──
  root.resize(FW, Y);
  figma.viewport.scrollAndZoomIntoView([root]);

  figma.closePlugin("Portfolio design created!");
}

build().catch((err) => {
  figma.closePlugin("Error: " + err.message);
});
