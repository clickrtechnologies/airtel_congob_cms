import { NgxLoggerLevel } from "ngx-logger";

export const environment = {

  production: false,

  firebase: {
    apiKey: "AIzaSyDAZNWimAjCKSgFTNYwDbiFaTyBy6NaVdI",
  authDomain: "crbt-df05c.firebaseapp.com",
  projectId: "crbt-df05c",
   storageBucket: "crbt-df05c.appspot.com",
  messagingSenderId: "801274491647",
  appId: "1:801274491647:web:17ea6a01e580401d31d2ca",
  measurementId: "G-65MVRD9Q3G"
  },


  // apiUrl: 'http://localhost:8084/', // trailing slash is goodd
  apiUrl: 'https://crbt.mobbilewap.com:8084/', // backend server public IP + API port.

  logging: {
    level: NgxLoggerLevel.DEBUG,          // console logs
    serverLogLevel: NgxLoggerLevel.DEBUG, // sent to backend - include all INFO/DEBUG logs
    serverLoggingUrl: 'api/frontend-logs'  // no leading slash to avoid double // with apiUrl
  }
}