import CssBaseline from '@material-ui/core/CssBaseline'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import Viewer from './Viewer'

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <CssBaseline />
    {/\/viewer\/?$/.test(window.location.pathname) ? <Viewer /> : <App />}
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
