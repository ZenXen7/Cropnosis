import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/lib/apiConfig";
import { useAuthStore } from "@/store/authStore";

// Type definitions
interface Prediction {
  id: string;
  timestamp: string;
  imageName: string;
  predictions: Array<{name: string, confidence: number}>;
  aiAnalysis: {
    disease: string;
    confidence: number;
    severity: string;
    description: string;
    risk_level: string;
    estimated_loss: string;
  };
  processingTime: number;
  success: boolean;
}

interface Statistics {
  total: number;
  healthy: number;
  diseased: number;
  recentCount: number;
  lastScan: string | null;
}

const History = () => {
  const userId = useAuthStore((state) => state.userId);
  const [scans, setScans] = useState<Prediction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'diseased'>('all');

  const fetchHistory = async () => {
    try {
      const historyUrl = userId
        ? `${API_BASE_URL}/history?userId=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/history`;
      const response = await fetch(historyUrl);
      const data = await response.json();
      
      if (data.success) {
        setScans(data.predictions);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  // Filter scans based on selected filter
  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true;
    if (filter === 'healthy') return scan.aiAnalysis.disease === 'Healthy';
    if (filter === 'diseased') return scan.aiAnalysis.disease !== 'Healthy';
    return true;
  });

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

  const getDiseaseIcon = (disease: string): keyof typeof Ionicons.glyphMap => {
    switch (disease.toLowerCase()) {
      case 'healthy':
        return 'leaf-outline';
      default:
        return 'warning-outline';
    }
  };

  const renderScanItem = ({ item }: { item: Prediction }) => (
    <TouchableOpacity className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
            item.aiAnalysis.disease === 'Healthy' ? 'bg-green-100' : 
            item.aiAnalysis.disease === 'Leaf Spot' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Ionicons 
              name={getDiseaseIcon(item.aiAnalysis.disease)} 
              size={28} 
              color={getDiseaseColor(item.aiAnalysis.disease)} 
            />
          </View>
          <View>
            <Text className="text-lg font-sfbold text-gray-900">
              {item.aiAnalysis.disease}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <View className="items-end">
          <View className={`px-3 py-1 rounded-full ${
            item.aiAnalysis.risk_level === 'high' ? 'bg-red-100' :
            item.aiAnalysis.risk_level === 'moderate' ? 'bg-yellow-100' :
            item.aiAnalysis.risk_level === 'low' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Text className={`text-xs font-sfbold ${
              item.aiAnalysis.risk_level === 'high' ? 'text-red-700' :
              item.aiAnalysis.risk_level === 'moderate' ? 'text-yellow-700' :
              item.aiAnalysis.risk_level === 'low' ? 'text-green-700' : 'text-gray-700'
            }`}>
              {item.aiAnalysis.risk_level.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Confidence Bar */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-sfmedium text-gray-600">Confidence</Text>
          <Text className="text-sm font-sfbold text-green-700">
            {(item.aiAnalysis.confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${(item.aiAnalysis.confidence * 100)}%` }}
          />
        </View>
      </View>

      {/* Description */}
      <View className="mb-3">
        <Text className="text-sm text-gray-600 leading-5">
          {item.aiAnalysis.description}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="image-outline" size={16} color="#9ca3af" />
          <Text className="text-xs text-gray-400 ml-1">
            {item.imageName}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#9ca3af" />
          <Text className="text-xs text-gray-400 ml-1">
            {item.processingTime}ms
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-6 pb-4">
          <Text className="text-4xl font-sfbold text-green-700">History</Text>
          <Text className="text-base font-sfmedium text-gray-600 mt-1">
            View your past lettuce analyses and track disease patterns
          </Text>
        </View>
        
        {/* Loading State */}
        <View className="flex-1 items-center justify-center">
          <View className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
            <Text className="text-gray-700 font-sfmedium text-lg mb-1">Loading History</Text>
            <Text className="text-gray-500 text-sm text-center">
              Fetching your scan results and AI analysis...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-6 pb-4">
        <Text className="text-4xl font-sfbold text-green-700">History</Text>
        <Text className="text-base font-sfmedium text-gray-600 mt-1">
          View your past lettuce analyses and track disease patterns
        </Text>
      </View>

      {/* Statistics Cards */}
      {statistics && (
        <View className="px-6 mb-4">
          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="analytics-outline" size={20} color="#16a34a" />
              </View>
              <Text className="text-xl font-sfbold text-gray-800">Scan Summary</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="scan-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="text-2xl font-sfbold text-blue-600">{statistics.total}</Text>
                <Text className="text-sm text-gray-500 font-sfmedium">Total Scans</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-green-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="leaf-outline" size={24} color="#16a34a" />
                </View>
                <Text className="text-2xl font-sfbold text-green-600">{statistics.healthy}</Text>
                <Text className="text-sm text-gray-500 font-sfmedium">Healthy</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-red-50 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="warning-outline" size={24} color="#ef4444" />
                </View>
                <Text className="text-2xl font-sfbold text-red-600">{statistics.diseased}</Text>
                <Text className="text-sm text-gray-500 font-sfmedium">Diseased</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Filter Buttons */}
      <View className="px-6 mb-4">
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`flex-1 py-3 px-4 rounded-2xl ${
              filter === 'all' ? 'bg-green-600' : 'bg-white border border-gray-200'
            }`}
          >
            <Text className={`text-center font-sfmedium ${
              filter === 'all' ? 'text-white' : 'text-gray-700'
            }`}>
              All ({scans.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('healthy')}
            className={`flex-1 py-3 px-4 rounded-2xl ${
              filter === 'healthy' ? 'bg-green-600' : 'bg-white border border-gray-200'
            }`}
          >
            <Text className={`text-center font-sfmedium ${
              filter === 'healthy' ? 'text-white' : 'text-gray-700'
            }`}>
              Healthy ({scans.filter(s => s.aiAnalysis.disease === 'Healthy').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('diseased')}
            className={`flex-1 py-3 px-4 rounded-2xl ${
              filter === 'diseased' ? 'bg-green-600' : 'bg-white border border-gray-200'
            }`}
          >
            <Text className={`text-center font-sfmedium ${
              filter === 'diseased' ? 'text-white' : 'text-gray-700'
            }`}>
              Diseased ({scans.filter(s => s.aiAnalysis.disease !== 'Healthy').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* History List */}
      <View className="flex-1">
        <View className="px-6 mb-3">
          <Text className="text-lg font-sfbold text-gray-800">
            {filter === 'all' ? 'Recent Scans' : 
             filter === 'healthy' ? 'Healthy Scans' : 'Diseased Scans'}
          </Text>
        </View>
        
        <FlatList
          data={filteredScans}
          renderItem={renderScanItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="time-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 font-sfmedium text-lg mb-2">
                {filter === 'all' ? 'No scan history yet' :
                 filter === 'healthy' ? 'No healthy scans found' : 'No diseased scans found'}
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                {filter === 'all' ? 'Take your first scan to see detailed AI analysis results here' :
                 'Try changing the filter or take a new scan'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default History