/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Orientation from 'react-native-orientation-locker';

// Lock the app in portrait mode by default
Orientation.lockToPortrait();

AppRegistry.registerComponent(appName, () => App);
