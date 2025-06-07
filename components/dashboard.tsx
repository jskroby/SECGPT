"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic,
  Save,
  Music,
  ListMusic,
  Download,
  Trash2,
  Play,
  Pause,
  AudioWaveformIcon as Waveform,
  Coins,
  BarChart3,
} from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { NFTCard } from "@/components/nft-card"

interface DashboardProps {
  themeIndex: number
}

export default function Dashboard({ themeIndex }: DashboardProps) {
  const { isRecording, startRecording, stopRecording, audioBlob, convertToMidi, recordings } = useAudioRecorder()

  const [activeTab, setActiveTab] = useState("record")

  // Different UI styles based on theme index
  const getNeomorphicStyle = () => {
    switch (themeIndex) {
      case 0:
        return "from-gray-800 to-gray-900 border-orange-500/20 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)]"
      case 1:
        return "from-blue-900 to-gray-900 border-blue-500/20 shadow-[12px_12px_24px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.03)]"
      case 2:
        return "from-orange-900 to-gray-900 border-orange-600/20 shadow-[10px_10px_20px_rgba(0,0,0,0.35),-5px_-5px_10px_rgba(255,255,255,0.04)]"
      default:
        return "from-gray-900 to-blue-900 border-blue-600/20 shadow-[15px_15px_30px_rgba(0,0,0,0.45),-7px_-7px_14px_rgba(255,255,255,0.02)]"
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`dashboard-${themeIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent"
          >
            {themeIndex === 0
              ? "SONIC STUDIO"
              : themeIndex === 1
                ? "FREQUENCY LAB"
                : themeIndex === 2
                  ? "VOID CONSOLE"
                  : "RESONANCE HUB"}
          </motion.h1>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-600 text-white text-sm font-medium">
              <Coins className="inline-block mr-2 h-4 w-4" />
              <span>2,450 FART</span>
            </div>
          </motion.div>
        </div>

        <Tabs defaultValue="record" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-3 mb-8 p-1 rounded-xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
            <TabsTrigger
              value="record"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Mic className="mr-2 h-4 w-4" />
              Record
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <ListMusic className="mr-2 h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Coins className="mr-2 h-4 w-4" />
              NFTs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-8">
            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">Audio Recorder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] flex items-center justify-center">
                    {isRecording ? (
                      <AudioVisualizer />
                    ) : audioBlob ? (
                      <div className="text-center">
                        <Waveform className="h-16 w-16 text-orange-500 mx-auto mb-2" />
                        <p className="text-gray-400">Recording ready for conversion</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Mic className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">Press record to start</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Record
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className="px-6 py-2 rounded-xl shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    )}

                    <Button
                      onClick={convertToMidi}
                      disabled={!audioBlob}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0 disabled:opacity-50"
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Convert to MIDI
                    </Button>

                    <Button
                      disabled={!audioBlob}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0 disabled:opacity-50"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">Audio Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Enhance", "Add Reverb", "Normalize", "Add Bass", "Synthesize", "Harmonize"].map((effect, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      disabled={!audioBlob}
                      className="py-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 border border-orange-500/10 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 disabled:opacity-50"
                    >
                      {effect}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-8">
            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">Your Audio Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recordings.length === 0 ? (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Your library is empty. Record some audio to get started!</p>
                    </div>
                  ) : (
                    recordings.map((recording, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.05)]">
                            <Waveform className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-white font-medium">Recording {i + 1}</p>
                            <p className="text-gray-400 text-sm">
                              00:
                              {Math.floor(Math.random() * 59)
                                .toString()
                                .padStart(2, "0")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">MIDI Compositions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Convert your recordings to MIDI to see them here!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfts" className="space-y-8">
            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">Your NFT Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <NFTCard key={i} themeIndex={themeIndex} />
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button className="px-8 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0">
                    Mint New NFT
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
              <CardHeader>
                <CardTitle className="text-xl text-white">NFT Marketplace Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Floor Price", value: "0.45 ETH", icon: Coins },
                    { label: "Volume (24h)", value: "12.8 ETH", icon: BarChart3 },
                    { label: "Your Earnings", value: "2.3 ETH", icon: Coins },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)]"
                    >
                      <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.05)]">
                          <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="ml-3 text-gray-400">{stat.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  )
}
