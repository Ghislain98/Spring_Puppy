import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as LegacyFS from 'expo-file-system/legacy';

// HabitQuest tourne comme un jeu HTML autonome (mêmes mécaniques, mêmes
// sprites et même équilibrage que la version web). On le charge dans une
// WebView plein écran : une seule source de vérité, hors-ligne, et chaque
// amélioration du jeu arrive automatiquement dans l'APK.
const GAME_HTML = require('./assets/game.html');
// Origine stable → localStorage persistant (sauvegarde de la partie).
const BASE_URL = 'https://habitquest.local/';
const BG = '#120d1c';

export default function App() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const asset = Asset.fromModule(GAME_HTML);
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        const content = await LegacyFS.readAsStringAsync(uri);
        if (alive) setHtml(content);
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Chargement impossible');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} translucent={false} />
      {html ? (
        <WebView
          source={{ html, baseUrl: BASE_URL }}
          style={styles.web}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mediaPlaybackRequiresUserAction={false}
          overScrollMode="never"
          bounces={false}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
          textZoom={100}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f4b942" />
          <Text style={styles.msg}>{error ? `Erreur : ${error}` : 'Chargement du donjon…'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: BG },
  msg: { color: '#b0a4c6', fontSize: 13, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }) },
});
