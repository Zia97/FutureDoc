import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Alert from '../../services/appAlert';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { PerformanceButton, PerformanceCard, Segments, performanceStyles as s, usePerformanceTheme } from '../../components/performance/PerformanceUI';
import { useSupportNotifications } from '../../context/SupportNotificationsContext';
import { manageMarketingTester } from '../../services/marketingTesters';
import { hasMarketingAccess } from '../../lib/marketingAccess';

const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry';

export default function MarketingTestersScreen({ navigation }) {
  const { colors } = usePerformanceTheme();
  const { counts } = useSupportNotifications();
  const [email, setEmail] = useState('');
  const [days, setDays] = useState('90');
  const [target, setTarget] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(action) {
    if (!counts?.is_admin || busy) return;
    setBusy(true);
    try {
      const result = await manageMarketingTester(action, action === 'lookup' ? email : target.email,
        action === 'grant' ? { days: Number(days) } : action === 'revoke' ? { confirmRevoke: true } : {});
      setTarget(result.user); setIsAdmin(result.isAdmin === true);
    } catch (error) { Alert.alert('Marketing testers', error.message); }
    finally { setBusy(false); }
  }
  function revoke() {
    Alert.alert('Revoke tester access?', 'This removes marketing tools and complimentary Pro grants for this account. Paid subscriptions stay active.', [
      { text: 'Cancel', style: 'cancel' }, { text: 'Revoke access', style: 'destructive', onPress: () => run('revoke') },
    ]);
  }
  return <PremiumScreen><AppHeader title="Marketing testers" navigation={navigation} />
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {!counts?.is_admin ? <Text style={[s.body, { color: colors.textSecondary }]}>Administrator access required.</Text> : <>
        <PerformanceCard>
          <Text style={[s.title, { color: colors.text }]}>Find an account</Text>
          <TextInput accessibilityLabel="Tester email" placeholder="Email address" placeholderTextColor={colors.textMuted}
            value={email} onChangeText={(value) => { setEmail(value); setTarget(null); }} editable={!busy}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address" maxLength={254}
            style={{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, marginVertical: 14 }} />
          <PerformanceButton title={busy ? 'Please wait…' : 'Find account'} disabled={busy || !email.trim()} onPress={() => run('lookup')} />
        </PerformanceCard>
        {target && <PerformanceCard>
          <Text style={[s.title, { color: colors.text }]}>{target.displayName || target.email}</Text>
          {!!target.displayName && <Text style={[s.caption, { color: colors.textSecondary, marginTop: 5 }]}>{target.email}</Text>}
          <View style={{ gap: 8, marginVertical: 16 }}>
            <Text style={[s.body, { color: colors.textSecondary }]}>Marketing tools: {hasMarketingAccess(target.testerExpiresAt) ? `until ${dateLabel(target.testerExpiresAt)}` : 'Off'}</Text>
            <Text style={[s.body, { color: colors.textSecondary }]}>Pro: {target.isPro ? target.proExpiresAt ? `until ${dateLabel(target.proExpiresAt)}` : 'Active' : 'Off'}</Text>
          </View>
          {isAdmin ? <Text style={[s.body, { color: colors.textSecondary }]}>Choose a normal student account for marketing testing.</Text> : <View style={{ gap: 14 }}>
            <Segments values={['7', '30', '90'].map((id) => ({ id, label: `${id} days` }))} value={days} onChange={setDays} small />
            <PerformanceButton title={`Grant Pro and marketing tools · ${days} days`} disabled={busy} onPress={() => run('grant')} />
            <PerformanceButton title="Revoke tester access" secondary disabled={busy || !target.testerExpiresAt} onPress={revoke} />
          </View>}
        </PerformanceCard>}
      </>}
    </ScrollView>
  </PremiumScreen>;
}
