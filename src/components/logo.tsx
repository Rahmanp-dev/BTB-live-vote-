export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-auto">
        <svg
          viewBox="0 0 200 150"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          {/* Brackets */}
          <polyline
            points="25,40 25,80 65,80"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
          />
          <polyline
            points="175,40 175,80 135,80"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
          />
          {/* GWD Text */}
          <text
            x="50%"
            y="75"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="48"
            fontWeight="bold"
            fill="currentColor"
            fontFamily="sans-serif"
          >
            GWD
          </text>
          {/* GET WORK DONE Text */}
          <text
            x="50%"
            y="115"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="currentColor"
            fontFamily="sans-serif"
            letterSpacing="2"
          >
            GET WORK DONE
          </text>
        </svg>
      </div>
    </div>
  );
}
