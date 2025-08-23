"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Loader2, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VoiceCaptureProps {
  onMemoryAdded: (memory: {
    content: string
    source: string
    type: "voice"
    metadata?: any
  }) => void
}

export default function VoiceCapture({ onMemoryAdded }: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [realTimeTranscript, setRealTimeTranscript] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API for real-time transcription
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setRealTimeTranscript(finalTranscript + interimTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setRealTimeTranscript("")

      // Start real-time speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop real-time speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Process the final transcript
      if (realTimeTranscript.trim()) {
        processTranscription(realTimeTranscript.trim())
      }
    }
  }

  const processTranscription = async (transcript: string) => {
    setIsProcessing(true)
    setTranscription(transcript)

    try {
      // Add to memories immediately
      onMemoryAdded({
        content: transcript,
        source: "Voice Capture",
        type: "voice",
        metadata: {
          duration: recordingTime,
          timestamp: new Date().toISOString(),
          realTime: true,
        },
      })

      setIsProcessing(false)
    } catch (error) {
      console.error("Error processing transcription:", error)
      setIsProcessing(false)
    }
  }

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const resetCapture = () => {
    setAudioBlob(null)
    setTranscription("")
    setRealTimeTranscript("")
    setRecordingTime(0)
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Badge variant="destructive">Recording</Badge>
              <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
            </div>
            <Button onClick={stopRecording} size="lg" variant="destructive" className="rounded-full">
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </div>
        )}

        {audioBlob && !isProcessing && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={playRecording}
              variant="outline"
              disabled={isPlaying}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPlaying ? "Playing..." : "Play"}
            </Button>
            <Button onClick={resetCapture} variant="outline" className="border-gray-200 bg-transparent">
              Reset
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Real-time Transcription Display */}
      {isRecording && realTimeTranscript && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Live Transcription</Badge>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Real-time</span>
                </div>
              </div>
              <p className="text-gray-800 bg-white p-3 rounded border border-blue-200 min-h-[60px]">
                {realTimeTranscript || "Start speaking..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Transcription Result */}
      {transcription && !isRecording && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved to Memory
                </Badge>
                <span className="text-sm text-gray-500">Duration: {formatTime(recordingTime)}</span>
              </div>
              <p className="text-gray-800 bg-white p-3 rounded border border-green-200">{transcription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>Click "Start Recording" to capture your thoughts with real-time transcription</p>
        <p>Your voice will be transcribed live and automatically saved to your memory</p>
      </div>
    </div>
  )
}
