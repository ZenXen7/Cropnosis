"use client"

import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useCameraPermissions } from 'expo-camera';
import * as Camera from "expo-camera"
import { API_BASE_URL } from "@/lib/apiConfig"
import { useAuthStore } from "@/store/authStore"

const Scan = () => {
  const userId = useAuthStore((state) => state.userId)
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [permission, requestPermission] = useCameraPermissions();
  const [analysisResult, setAnalysisResult] = useState<null | {
    predictions: Array<{name: string, confidence: number}>
    aiAnalysis: {
      disease: string
      confidence: number
      severity: string
      description: string
      symptoms: string[]
      causes: string[]
      treatment: {
        immediate: string
        long_term: string
      }
      prevention: string[]
      recommendations: string[]
      risk_level: string
      estimated_loss: string
      next_steps: string
    }
    processingTime: number
    success: boolean
    message: string
  }>(null)
  
  const getPermission = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
  };
    useEffect(() => {
      if (!permission?.granted) {
        requestPermission();
      }
    }, [permission]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setAnalysisResult(null)
      analyzeImage(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    if (hasCameraPermission === false) {
      Alert.alert("Camera Permission", "Camera access is required to take photos.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setAnalysisResult(null)
      analyzeImage(result.assets[0].uri)
    }
  }

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true)
    try {
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'crop-image.jpg',
      } as any)
      if (userId) {
        formData.append('userId', userId)
      }

      // Make API call to your backend
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('🤖 AI Analysis received:', data.aiAnalysis)
        setAnalysisResult(data)
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error("Analysis error:", error)
      Alert.alert("Analysis Error", "Failed to analyze the image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetScan = () => {
    setImage(null)
    setAnalysisResult(null)
  }

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
       contentContainerStyle={{ paddingBottom: 80 }} >
      
        <View className="p-6 mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-5xl font-sfbold text-green-700">Scan</Text>
            <Text className="text-lg font-sfmedium text-green-800">Capture and analyze lettuce health in real-time.
            </Text>
          </View>
          
        </View>

       
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

   
        <View className="px-6 mt-4">
          {image ? (
            <View className="w-full">
            
              <View className="bg-gray-100 p-2 rounded-2xl shadow-sm">
                <Image source={{ uri: image }} className="w-full h-80 rounded-xl" resizeMode="cover" />

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

             
              {analysisResult && (
                <View className="mt-4 space-y-4">
                  {/* Basic Results */}
                  <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <Text className="text-lg font-bold text-gray-800 mb-3">🤖 AI Analysis Results</Text>

                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-700">Detected Disease:</Text>
                      <View className={`px-3 py-1 rounded-full ${
                        analysisResult.aiAnalysis.severity === 'high' ? 'bg-red-100' :
                        analysisResult.aiAnalysis.severity === 'moderate' ? 'bg-yellow-100' :
                        analysisResult.aiAnalysis.severity === 'low' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Text className={`font-medium ${
                          analysisResult.aiAnalysis.severity === 'high' ? 'text-red-700' :
                          analysisResult.aiAnalysis.severity === 'moderate' ? 'text-yellow-700' :
                          analysisResult.aiAnalysis.severity === 'low' ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {analysisResult.aiAnalysis.disease}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-700">Confidence:</Text>
                      <View className="flex-row items-center">
                        <View className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-green-600 rounded-full"
                            style={{ width: `${(analysisResult.aiAnalysis.confidence * 100)}%` }}
                          />
                        </View>
                        <Text className="ml-2 text-green-700 font-medium">
                          {(analysisResult.aiAnalysis.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-700">Risk Level:</Text>
                      <View className={`px-3 py-1 rounded-full ${
                        analysisResult.aiAnalysis.risk_level === 'high' ? 'bg-red-100' :
                        analysisResult.aiAnalysis.risk_level === 'moderate' ? 'bg-yellow-100' :
                        analysisResult.aiAnalysis.risk_level === 'low' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Text className={`font-medium ${
                          analysisResult.aiAnalysis.risk_level === 'high' ? 'text-red-700' :
                          analysisResult.aiAnalysis.risk_level === 'moderate' ? 'text-yellow-700' :
                          analysisResult.aiAnalysis.risk_level === 'low' ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {analysisResult.aiAnalysis.risk_level.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* AI Analysis Details */}
                  <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <Text className="text-lg font-bold text-gray-800 mb-3">📋 Detailed Analysis</Text>
                    
                    <View className="mb-3">
                      <Text className="text-gray-700 font-medium mb-1">Description:</Text>
                      <Text className="text-gray-600">{analysisResult.aiAnalysis.description}</Text>
                    </View>

                    <View className="mb-3">
                      <Text className="text-gray-700 font-medium mb-1">Symptoms:</Text>
                      {analysisResult.aiAnalysis.symptoms.map((symptom, index) => (
                        <Text key={index} className="text-gray-600">• {symptom}</Text>
                      ))}
                    </View>

                    <View className="mb-3">
                      <Text className="text-gray-700 font-medium mb-1">Treatment:</Text>
                      <Text className="text-gray-600 font-medium">Immediate:</Text>
                      <Text className="text-gray-600 ml-2">{analysisResult.aiAnalysis.treatment.immediate}</Text>
                      <Text className="text-gray-600 font-medium mt-1">Long-term:</Text>
                      <Text className="text-gray-600 ml-2">{analysisResult.aiAnalysis.treatment.long_term}</Text>
                    </View>

                    <View className="mb-3">
                      <Text className="text-gray-700 font-medium mb-1">Recommendations:</Text>
                      {analysisResult.aiAnalysis.recommendations.map((rec, index) => (
                        <Text key={index} className="text-gray-600">• {rec}</Text>
                      ))}
                    </View>

                    <View className="mb-3">
                      <Text className="text-gray-700 font-medium mb-1">Next Steps:</Text>
                      <Text className="text-gray-600">{analysisResult.aiAnalysis.next_steps}</Text>
                    </View>

                    <View className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <Text className="text-blue-800 font-medium">Estimated Loss: {analysisResult.aiAnalysis.estimated_loss}</Text>
                    </View>
                  </View>
                </View>
              )}

            
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
                  onPress={() => Alert.alert("Save", "Result saved to your history")}
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="ml-2 text-white font-medium">Save Result</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-4 w-full my-3">
             
              <TouchableOpacity
                onPress={takePhoto}
                className="bg-white border border-gray-200 p-5 rounded-2xl "
              >
                <View className="flex-row items-center mb-2">
                  <View className="bg-green-100 p-2 rounded-full mr-3">
                    <Ionicons name="camera-outline" size={24} color="#16a34a" />
                  </View>
                  <View>
                    <Text className="font-sfbold text-lg text-gray-800">Take Photo</Text>
                    <Text className="font-sfmedium text-gray-500">Use camera to capture lettuce</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" style={{ marginLeft: "auto" }} />
                </View>
              </TouchableOpacity>

             
              <TouchableOpacity
                onPress={pickImage}
                className="bg-white border border-gray-200 p-5 rounded-2xl my-3"
              >
                <View className="flex-row items-center mb-2">
                  <View className="bg-green-100 p-2 rounded-full mr-3">
                    <Ionicons name="images-outline" size={24} color="#16a34a" />
                  </View>
                  <View>
                    <Text className="font-sfbold text-lg text-gray-800">Choose from Gallery</Text>
                    <Text className="font-sfmedium text-gray-500">Select existing image</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" style={{ marginLeft: "auto" }} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

       
        {!image && (
        <View className="px-6 pb-6">
          <Text className="font-sfbold text-xl text-green-800 mb-3">Scanning Tips</Text>

          <View className="space-y-3">
            {(
              [
                { icon: "sunny-outline" as keyof typeof Ionicons.glyphMap, text: "Take photos in good lighting conditions" },
                { icon: "scan-outline" as keyof typeof Ionicons.glyphMap, text: "Focus on the affected area of the lettuce" },
                { icon: "hand-left-outline" as keyof typeof Ionicons.glyphMap, text: "Hold the camera steady for clear images" },
                { icon: "close-circle-outline" as keyof typeof Ionicons.glyphMap, text: "Avoid shadows on the plant surface" },
              ] as const
            ).map((tip, index) => (
              <View key={index} className="flex-row items-center">
                <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center">
                  <Ionicons name={tip.icon} size={18} color="#16a34a" />
                </View>
                <Text className="ml-3 text-gray-700 font-sfmedium">{tip.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      </ScrollView>
    </SafeAreaView>
  )
}

export default Scan

