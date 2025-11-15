import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { RecaptchaProvider } from './context/RecaptchaContext.jsx'
import { GoogleAuthProvider } from './context/GoogleAuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleAuthProvider>
      <RecaptchaProvider>
        <App />
      </RecaptchaProvider>
    </GoogleAuthProvider>
  </React.StrictMode>
)


