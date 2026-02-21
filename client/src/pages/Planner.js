import { useState } from "react";
import axios from "axios";

function Planner() {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    goal: "",
    profession: ""
  });

  const [plan, setPlan] = useState("");

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const generatePlan = async () => {
    const res = await axios.post("http://localhost:5000/generate-plan", form);
    setPlan(res.data.plan);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-4xl font-bold mb-10 text-green-400">AI Fitness Planner</h1>

      <div className="bg-zinc-900 p-8 rounded-2xl w-96 flex flex-col gap-4">
        <input name="age" placeholder="Age" onChange={handleChange} className="p-3 bg-black border border-gray-700 rounded"/>
        <input name="weight" placeholder="Weight" onChange={handleChange} className="p-3 bg-black border border-gray-700 rounded"/>
        <input name="goal" placeholder="Goal (fat loss/muscle)" onChange={handleChange} className="p-3 bg-black border border-gray-700 rounded"/>
        <input name="profession" placeholder="Profession (student/coder)" onChange={handleChange} className="p-3 bg-black border border-gray-700 rounded"/>

        <button onClick={generatePlan} className="bg-green-500 py-3 rounded-xl text-black font-bold">
          Generate Plan
        </button>
      </div>

      {plan && (
        <div className="mt-10 bg-zinc-900 p-8 rounded-2xl w-2/3">
          <h2 className="text-2xl text-green-400 mb-4">Your Plan</h2>
          <pre className="whitespace-pre-wrap">{plan}</pre>
        </div>
      )}
    </div>
  );
}

export default Planner;