// ===== LIBRARIES ===== //
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { QrCode } from "lucide-react"

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const QRButton = () => {
  const navigate = useNavigate()
  const [showQRLabel, setShowQRLabel] = useState(false)
  const [isLabelFadingOut, setIsLabelFadingOut] = useState(false)

  // Show QR label after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQRLabel(true)
    }, 1000) // Show after 1 second

    // Start fade out animation and then hide label
    const hideTimer = setTimeout(() => {
      setIsLabelFadingOut(true)
      // Hide label after animation completes
      setTimeout(() => {
        setShowQRLabel(false)
        setIsLabelFadingOut(false)
      }, 180) // Match animation duration
    }, 6000) // Start fade out after 6 seconds total

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleQRCodeClick = () => {
    setIsLabelFadingOut(true) // Start fade out animation
    // Hide label after animation completes
    setTimeout(() => {
      setShowQRLabel(false)
      setIsLabelFadingOut(false)
    }, 180) // Match animation duration
    navigate("/qr")
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* QR Label */}
      {showQRLabel && (
        <div className={`absolute top-1/2 -translate-y-1/2 -left-39 ${
          isLabelFadingOut 
            ? 'animated-fadeOut-up-fast' 
            : 'animate-in fade-in-0 zoom-in-95 duration-300'
        }`}>
          <Label className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg border text-sm font-medium whitespace-nowrap">
            Tap me to scan QR!
          </Label>
          {/* Arrow pointing right */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-white dark:border-l-gray-800"></div>
        </div>
      )}
      
      <div
        onClick={handleQRCodeClick}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-transparent backdrop-blur-sm border-2 border-gray-300/50 dark:border-gray-600 shadow-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center"
      >
        <QrCode className="w-full h-full scale-110 text-gray-600/50 dark:text-white" />
      </div>
    </div>
  )
}

export default QRButton
