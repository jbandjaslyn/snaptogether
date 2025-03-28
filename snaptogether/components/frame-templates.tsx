// Frame templates with embedded SVG content
export const TEMPLATE_FRAMES = [
    {
      id: "basic",
      name: "Basic",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="1200" height="3600" xmlns="http://www.w3.org/2000/svg">
        <!-- Photo areas with borders -->
        <rect x="100" y="80" width="1000" height="700" fill="none" stroke="#000000" stroke-width="4"/>
        <rect x="100" y="840" width="1000" height="700" fill="none" stroke="#000000" stroke-width="4"/>
        <rect x="100" y="1600" width="1000" height="700" fill="none" stroke="#000000" stroke-width="4"/>
        <rect x="100" y="2360" width="1000" height="700" fill="none" stroke="#000000" stroke-width="4"/>
        <!-- Branding area -->
        <rect x="100" y="3120" width="1000" height="400" fill="none" stroke="#000000" stroke-width="4"/>
      </svg>`),
      description: "Simple border frame",
      photoArea: {
        width: 1000,
        height: 700,
        x: 100,
        y: 80,
        spacing: 760  // Distance to next frame: 840 - 80
      }
    },
    {
      id: "polaroid",
      name: "Polaroid",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="1200" height="3600" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect x="0" y="0" width="1200" height="3600" fill="#ffffff"/>
        <!-- Polaroid frames -->
        <rect x="100" y="80" width="1000" height="700" fill="#ffffff" stroke="#333333" stroke-width="2"/>
        <rect x="100" y="840" width="1000" height="700" fill="#ffffff" stroke="#333333" stroke-width="2"/>
        <rect x="100" y="1600" width="1000" height="700" fill="#ffffff" stroke="#333333" stroke-width="2"/>
        <rect x="100" y="2360" width="1000" height="700" fill="#ffffff" stroke="#333333" stroke-width="2"/>
        <!-- Photo areas -->
        <rect x="125" y="105" width="950" height="600" fill="none" stroke="#333333" stroke-width="1"/>
        <rect x="125" y="865" width="950" height="600" fill="none" stroke="#333333" stroke-width="1"/>
        <rect x="125" y="1625" width="950" height="600" fill="none" stroke="#333333" stroke-width="1"/>
        <rect x="125" y="2385" width="950" height="600" fill="none" stroke="#333333" stroke-width="1"/>
        <!-- Branding area -->
        <rect x="100" y="3120" width="1000" height="400" fill="#ffffff" stroke="#333333" stroke-width="2"/>
      </svg>`),
      description: "Classic polaroid style",
      photoArea: {
        width: 950,
        height: 600,
        x: 125,
        y: 105,
        spacing: 760  // Distance to next frame: 865 - 105
      }
    },
    {
      id: "vintage",
      name: "Vintage",
      url: "data:image/svg+xml;base64," + btoa(`<svg width="1200" height="3600" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect x="0" y="0" width="1200" height="3600" fill="#f4e4bc"/>
        <!-- Photo areas -->
        <g transform="translate(100, 80)">
          <rect width="1000" height="700" fill="none" stroke="#8B4513" stroke-width="3"/>
          <rect x="40" y="40" width="920" height="620" fill="none" stroke="#8B4513" stroke-width="3"/>
          <path d="M 0,0 L 40,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,0 L 960,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 0,700 L 40,660" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,700 L 960,660" stroke="#8B4513" stroke-width="2"/>
        </g>
        <g transform="translate(100, 840)">
          <rect width="1000" height="700" fill="none" stroke="#8B4513" stroke-width="3"/>
          <rect x="40" y="40" width="920" height="620" fill="none" stroke="#8B4513" stroke-width="3"/>
          <path d="M 0,0 L 40,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,0 L 960,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 0,700 L 40,660" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,700 L 960,660" stroke="#8B4513" stroke-width="2"/>
        </g>
        <g transform="translate(100, 1600)">
          <rect width="1000" height="700" fill="none" stroke="#8B4513" stroke-width="3"/>
          <rect x="40" y="40" width="920" height="620" fill="none" stroke="#8B4513" stroke-width="3"/>
          <path d="M 0,0 L 40,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,0 L 960,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 0,700 L 40,660" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,700 L 960,660" stroke="#8B4513" stroke-width="2"/>
        </g>
        <g transform="translate(100, 2360)">
          <rect width="1000" height="700" fill="none" stroke="#8B4513" stroke-width="3"/>
          <rect x="40" y="40" width="920" height="620" fill="none" stroke="#8B4513" stroke-width="3"/>
          <path d="M 0,0 L 40,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,0 L 960,40" stroke="#8B4513" stroke-width="2"/>
          <path d="M 0,700 L 40,660" stroke="#8B4513" stroke-width="2"/>
          <path d="M 1000,700 L 960,660" stroke="#8B4513" stroke-width="2"/>
        </g>
        <!-- Branding area -->
        <rect x="100" y="3120" width="1000" height="400" fill="#f4e4bc" stroke="#8B4513" stroke-width="3"/>
      </svg>`),
      description: "Retro film look",
      photoArea: {
        width: 920,
        height: 620,
        x: 140,
        y: 120,
        spacing: 760  // Distance to next frame: 840 - 80
      }
    }
]
  
  