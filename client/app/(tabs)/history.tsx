import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const History = () => {
  const scans = [
    {
      id: "1",
      date: "2024-03-20",
      time: "14:30",
      result: "Fungi",
      confidence: "98%",
      image: "https://example.com/lettuce1.jpg",
    },
    {
      id: "2",
      date: "2024-03-20",
      time: "14:30",
      result: "Fungi",
      confidence: "98%",
      image: "https://example.com/lettuce1.jpg",
    },
    {
      id: "3",
      date: "2024-03-20",
      time: "14:30",
      result: "Healthy",
      confidence: "98%",
      image: "https://example.com/lettuce1.jpg",
    },
    {
      id: "4",
      date: "2024-03-20",
      time: "14:30",
      result: "Bacterial",
      confidence: "98%",
      image: "https://example.com/lettuce1.jpg",
    },
    {
      id: "5",
      date: "2024-03-20",
      time: "14:30",
      result: "Bacterial",
      confidence: "98%",
      image: "https://example.com/lettuce1.jpg",
    },
  ];

  const renderScanItem = ({ item }: { item: (typeof scans)[0] }) => (
    <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 mb-3">
      <View className="flex-row items-center space-x-3 gap-2">
        <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center">
          <Ionicons
            name={
              item.result === "Healthy" ? "leaf-outline" : "warning-outline"
            }
            size={24}
            color="#16a34a"
          />
        </View>
        <View>
          <Text className="font-sfmedium text-gray-900 ">{item.result}</Text>
          <Text className="text-sm text-gray-500">
            {item.date} at {item.time}
          </Text>
        </View>
      </View>
      <Text className="text-green-700 font-sfmedium">{item.confidence}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6 mt-5 ">
        <Text className="text-5xl font-sfbold text-green-700">History</Text>
        <Text className="text-lg font-sfmedium text-green-800">
          View your past lettuce analyses
        </Text>
      </View>

      <FlatList
        data={scans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-6"
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Ionicons name="time-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 font-sfmedium mt-2">
              No scan history yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default History;
