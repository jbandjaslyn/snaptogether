// Frame templates with embedded SVG content
export const TEMPLATE_FRAMES = [
    {
      id: "basic",
      name: "Basic",
      url: "/frames/basic-frame.png",
      description: "Simple border frame",
      svgContent: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="380" height="280" fill="none" stroke="#000000" strokeWidth="10" rx="5" ry="5" />
      </svg>`,
    },
    {
      id: "polaroid",
      name: "Polaroid",
      url: "/frames/polaroid-frame.png",
      description: "Classic polaroid style",
      svgContent: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="#ffffff" />
        <rect x="20" y="20" width="360" height="220" fill="none" stroke="#000000" strokeWidth="1" />
        <rect x="0" y="260" width="400" height="40" fill="#ffffff" />
        <text x="200" y="285" fontFamily="Arial" fontSize="16" textAnchor="middle" fill="#000000">POLAROID</text>
      </svg>`,
    },
    {
      id: "vintage",
      name: "Vintage",
      url: "/frames/vintage-frame.png",
      description: "Retro film look",
      svgContent: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="10" y="10" width="380" height="280" fill="none" stroke="#8B4513" strokeWidth="8" rx="3" ry="3" />
        <rect x="30" y="30" width="340" height="240" fill="none" stroke="#8B4513" strokeWidth="2" rx="3" ry="3" />
        <path d="M 0,0 L 40,40" stroke="#8B4513" strokeWidth="3" />
        <path d="M 400,0 L 360,40" stroke="#8B4513" strokeWidth="3" />
        <path d="M 0,300 L 40,260" stroke="#8B4513" strokeWidth="3" />
        <path d="M 400,300 L 360,260" stroke="#8B4513" strokeWidth="3" />
      </svg>`,
    },
    {
      id: "birthday",
      name: "Birthday",
      url: "/frames/birthday-frame.png",
      description: "Celebration theme",
      svgContent: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="20" y="20" width="360" height="260" fill="none" stroke="#FF69B4" strokeWidth="5" rx="10" ry="10" strokeDasharray="10,5" />
        <circle cx="20" cy="20" r="15" fill="#FFD700" />
        <circle cx="380" cy="20" r="15" fill="#FFD700" />
        <circle cx="20" cy="280" r="15" fill="#FFD700" />
        <circle cx="380" cy="280" r="15" fill="#FFD700" />
        <text x="200" y="290" fontFamily="Arial" fontSize="14" textAnchor="middle" fill="#FF69B4">Happy Birthday!</text>
      </svg>`,
    },
    {
      id: "holiday",
      name: "Holiday",
      url: "/frames/holiday-frame.png",
      description: "Festive decoration",
      svgContent: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="15" y="15" width="370" height="270" fill="none" stroke="#006400" strokeWidth="10" rx="5" ry="5" />
        <circle cx="30" cy="30" r="12" fill="#FF0000" />
        <circle cx="370" cy="30" r="12" fill="#FF0000" />
        <circle cx="30" cy="270" r="12" fill="#FF0000" />
        <circle cx="370" cy="270" r="12" fill="#FF0000" />
        <circle cx="200" cy="30" r="12" fill="#FF0000" />
        <circle cx="200" cy="270" r="12" fill="#FF0000" />
        <circle cx="30" cy="150" r="12" fill="#FF0000" />
        <circle cx="370" cy="150" r="12" fill="#FF0000" />
      </svg>`,
    },
  ]
  
  