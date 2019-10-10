import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import { WebView } from "react-native-webview";
import Geolocation from '@react-native-community/geolocation';
import { View, Platform, PermissionsAndroid } from 'react-native';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.webView = null;
    state = {
      location: null,

    };
  }

  async requestLocationPermission() {
    if (Platform.OS === 'ios') {
      return true;
    }
    else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (
        granted === PermissionsAndroid.RESULTS.GRANTED
      ) {

        return true
      }
      else {
        return false
      }
    }
  }

  getLocation = () => {
    this.requestLocationPermission()
      .then((didGetPermission) => {
        if (didGetPermission) {
          Geolocation.getCurrentPosition(
            (position) => {
              const initialPosition = JSON.stringify(position);
              this.setState({ initialPosition });
              console.log(initialPosition);
              this.webView.postMessage(initialPosition);
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        }
        else {
          alert('no Permission granted')
        }
      })

  }

  addCameraPhoto = () => {

    ImagePicker.launchCamera({}, response => {

      if (response.didCancel) {
        console.warn("u cancelled");
      } else if (response.error) {
        console.warn(response.error)
      } else {
        console.log(response.data);
        this.webView.postMessage(response.data);

      }
    })
  }
  render() {
    return (
      <WebView
        originWhitelist={['*']}
        source={{
          html: `<html>
          <style>
          .button {
            background-color: #4CAF50; /* Green */
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 30px;
          }
          </style>
        <body>
        <script> 
        function getlocation() {
          window.ReactNativeWebView.postMessage("location");
          document.addEventListener("message", function(event) {
               document.getElementById("value").innerHTML = event.data;   
          });
        }
        function getImage() {
        window.ReactNativeWebView.postMessage("Image");
        document.addEventListener("message", function(event) {
            var str = 'data:image/jpg;base64,'
            var data = str.concat(event.data)
            var x = document.createElement("IMG");
            x.setAttribute("src", data);
            x.setAttribute("alt", "selected pic");
            document.body.appendChild(x);
        });
      }
        </script>
        <h1 style="color:blue;text-align:center;"> geolocation</h1>
        <button class="button" onclick="getlocation()" >Get location</button>
        <p id="value" style="color:black;font-size:50px;"></p>
        <h1 style="color:blue;text-align:center;"> Image</h1>
        <button onclick="getImage()" class="button">Get Image</button>                     
        </body>
        </html>` }}
        style={{ marginTop: 20 }}
        onMessage={
          (event) => { 
            (event.nativeEvent.data == 'location')?this.getLocation():this.addCameraPhoto()
             }
        }
        ref={(webView) => this.webView = webView}
      />
    )
  }
}