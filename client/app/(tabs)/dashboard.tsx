import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import images from "../../constants/images";
import { API_BASE_URL } from "@/lib/apiConfig";
import { useAuthStore } from "@/store/authStore";

const Dashboard = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const firstName = useAuthStore((state) => state.firstName);
  const [aiTip, setAiTip] = useState<string>("Loading tip...");
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fake (hardcoded) tips — no backend/AI call required for the dashboard.
  const fakeTips = [
    "Regular monitoring helps you spot disease early before it spreads across the crop.",
    "Keep leaves dry when possible and improve airflow around the plants to reduce fungal growth.",
    "Water at the base of the plant (not on the leaves) and avoid watering late in the day.",
    "Inspect the underside of leaves weekly; small spots early are easier to manage than late outbreaks.",
    "Use clean tools and avoid moving from diseased plants to healthy ones without washing hands.",
    "Balance nutrients carefully—over-fertilization can make plants more vulnerable to infections.",
  ];

  const getDailyFakeTip = () => {
    const now = new Date();
    const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    return fakeTips[dayIndex % fakeTips.length];
  };

  const getRandomFakeTip = () => {
    if (fakeTips.length === 0) return "Take care of your crops daily.";
    const idx = Math.floor(Math.random() * fakeTips.length);
    return fakeTips[idx];
  };

  const fetchAiTip = async (mode: "daily" | "random" = "daily") => {
    setIsLoadingTip(true);
    try {
      // Simulate a quick loading state for UX consistency.
      const tip = mode === "daily" ? getDailyFakeTip() : getRandomFakeTip();
      setAiTip(tip);
    } finally {
      setIsLoadingTip(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const historyUrl = userId
        ? `${API_BASE_URL}/history?userId=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/history`;
      const response = await fetch(historyUrl);
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.statistics);
        // Get the 3 most recent scans
        setRecentScans(data.predictions.slice(0, 3));
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const refreshDashboard = () => {
    fetchAiTip("random");
    fetchDashboardData();
  };

  useEffect(() => {
    fetchAiTip("daily");
    fetchDashboardData();
  }, [userId]);

  const now = new Date();
  const dateText = `${now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })}, ${now.toLocaleDateString("en-US", { weekday: "long" })}`;

  const hour = now.getHours();
  const timeOfDay =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : hour < 21
      ? "Good Evening"
      : "Good Night";

  const greetingText = `${timeOfDay}, ${firstName || "there"}!`;

  // Format date for display
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get disease color
  const getDiseaseColor = (disease: string): string => {
    switch (disease.toLowerCase()) {
      case 'healthy':
        return '#16a34a';
      case 'leaf spot':
        return '#f59e0b';
      case 'powdery mildew':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const tips = [
    {
      id: 1,
      icon: '🌱',
      title: 'Proper Watering',
      description: 'Water deeply but infrequently to encourage root growth.'
    },
    {
      id: 2,
      icon: '☀️',
      title: 'Sunlight',
      description: 'Ensure 4-6 hours of direct sunlight daily.'
    },
    {
      id: 3,
      icon: '🌡️',
      title: 'Temperature',
      description: 'Keep between 60-70°F for optimal growth.'
    },
    {
      id: 4,
      icon: '🦠',
      title: 'Disease Prevention',
      description: 'Monitor leaves regularly for spots or discoloration.'
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} 
      >
        <View className="p-6 mt-5 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-5xl font-sfbold text-green-700">Dashboard</Text>
            <Text className="text-base font-sfmedium text-green-800">
              Monitor lettuce health, analyze data, and optimize farm conditions.
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={refreshDashboard}
            className="w-12 h-12 bg-green-100 rounded-full items-center justify-center"
            disabled={isLoadingData || isLoadingTip}
          >
            <Ionicons 
              name="refresh-outline" 
              size={24} 
              color={isLoadingData || isLoadingTip ? "#9ca3af" : "#16a34a"} 
            />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <View className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100">
            <Text className="text-base font-sfmedium text-green-800">{dateText}</Text>
            <Text className="text-2xl font-sfbold text-green-900 mt-1">{greetingText}</Text>
          </View>
        </View>

        <View className="px-6 py-4">
          
          <TouchableOpacity
            onPress={() => router.push("/scan")}
            className="flex-row items-center justify-between bg-green-600 p-4 rounded-2xl shadow-md"
          >
            <View className="flex-row items-center space-x-3 gap-2">
              <Ionicons name="scan-outline" size={24} color="white" />
              <Text className="text-white font-sfmedium text-lg">Start New Scan</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-4">
          <Text className="text-xl font-sfbold text-green-800 mb-4">Recent Scans</Text>
          {isLoadingData ? (
            // Loading skeleton for recent scans
            [1, 2].map((index) => (
              <View
                key={index}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm"
              >
                <View className="w-16 h-16 bg-gray-200 rounded-xl mr-4 animate-pulse" />
                <View className="flex-1">
                  <View className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                  <View className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                </View>
                <View className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              </View>
            ))
          ) : recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm"
              >
                <View className={`w-16 h-16 rounded-xl mr-4 items-center justify-center ${
                  scan.aiAnalysis.disease === 'Healthy' ? 'bg-green-100' : 
                  scan.aiAnalysis.disease === 'Leaf Spot' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Ionicons
                    name={scan.aiAnalysis.disease === "Healthy" ? "leaf-outline" : "warning-outline"}
                    size={28}
                    color={getDiseaseColor(scan.aiAnalysis.disease)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sfmedium text-gray-900 text-base">
                    {scan.aiAnalysis.disease}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formatDate(scan.timestamp)} • {(scan.aiAnalysis.confidence * 100).toFixed(1)}%
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {scan.imageName}
                  </Text>
                </View>
                <View className="items-end">
                  <View className={`px-2 py-1 rounded-full ${
                    scan.aiAnalysis.risk_level === 'high' ? 'bg-red-100' :
                    scan.aiAnalysis.risk_level === 'moderate' ? 'bg-yellow-100' :
                    scan.aiAnalysis.risk_level === 'low' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      scan.aiAnalysis.risk_level === 'high' ? 'text-red-700' :
                      scan.aiAnalysis.risk_level === 'moderate' ? 'text-yellow-700' :
                      scan.aiAnalysis.risk_level === 'low' ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {scan.aiAnalysis.risk_level.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-8">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="scan-outline" size={24} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-sfmedium mb-1">No scans yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                Take your first scan to see results here
              </Text>
            </View>
          )}
        </View>

        {/* AI Tip Section */}
        <View className="px-6 py-4">
          <View className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-2xl border border-blue-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="sparkles-outline" size={24} color="#3b82f6" />
              <Text className="ml-2 text-lg font-sfbold text-blue-800">🤖 AI Daily Tip</Text>
              <TouchableOpacity 
                onPress={() => fetchAiTip("random")}
                className="ml-auto"
                disabled={isLoadingTip}
              >
                <Ionicons 
                  name="refresh-outline" 
                  size={20} 
                  color={isLoadingTip ? "#9ca3af" : "#3b82f6"} 
                />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-700 font-sfmedium">
              {isLoadingTip ? "Loading new tip..." : aiTip}
            </Text>
          </View>
        </View>

        <View className="py-4">
          <Text className="text-xl font-sfbold text-green-800 mb-4 px-6">Growing Tips</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={Dimensions.get('window').width * 0.85 + 16}
            snapToAlignment="center"
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {tips.map((tip) => (
              <View
                key={tip.id}
                style={{ width: Dimensions.get('window').width * 0.85 }}
                className="bg-green-50 p-6 rounded-2xl border-green-700  mr-4"
              >
                <Text className="text-5xl mb-2">{tip.icon}</Text>
                <Text className="text-2xl font-sfbold text-green-800 mb-2">
                  {tip.title}
                </Text>
                <Text className="text-base font-sfmedium text-gray-700">
                  {tip.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
