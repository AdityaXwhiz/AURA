import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Zap, Skull, ChevronRight, 
  Activity, Flame, Crosshair, 
  User, Award, Star, Cpu, Brain,
  Trophy, Target, BarChart3
} from "lucide-react";

const ProtocolCard = ({ title, subTitle, icon: Icon, description, aiInsight, outcomes, stats, color, route, isRecommended }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative bg-zinc-950 border ${isRecommended ? 'border-red-600 shadow-[0_0_40px_-15px_rgba(220,38,38,0.5)]' : 'border-zinc-900'} p-5 md:p-8 overflow-hidden group cursor-pointer transition-all duration-500`}
      onClick={() => navigate(route)}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-red-600 text-black text-[10px] font-black px-6 py-1.5 uppercase tracking-tighter z-10 flex items-center gap-2">
          <Target size={12} /> Optimal_Pathway
        </div>
      )}
      
      <div className={`absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 ${color}`}>
        <Icon size={260} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-8">
          <div className={`p-4 bg-zinc-900 border ${isRecommended ? 'border-red-600' : 'border-zinc-800'} rounded-sm`}>
            <Icon className={isRecommended ? 'text-red-600 animate-pulse' : 'text-zinc-500'} size={28} />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-none tracking-tighter">{title}</h3>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.3em] mt-2 font-mono">{subTitle}</p>
          </div>
        </div>

        {/* AI GENERIC INTELLIGENCE BOX */}
        <div className="mb-8 p-4 bg-zinc-900/50 border-l-2 border-red-600 rounded-r-md">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-red-600" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Neural_Analysis</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed italic font-serif">
            "{aiInsight}"
          </p>
        </div>

        <p className="text-zinc-500 text-[12px] mb-8 leading-relaxed font-sans">
          {description}
        </p>

        {/* PREDICTIVE DATA GRID */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 opacity-50">
             <BarChart3 size={12} />
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Simulated_Outcomes</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {outcomes.map((out, i) => (
              <div key={i} className="bg-black/40 p-3 border border-zinc-900 rounded-sm">
                <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">{out.label}</p>
                <p className="text-[12px] text-white font-mono font-bold">{out.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
          <div className="flex items-center gap-2 text-red-600 group-hover:gap-4 transition-all duration-300">
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deploy Protocol</span>
            <ChevronRight size={16} />
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
             <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
             <span className="text-[9px] font-mono text-zinc-400 uppercase">Req: LVL_{stats.minLevel}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PlanSelection = () => {
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
  
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_BASE}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const user = data.user || data;

        setUserData({
          name: user.name || "Unknown",
          age: user.onboarding?.age ?? "--",
          weight: user.onboarding?.weight ?? "--",
          goal: user.onboarding?.goal ?? "Not Set",
          train_access: user.onboarding?.train_access ?? "Not Set",
          experience: user.onboarding?.experience ?? "Not Set",
          xp: user.points ?? user.xp ?? 0,
        });

      } catch (err) {
        console.error("Failed to load user:", err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">
        Loading Mission Profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <p className="text-red-600 text-2xl font-black">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-600 text-black font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // REAL XP FROM BACKEND
  const userXP = userData.xp ?? 0;
  const nextLevelXP = 1000; // you can later make this dynamic
  const progressPercent = Math.min(100, Math.max(0, (userXP / nextLevelXP) * 100));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 relative overflow-hidden font-sans">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444405_1px,transparent_1px),linear-gradient(to_bottom,#ef444405_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-24 relative z-10">
        
        {/* PERSISTENT DOSSIER HEADER & XP SYSTEM */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20 border-b border-zinc-900 pb-12">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 bg-red-600 flex items-center justify-center rounded-sm rotate-45 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                   <User size={32} className="text-black -rotate-45" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black border border-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-red-600">
                  RECRUIT
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">{userData.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < 1 ? "fill-red-600 text-red-600" : "text-zinc-800"} />
                    ))}
                  </div>
                  <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest border-l border-zinc-800 pl-3">AURA_NODE_#4921</span>
                </div>
              </div>
            </div>

            {/* BIO-METRIC DATA BAR */}
            <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
               <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-sm flex-1 md:flex-none">
                 <span className="text-zinc-700 block text-[9px] mb-1">Current_Mass</span>
                 <span className="text-white text-lg font-black italic">{userData.weight !== "--" ? `${userData.weight} KG` : "--"}</span>
               </div>
               <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-sm flex-1 md:flex-none">
                 <span className="text-zinc-700 block text-[9px] mb-1">System_Goal</span>
                 <span className="text-red-600 text-lg font-black italic">{userData.goal}</span>
               </div>
               <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-sm flex-1 md:flex-none">
                 <span className="text-zinc-700 block text-[9px] mb-1">Experience_Index</span>
                 <span className="text-white text-lg font-black italic">{userData.experience}</span>
               </div>
               <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-sm flex-1 md:flex-none">
                 <span className="text-zinc-700 block text-[9px] mb-1">Equipment_Link</span>
                 <span className="text-white text-lg font-black italic">{userData.train_access}</span>
               </div>
            </div>
          </div>

          {/* XP & PROGRESS HUD */}
          <div className="w-full lg:w-80 space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <Trophy size={14} /> Level 01
                </span>
                <span className="text-[9px] text-zinc-500 font-mono mt-1 italic">Initiate Rank</span>
              </div>
              <div className="text-right">
                <span className="text-white text-xs font-mono font-bold">{userXP} / {nextLevelXP} XP</span>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercent}%` }} 
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-red-900 to-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
              />
            </div>
            <p className="text-[9px] text-zinc-600 text-right uppercase tracking-widest font-bold">Earn 550 XP to unlock "The Elite" protocol</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProtocolCard 
            title="30-Day Shred"
            subTitle="Operational: Velocity"
            icon={Flame}
            color="text-orange-600"
            aiInsight={`Subject's mass of ${userData.weight !== "--" ? userData.weight + "kg" : "unknown"} requires an aggressive caloric oxidation. This protocol leverages high-frequency HIIT to bypass current metabolic plateaus.`}
            description="A maximum-intensity 4-week cycle designed for rapid adipose tissue loss through strict deficit management and metabolic conditioning."
            outcomes={[
              { label: "Target Loss", value: "4.5 - 6 KG" },
              { label: "Body Fat %", value: "Down 3.2%" }
            ]}
            stats={{ minLevel: "01" }}
            route="/protocol/shred"
          />

          <ProtocolCard 
            title="90-Day Aesthetic"
            subTitle="Operational: Balance"
            icon={Crosshair}
            color="text-red-600"
            isRecommended={true}
            aiInsight={`Recommended for ${userData.age !== "--" ? userData.age + "yo" : "user"} profile. Calculated to synchronize muscle hypertrophy with ${userData.goal} parameters using a high-protein PPL framework.`}
            description="The flagship AURA transformation. A steady 12-week roadmap focused on achieving the 'Golden Ratio' through progressive hypertrophy and lean muscle retention."
            outcomes={[
              { label: "Lean Muscle", value: "+2.8 KG" },
              { label: "Physique Rating", value: "+40% Boost" }
            ]}
            stats={{ minLevel: "01" }}
            route="/protocol/aesthetic"
          />

          <ProtocolCard 
            title="180-Day Elite"
            subTitle="Operational: Architecture"
            icon={Shield}
            color="text-blue-600"
            aiInsight={`Utilizing ${userData.train_access} constraints, AURA has designed a permanent strength-base rebuild to lock in metabolic health for the long-term.`}
            description="The ultimate long-term blueprint. Focuses on heavy compound progression and permanent body recomposition for warriors committed to elite-tier genetics."
            outcomes={[
              { label: "Max Strength", value: "+45% Lift" },
              { label: "Metabolic Age", value: "-4 Years" }
            ]}
            stats={{ minLevel: "05" }} // Locked based on XP level
            route="/protocol/elite"
          />
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;