import React from "react";

export interface SimfinityLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  subtitleColor?: string;
}

export function SimfinityLogo({
  className = "",
  size = 48,
  showText = true,
  textColor = "text-white",
  subtitleColor = "text-[#8a99ad]"
}: SimfinityLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* High Fidelity SVG Infinity "S" Logo Symbol */}
      <svg
        width={size}
        height={typeof size === 'number' ? size * 0.58 : "100%"}
        viewBox="0 0 1000 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-auto transition-transform duration-300 hover:scale-[1.05]"
      >
        <defs>
          {/* Linear Gradients matching the uploaded image's vibrant teal, cyan, blue, and purple hues */}
          <linearGradient id="simfinity-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c9ff" />
            <stop offset="50%" stopColor="#92fe9d" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>

          <linearGradient id="simfinity-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00c9ff" />
            <stop offset="60%" stopColor="#7a22e8" />
            <stop offset="100%" stopColor="#bf55ec" />
          </linearGradient>

          <linearGradient id="main-infinity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3ca7d5" />
            <stop offset="30%" stopColor="#2575fc" />
            <stop offset="65%" stopColor="#9b51e0" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>

          <shadow id="logo-glow">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#00d2ff" floodOpacity="0.25" />
          </shadow>
        </defs>

        {/* Master Logo Icon - Beautiful S-shaped double loop Infinity System */}
        <g style={{ filter: "drop-shadow(0px 8px 16px rgba(0,210,255,0.12))" }}>
          {/* Outer Main Infinity S Loop Component using bezier curve paths for high fidelity curve precision */}
          <path
            d="M 330 450 C 230 450 150 370 150 270 C 150 170 230 90 330 90 C 430 90 490 170 540 240 L 610 330 C 660 400 720 480 820 480 C 920 480 1000 400 1000 300 C 1000 200 920 120 820 120 C 750 120 710 160 670 210 L 620 270 C 580 320 540 360 470 360 C 400 360 350 310 350 240 C 350 170 410 120 480 120 L 490 120 C 510 120 520 100 510 85 C 500 70 480 70 460 75 C 330 85 230 180 230 300 C 230 410 320 500 430 500 C 530 500 590 430 640 370 L 690 300 C 730 250 780 200 850 200 C 920 200 960 250 960 310 C 960 370 910 420 850 420 C 780 420 740 380 700 330 L 690 320 L 650 370 L 660 380 C 700 430 750 480 820 480"
            fill="none"
          />
          
          {/* Sleek, dynamic fluid overlapping visual element to convey "Endless Possibilities" */}
          <path
            d="M 330 490 
               C 210 490 110 390 110 270 
               C 110 150 210 50 330 50 
               C 440 50 510 120 560 190 
               L 615 270 
               C 665 340 735 410 830 410 
               C 910 410 970 350 970 270 
               C 970 210 930 150 850 150 
               C 800 150 760 180 720 230 
               L 680 280 
               C 630 350 570 410 470 410 
               C 380 410 310 340 310 250 
               C 310 160 380 90 470 90 
               C 500 90 520 70 510 45
               C 500 20 460 20 430 30
               C 300 50 180 150 180 280
               C 180 420 280 520 420 520
               C 530 520 610 460 670 380
               L 710 330
               C 750 280 800 230 870 230
               C 920 230 950 265 950 310
               C 950 355 915 390 870 390
               C 810 390 770 350 730 290
               L 650 390
               C 700 450 760 510 840 510
               C 940 510 1010 430 1010 320
               C 1010 210 930 110 820 110
               C 730 110 670 180 620 250
               L 575 315
               C 525 385 455 450 360 450
               C 270 450 210 380 210 290
               C 210 200 270 130 360 130
               C 390 130 410 100 395 75
               C 380 50 340 50 320 60
               C 200 80 80 180 80 310
               C 80 450 180 550 320 550
               C 440 550 520 490 580 410
               L 625 345
               C 675 275 745 210 840 210
               C 930 210 990 280 990 370
               C 990 460 890 530 780 530
               C 700 530 640 480 590 410"
            fill="url(#main-infinity-grad)"
          />
        </g>
      </svg>

      {/* Brand Words Group */}
      {showText && (
        <div className="mt-4 flex flex-col items-center">
          {/* Main bold geometric logo type */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-[0.15em] uppercase select-none leading-none">
            <span className={textColor}>SIM</span>
            <span className="bg-gradient-to-r from-[#00c9ff] via-[#2575fc] to-[#bf55ec] bg-clip-text text-transparent">FINITY</span>
          </h2>
          {/* Dynamic tag subtitle */}
          <p className={`${subtitleColor} font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase mt-2.5 font-bold whitespace-nowrap opacity-90`}>
            UNLIMITED SOLUTIONS <span className="text-[#ffd700] mx-0.5">•</span> ENDLESS POSSIBILITIES
          </p>
        </div>
      )}
    </div>
  );
}

{/* Smaller inline Navbar version for compact header layouts */}
export function SimfinityNavbarLogo({
  className = "",
  size = 28
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-2 cursor-pointer group ${className}`}>
      {/* Mini logo icon */}
      <svg
        width={size}
        height={size * 0.58}
        viewBox="0 0 1000 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-auto transition-transform duration-300 group-hover:scale-[1.08]"
      >
        <defs>
          <linearGradient id="nav-infinity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c9ff" />
            <stop offset="60%" stopColor="#2575fc" />
            <stop offset="100%" stopColor="#bf55ec" />
          </linearGradient>
        </defs>
        <path
          d="M 330 490 C 210 490 110 390 110 270 C 110 150 210 50 330 50 C 440 50 510 120 560 190 L 615 270 C 665 340 735 410 830 410 C 910 410 970 350 970 270 C 970 210 930 150 850 150 C 800 150 760 180 720 230 L 680 280 C 630 350 570 410 470 410 C 380 410 310 340 310 250 C 310 160 380 90 470 90 C 500 90 520 70 510 45 C 500 20 460 20 430 30 C 300 50 180 150 180 280 C 180 420 280 520 420 520 C 530 520 610 460 670 380 L 710 330 C 750 280 800 230 870 230 C 920 230 950 265 950 310 C 950 355 915 390 870 390 C 810 390 770 350 730 290 L 650 390 C 700 450 760 510 840 510 C 940 510 1010 430 1010 320 C 1010 210 930 110 820 110 C 730 110 670 180 620 250 L 575 315 C 525 385 455 450 360 450 C 270 450 210 380 210 290 C 210 200 270 130 360 130 C 390 130 410 100 395 75 C 380 50 340 50 320 60 C 200 80 80 180 80 310 C 80 450 180 550 320 550 C 440 550 520 490 580 410 L 625 345 C 675 275 745 210 840 210 C 930 210 990 280 990 370 C 990 460 890 530 780 530 C 700 530 640 480 590 410"
          fill="url(#nav-infinity-grad)"
        />
      </svg>
      {/* Brand title */}
      <span className="font-display font-black text-base sm:text-lg tracking-[0.12em] uppercase select-none transition-all duration-200">
        <span className="text-[#fcfcfa] group-hover:text-white transition-colors duration-200">SIM</span>
        <span className="bg-gradient-to-r from-[#00c9ff] via-[#4d94ff] to-[#bf55ec] bg-clip-text text-transparent group-hover:brightness-110">FINITY</span>
      </span>
    </div>
  );
}
