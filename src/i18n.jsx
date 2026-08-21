import { createContext, useContext, useState } from 'react'

const dict = {
  en: {
    dashboard: 'Dashboard',
    disease: 'Disease Detection',
    advisory: 'Advisory',
    market: 'Market Linkage',
    welcome: 'Good morning',
    farmHealth: 'Farm Health Score',
    soil: 'Soil', water: 'Water', diseaseFree: 'Disease-free', yieldFc: 'Yield Outlook',
    quickStats: 'Field Conditions',
    temp: 'Temperature', humidity: 'Humidity', moisture: 'Soil Moisture', rain: 'Rain (24h)',
    alerts: 'Advisory Alerts', viewAll: 'View all',
    mandiTrend: 'Mandi Price Trend', scanCrop: 'Scan a Leaf',
    scanDesc: 'Upload a photo for instant AI disease diagnosis',
    analyze: 'Analyze Photo', dragDrop: 'Drag & drop a leaf image, or click to browse',
    recentScans: 'Recent Scans',
    npkTitle: 'Soil Nutrient Advisory', irrigation: 'Irrigation Schedule',
    buyers: 'Matched Buyers', harvestWindow: 'Optimal Harvest Window',
    langToggle: 'हिं',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    disease: 'रोग पहचान',
    advisory: 'सलाह',
    market: 'बाज़ार लिंकेज',
    welcome: 'सुप्रभात',
    farmHealth: 'फ़ार्म स्वास्थ्य स्कोर',
    soil: 'मिट्टी', water: 'जल', diseaseFree: 'रोगमुक्त', yieldFc: 'उपज अनुमान',
    quickStats: 'खेत की स्थिति',
    temp: 'तापमान', humidity: 'नमी', moisture: 'मिट्टी की नमी', rain: 'वर्षा (24घं)',
    alerts: 'सलाह चेतावनी', viewAll: 'सभी देखें',
    mandiTrend: 'मंडी मूल्य रुझान', scanCrop: 'पत्ती स्कैन करें',
    scanDesc: 'तुरंत AI रोग निदान के लिए फोटो अपलोड करें',
    analyze: 'फोटो विश्लेषण करें', dragDrop: 'पत्ती की छवि खींचें या क्लिक करें',
    recentScans: 'हाल की स्कैन',
    npkTitle: 'मिट्टी पोषक सलाह', irrigation: 'सिंचाई अनुसूची',
    buyers: 'मिलान खरीदार', harvestWindow: 'उपयुक्त फसल कटाई विंडो',
    langToggle: 'EN',
  }
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => dict[lang][key] || key
  const toggle = () => setLang(l => l === 'en' ? 'hi' : 'en')
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
