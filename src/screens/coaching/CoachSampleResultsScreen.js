import React from 'react';
import { CoachPage, CoachHero, Card, Copy, Button, SessionReport } from '../../components/coaching/CoachUI';
import { useMarketingDemo } from '../../dev/useMarketingDemo';

export default function CoachSampleResultsScreen({ navigation, route }) {
  const marketingDemo = useMarketingDemo();
  const marketingPreview = route.params?.marketingDemo && marketingDemo;
  return <CoachPage>
    {!marketingPreview && <CoachHero title="Sample assessment results">A preview of the report your coach prepares after the starting assessment.</CoachHero>}
    {!marketingPreview && <Card style={{ gap: 8 }}>
      <Copy title>Developer preview · not saved</Copy>
      <Copy muted>This uses generated answers. It does not reflect your performance, change your coaching profile or use your free preview.</Copy>
    </Card>}
    <SessionReport report={route.params?.marketingDemo && !marketingDemo ? null : route.params?.report} />
    <Button title="Back to my coach" onPress={() => navigation.goBack()} />
  </CoachPage>;
}
