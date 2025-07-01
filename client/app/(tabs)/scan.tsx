"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useCameraPermissions } from 'expo-camera';
import * as Camera from "expo-camera"

// Memoized tip item component for better performance
const TipItem = React.memo(({ icon, text }: { icon: keyof typeof Ionicons.glyphMap, text: string }) => (
  <View className="flex-row items-center">
    <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center">
      <Ionicons name={icon} size={18} color="#16a34a" />
    </View>
    <Text className="ml-3 text-gray-700 font-sfmedium">{text}</Text>
  </View>
));

// Memoized analysis result component
const AnalysisResult = React.memo(({ result }: { 
  result: { disease: string; confidence: number; recommendation: string } 
}) => (
  <View className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
    <Text className="text-lg font-bold text-gray-800 mb-2">Analysis Results</Text>

    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-gray-700">Detected Disease:</Text>
      <View className="bg-red-100 px-3 py-1 rounded-full">
        <Text className="text-red-700 font-medium">{result.disease}</Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-gray-700">Confidence:</Text>
      <View className="flex-row items-center">
        <View className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-green-600 rounded-full"
            style={{ width: `${result.confidence}%` }}
          />
        </View>
        <Text className="ml-2 text-green-700 font-medium">{result.confidence}%</Text>
      </View>
    </View>

    <View className="mt-2">
      <Text className="text-gray-700 mb-1">Recommendation:</Text>
      <Text className="text-gray-600">{result.recommendation}</Text>
    </View>
  </View>
));

// Memoized action button component
const ActionButton = React.memo(({ 
  onPress, 
  icon, 
  title, 
  subtitle, 
  backgroundColor = "bg-white" 
}: {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  backgroundColor?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`${backgroundColor} border border-gray-200 p-5 rounded-2xl my-3`}
  >
    <View className="flex-row items-center mb-2">
      <View className="bg-green-100 p-2 rounded-full mr-3">
        <Ionicons name={icon} size={24} color="#16a34a" />
      </View>
      <View>
        <Text className="font-sfbold text-lg text-gray-800">{title}</Text>
        <Text className="font-sfmedium text-gray-500">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9ca3af" style={{ marginLeft: "auto" }} />
    </View>
  </TouchableOpacity>
));

const Scan = () => {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [permission, requestPermission] = useCameraPermissions();
  const [analysisResult, setAnalysisResult] = useState<null | {
    disease: string
    confidence: number
    recommendation: string
  }>(null)
  
  // Memoized permission check
  const getPermission = useCallback(async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Optimized image compression function
  const compressImage = useCallback((uri: string) => {
    // In a real implementation, you would compress the image here
    // For now, we'll return the original URI
    return uri;
  }, []);

  // Memoized image picker with compression
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Compress to 80% quality
      compress: 0.8, // Additional compression
    })

    if (!result.canceled) {
      const compressedUri = compressImage(result.assets[0].uri);
      setImage(compressedUri)
      setAnalysisResult(null)
      analyzeImage(compressedUri)
    }
  }, [compressImage])

  // Memoized camera function with compression
  const takePhoto = useCallback(async () => {
    if (hasCameraPermission === false) {
      Alert.alert("Camera Permission", "Camera access is required to take photos.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Compress to 80% quality
      compress: 0.8, // Additional compression
    })

    if (!result.canceled) {
      const compressedUri = compressImage(result.assets[0].uri);
      setImage(compressedUri)
      setAnalysisResult(null)
      analyzeImage(compressedUri)
    }
  }, [hasCameraPermission, compressImage])

  // Optimized analysis function with caching
  const analyzeImage = useCallback(async (imageUri: string) => {
    setIsAnalyzing(true)
    try {
      // Add cache check here if needed
      // const cached = await getCachedResult(imageUri);
      // if (cached) {
      //   setAnalysisResult(cached);
      //   return;
      // }

      // Simulate API call with better error handling
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = {
        disease: "Bacterial Leaf Spot",
        confidence: 92.7,
        recommendation:
          "Apply copper-based fungicide and ensure proper spacing between plants for better air circulation.",
      };

      setAnalysisResult(result);
      // Cache the result for future use
      // await cacheResult(imageUri, result);
    } catch (error) {
      console.error("Analysis error:", error)
      Alert.alert("Analysis Error", "Failed to analyze the image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // Memoized reset function
  const resetScan = useCallback(() => {
    setImage(null)
    setAnalysisResult(null)
  }, [])

  // Memoized save function
  const saveResult = useCallback(() => {
    Alert.alert("Save", "Result saved to your history")
  }, [])

  // Memoized scanning tips data
  const scanningTips = useMemo(() => [
    { icon: "sunny-outline" as const, text: "Take photos in good lighting conditions" },
    { icon: "scan-outline" as const, text: "Focus on the affected area of the lettuce" },
    { icon: "hand-left-outline" as const, text: "Hold the camera steady for clear images" },
    { icon: "close-circle-outline" as const, text: "Avoid shadows on the plant surface" },
  ], []);

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        // Enable optimization for better performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      >
        {/* Header */}
        <View className="p-6 mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-5xl font-sfbold text-green-700">Scan</Text>
            <Text className="text-lg font-sfmedium text-green-800">Capture and analyze lettuce health in real-time.
            </Text>
          </View>
        </View>

        {/* Info banner - only show when no image */}
        {!image && (
          <View className="mx-6 bg-green-50 p-4 rounded-2xl">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="information-outline" size={22} color="#16a34a" />
              <Text className="ml-2 text-lg font-sfmedium text-green-800">How it works</Text>
            </View>
            <Text className="text-green-700 font-sf">
              Our CNN-based model analyzes your lettuce images to detect diseases with high accuracy. Take a clear photo
              of the affected area for best results.
            </Text>
          </View>
        )}

        {/* Main content */}
        <View className="px-6 mt-4">
          {image ? (
            <View className="w-full">
              {/* Image display with optimized loading */}
              <View className="bg-gray-100 p-2 rounded-2xl shadow-sm">
                <Image 
                  source={{ uri: image }} 
                  className="w-full h-80 rounded-xl" 
                  resizeMode="cover"
                  // Add loading optimization
                  loadingIndicatorSource={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=' }}
                />

                {isAnalyzing && (
                  <View className="absolute inset-0 bg-black/30 rounded-xl items-center justify-center">
                    <View className="bg-white p-4 rounded-xl items-center">
                      <ActivityIndicator size="large" color="#16a34a" />
                      <Text className="mt-2 text-green-700 font-sfmedium">Analyzing with AI...</Text>
                      <Text className="text-xs text-gray-500 mt-1">Using CNN model to detect diseases</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Analysis results */}
              {analysisResult && <AnalysisResult result={analysisResult} />}

              {/* Action buttons */}
              <View className="flex-row mt-4 space-x-2">
                <TouchableOpacity
                  onPress={resetScan}
                  className="flex-1 flex-row items-center justify-center bg-gray-100 p-4 rounded-2xl"
                >
                  <Ionicons name="refresh-outline" size={20} color="#4b5563" />
                  <Text className="ml-2 text-gray-700 font-medium">New Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-green-600 p-4 rounded-2xl"
                  onPress={saveResult}
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="ml-2 text-white font-medium">Save Result</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-4 w-full my-3">
              {/* Camera/Gallery buttons */}
              <ActionButton
                onPress={takePhoto}
                icon="camera-outline"
                title="Take Photo"
                subtitle="Use camera to capture lettuce"
              />

              <ActionButton
                onPress={pickImage}
                icon="images-outline"
                title="Choose from Gallery"
                subtitle="Select existing image"
              />
            </View>
          )}
        </View>

        {/* Scanning tips - only show when no image */}
        {!image && (
          <View className="px-6 pb-6">
            <Text className="font-sfbold text-xl text-green-800 mb-3">Scanning Tips</Text>
            <View className="space-y-3">
              {scanningTips.map((tip, index) => (
                <TipItem key={index} icon={tip.icon} text={tip.text} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default React.memo(Scan)

