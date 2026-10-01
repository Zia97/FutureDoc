import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { createForumPost, forumErrorMessage, pickForumImages } from '../../lib/forum';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { returnToCommunity } from '../../navigation/forumNavigation';

export default function CreateForumPostScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const chooseImages = async () => {
    try {
      const selected = await pickForumImages(2 - images.length);
      setImages((current) => [...current, ...selected].slice(0, 2));
    } catch (error) { Alert.alert('Could not add screenshot', error.message); }
  };

  const submit = async () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5) return Alert.alert('Add a title', 'The title must be at least 5 characters.');
    if (cleanBody.length < 10) return Alert.alert('Add more detail', 'The post must be at least 10 characters.');
    setSubmitting(true);
    let navigated = false;
    try {
      await createForumPost({
        title: cleanTitle,
        body: cleanBody,
        images,
        onPending: () => {
          navigated = true;
          returnToCommunity(navigation);
        },
      });
    } catch (error) {
      if (!navigated) Alert.alert('Could not post', forumErrorMessage(error));
    } finally { setSubmitting(false); }
  };

  return (
    <PremiumScreen>
      <AppHeader navigation={navigation} title="New discussion" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.textMuted }]}>TITLE</Text>
          <TextInput
            style={[styles.titleInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(6,16,31,0.94)' : '#fff' }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What would you like to discuss?"
            placeholderTextColor={colors.textMuted}
            maxLength={120}
          />
          <Text style={[styles.counter, { color: colors.textMuted }]}>{title.length}/120</Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>POST</Text>
          <TextInput
            style={[styles.bodyInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(6,16,31,0.94)' : '#fff' }]}
            value={body}
            onChangeText={setBody}
            placeholder="Share context, explain what you tried, or ask your question…"
            placeholderTextColor={colors.textMuted}
            maxLength={5000}
            multiline
            textAlignVertical="top"
          />
          <Text style={[styles.counter, { color: colors.textMuted }]}>{body.length}/5000</Text>

          <View style={styles.attachmentHeader}>
            <View>
              <Text style={[styles.label, { color: colors.textMuted, marginBottom: 3 }]}>SCREENSHOTS</Text>
              <Text style={[styles.helper, { color: colors.textSecondary }]}>Up to two images. Videos are not supported.</Text>
            </View>
            <Text style={[styles.imageCount, { color: colors.textMuted }]}>{images.length}/2</Text>
          </View>

          {images.length ? (
            <View style={styles.images}>
              {images.map((image, index) => (
                <View key={image.uri} style={styles.imageWrap}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity style={styles.remove} onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <Ionicons name="close" size={17} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {images.length < 2 ? (
            <TouchableOpacity style={[styles.addImage, { borderColor: hexToRgba(colors.cyan, 0.45), backgroundColor: hexToRgba(colors.cyan, 0.08) }]} onPress={chooseImages}>
              <Ionicons name="image-outline" size={22} color={colors.cyan} />
              <Text style={[styles.addImageText, { color: colors.cyan }]}>Add screenshot</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={[styles.submit, { backgroundColor: colors.blue }]} onPress={submit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <><Ionicons name="send" size={19} color="#fff" /><Text style={styles.submitText}>Post discussion</Text></>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 42 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.35, marginBottom: 7, marginTop: 9 },
  titleInput: { borderWidth: 1, borderRadius: 15, minHeight: 52, paddingHorizontal: 14, fontSize: 16, fontWeight: '700' },
  bodyInput: { borderWidth: 1, borderRadius: 15, minHeight: 190, padding: 14, fontSize: 15, lineHeight: 22 },
  counter: { fontSize: 11, textAlign: 'right', marginTop: 5, marginBottom: 10 },
  attachmentHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 3 },
  helper: { fontSize: 12 },
  imageCount: { fontSize: 12, fontWeight: '800' },
  images: { flexDirection: 'row', gap: 10, marginTop: 12 },
  imageWrap: { flex: 1 },
  image: { width: '100%', height: 150, borderRadius: 14, backgroundColor: '#09172D' },
  remove: { position: 'absolute', right: 7, top: 7, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center' },
  addImage: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  addImageText: { fontSize: 14, fontWeight: '900' },
  submit: { minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
