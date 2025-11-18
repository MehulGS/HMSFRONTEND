import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import api from "../../api/api";

const BMICalculatorForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiPreview, setBmiPreview] = useState("");
  const [statusPreview, setStatusPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [dietPlan, setDietPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Form starts empty for new BMI creation.
  }, []);

  const getDietSuggestion = (bmi, manualFallback = false) => {
    const bmiValue = parseFloat(bmi);
    if (!isFinite(bmiValue)) {
      return "Maintain a balanced diet with adequate fruits, vegetables, and water.";
    }

    if (!manualFallback) {
      // Default short focus text for preview when AI response is not yet available.
      if (bmiValue < 18.5) {
        return "Increase calories with protein-rich foods, healthy fats, and frequent small meals.";
      }

      if (bmiValue >= 18.5 && bmiValue < 25) {
        return "Balanced meals with whole grains, lean protein, fruits, and regular exercise.";
      }

      if (bmiValue >= 25 && bmiValue < 30) {
        return "Cut down on refined carbs and sugar, add salads and lean protein, and stay active.";
      }

      return "Follow a calorie-controlled, high-fiber diet and avoid fried and processed foods.";
    }

    // Manual, longer fallback in case backend AI is unavailable.
    if (bmiValue < 18.5) {
      return "Your BMI indicates you are underweight. Increase calorie intake with protein-rich foods, healthy fats (nuts, seeds, ghee in moderation), dairy, and frequent small meals. Avoid skipping meals.";
    }
    if (bmiValue >= 18.5 && bmiValue < 25) {
      return "Your BMI is in the healthy range. Continue a balanced diet with whole grains, seasonal fruits, vegetables, lentils, and regular physical activity for 30–45 minutes most days of the week.";
    }
    if (bmiValue >= 25 && bmiValue < 30) {
      return "Your BMI suggests you are overweight. Reduce refined carbohydrates, sugary drinks, and fried foods. Increase salads, fiber-rich vegetables, and lean protein. Aim for at least 30 minutes of brisk walking daily.";
    }
    return "Your BMI falls in the obese range. Follow a calorie-controlled diet, avoid fried and processed foods, choose steamed/roasted options, and include high-fiber foods. Regular exercise and medical follow-up are strongly recommended.";
  };

  useEffect(() => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);

    if (!heightValue || !weightValue || heightValue <= 0) {
      setBmiPreview("");
      setStatusPreview("");
      return;
    }

    const heightInMeters = heightValue / 100;
    const bmiValue = weightValue / (heightInMeters * heightInMeters);
    const rounded = bmiValue.toFixed(1);
    setBmiPreview(rounded);
    setStatusPreview(bmiValue >= 25 ? "Overweight" : "Normal");
  }, [height, weight]);

  const handleGenerateDietPlan = async () => {
    if (!bmiPreview) return;

    const apiKey = "AIzaSyCOiuJEg3x6RbfEOGNAriIc6EB0EoicyU0";
    if (!apiKey) {
      setDietPlan(getDietSuggestion(bmiPreview, true));
      return;
    }

    try {
      setAiLoading(true);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      

      const prompt = `You are a nutrition expert. Based on the following patient data, generate a concise but practical Indian-style diet plan with meals for breakfast, lunch, snacks and dinner.

Patient details:
- Age: ${age || "N/A"}
- BMI: ${bmiPreview}
- Weight: ${weight || "N/A"} kg
- Height: ${height || "N/A"} cm
- Blood group: ${bloodGroup || "N/A"}

Focus on clear bullet points and simple food items commonly available in India. Also include brief lifestyle tips (water intake, exercise). Use short sentences.
`;

      const result = await model.generateContent(prompt);
      const response = result?.response?.text?.() || "";

      if (response) {
        setDietPlan(response);
      } else {
        setDietPlan(getDietSuggestion(bmiPreview, true));
      }
    } catch (error) {
      console.error("Failed to generate diet plan from Gemini", error);
      setDietPlan(getDietSuggestion(bmiPreview, true));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber || !age || !height || !weight || saving) return;

    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);
    if (isNaN(heightValue) || isNaN(weightValue) || heightValue <= 0) return;

    const heightInMeters = heightValue / 100;
    const bmiValue = weightValue / (heightInMeters * heightInMeters);
    const status = bmiValue >= 25 ? "Overweight" : "Normal";

    const payload = {
      name,
      phoneNumber,
      age: Number(age),
      height: Number(heightValue.toFixed(1)),
      weight: Number(weightValue.toFixed(1)),
      bmi: Number(bmiValue.toFixed(1)),
      bloodGroup: bloodGroup || undefined,
      dietPlanResponse: dietPlan || getDietSuggestion(bmiValue.toFixed(1), true),
      // createdBy / updatedBy will be derived from auth token on backend.
    };

    try {
      setSaving(true);
      const response = await api.post("/bmi-records/create-record", payload);
      const createdRecord = response?.data?.data || response?.data;

      if (createdRecord) {
        navigate("/doctor/bmi-diet-plan", { state: { record: createdRecord, dietPlan } });
      } else {
        navigate("/doctor/bmi-calculator");
      }
    } catch (error) {
      // Optional: show a toast / message here; for now we just stay on the form.
      console.error("Failed to create BMI record", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Calculate BMI
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter patient details, height and weight to calculate BMI and get diet guidance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/doctor/bmi-calculator")}
          className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          Back to list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        <form
          id="bmi-form"
          onSubmit={handleSubmit}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-100 p-4 sm:p-5"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Age (years)
            </label>
            <input
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="Enter age"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <input
              type="text"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="e.g. O+ / B-"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="Enter height in cm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
              placeholder="Enter weight in kg"
            />
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleGenerateDietPlan}
              disabled={aiLoading || !bmiPreview}
              className="inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aiLoading ? "Generating diet..." : "Generate Diet Plan (AI)"}
            </button>
            <button
              type="submit"
              disabled={saving || !dietPlan}
              className="inline-flex justify-center items-center px-4 py-2 bg-customBlue text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-customBlue w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save & View BMI"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-800">BMI & Diet Preview</h2>
          {bmiPreview ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Calculated BMI</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {bmiPreview}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      statusPreview === "Overweight"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {statusPreview}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  AI-generated diet plan
                </p>
                {dietPlan ? (
                  <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 whitespace-pre-wrap leading-snug">
                    {dietPlan}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 leading-snug">
                    Click "Generate Diet Plan (AI)" to get a personalized diet plan based on this BMI.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Enter height and weight to see BMI and tailored diet suggestions here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculatorForm;
