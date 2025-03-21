// Frame templates with embedded SVG content
export const TEMPLATE_FRAMES = [
    {
      id: "basic",
      name: "Basic",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="380" height="280" fill="none" stroke="#000000" stroke-width="10" rx="5" ry="5" />
      </svg>`),
      description: "Simple border frame",
    },
    {
      id: "polaroid",
      name: "Polaroid",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="photo-mask">
            <rect width="400" height="300" fill="white"/>
            <rect x="20" y="20" width="360" height="220" fill="black"/>
          </mask>
        </defs>
        <rect width="400" height="300" fill="white" rx="5" ry="5"/>
        <rect x="20" y="20" width="360" height="220" fill="none" stroke="#333333" stroke-width="1"/>
        <rect width="400" height="300" fill="white" mask="url(#photo-mask)" opacity="0.1"/>
        <rect width="400" height="300" fill="none" stroke="#333333" stroke-width="1" rx="5" ry="5"/>
        <text x="200" y="275" font-family="Arial" font-size="16" text-anchor="middle" fill="#333333" letter-spacing="2">POLAROID</text>
      </svg>`),
      description: "Classic polaroid style",
    },
    {
      id: "vintage",
      name: "Vintage",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="10" y="10" width="380" height="280" fill="none" stroke="#8B4513" stroke-width="8" rx="3" ry="3" />
        <rect x="30" y="30" width="340" height="240" fill="none" stroke="#8B4513" stroke-width="2" rx="3" ry="3" />
        <path d="M 0,0 L 40,40" stroke="#8B4513" stroke-width="3" />
        <path d="M 400,0 L 360,40" stroke="#8B4513" stroke-width="3" />
        <path d="M 0,300 L 40,260" stroke="#8B4513" stroke-width="3" />
        <path d="M 400,300 L 360,260" stroke="#8B4513" stroke-width="3" />
      </svg>`),
      description: "Retro film look",
    },
    {
      id: "birthday",
      name: "Birthday",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="20" y="20" width="360" height="260" fill="none" stroke="#FF69B4" stroke-width="5" rx="10" ry="10" stroke-dasharray="10,5" />
        <circle cx="20" cy="20" r="15" fill="#FFD700" />
        <circle cx="380" cy="20" r="15" fill="#FFD700" />
        <circle cx="20" cy="280" r="15" fill="#FFD700" />
        <circle cx="380" cy="280" r="15" fill="#FFD700" />
        <text x="200" y="290" font-family="Arial" font-size="14" text-anchor="middle" fill="#FF69B4">Happy Birthday!</text>
      </svg>`),
      description: "Celebration theme",
    },
    {
      id: "holiday",
      name: "Holiday",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="300" fill="none" />
        <rect x="15" y="15" width="370" height="270" fill="none" stroke="#006400" stroke-width="10" rx="5" ry="5" />
        <circle cx="30" cy="30" r="12" fill="#FF0000" />
        <circle cx="370" cy="30" r="12" fill="#FF0000" />
        <circle cx="30" cy="270" r="12" fill="#FF0000" />
        <circle cx="370" cy="270" r="12" fill="#FF0000" />
        <circle cx="200" cy="30" r="12" fill="#FF0000" />
        <circle cx="200" cy="270" r="12" fill="#FF0000" />
        <circle cx="30" cy="150" r="12" fill="#FF0000" />
        <circle cx="370" cy="150" r="12" fill="#FF0000" />
      </svg>`),
      description: "Festive decoration",
    },
  ]
  
  