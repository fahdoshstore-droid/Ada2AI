import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import FifaCard, { type FifaCardPlayer } from "@/components/FifaCard";

const SportID = () => {
  const [stats, setStats] = useState([
    { name: "Speed", value: 75 },
    { name: "Shooting", value: 85 },
    { name: "Passing", value: 90 },
    { name: "Defense", value: 70 },
    { name: "Stamina", value: 80 },
    { name: "Physical", value: 65 }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStats, setFilteredStats] = useState(stats);

  useEffect(() => {
    const filtered = stats.filter(stat =>
      stat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStats(filtered);
  }, [searchTerm]);

  return (
    <div style={{ backgroundColor: "#020408", direction: "rtl", textAlign: "right" }}>
      <Ada2aiNavbar />
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          padding: "20px",
          display: "flex",
          flex-direction: "column",
          alignItems: "center"
        }}
      >
        <FifaCard
          style={{ backgroundColor: "#0a0a0f", width: "300px", height: "400px" }}
        >
          <div
            style={{
              width: "100%",
              height: "150px",
              borderRadius: "50%",
              borderWidth: "2px",
              borderColor: "#D4AF37",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {/* Inline SVG used to replace the placeholder image */}
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <circle cx="75" cy="75" r="60" stroke="#D4AF37" fill="transparent" />
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="30">
                🏆
              </text>
            </svg>
          </div>
          <h1 style={{ color: "#fff", fontSize: "24px" }}>John Doe</h1>
          <p style={{ color: "#94a3b8", fontSize: "18px" }}>Forward</p>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>Al Ahly Club</p>
        </FifaCard>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px"
          }}
        >
          {filteredStats.map(stat => (
            <div key={stat.name} style={{ color: "#fff", fontSize: "16px" }}>
              {stat.name}: {stat.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportID;