import React from 'react';
import { CoachPage, CoachHero, Card, Copy, Button, SessionReport } from '../../components/coaching/CoachUI';

export default function CoachSampleResultsScreen({ navigation, route }) {
  return <CoachPage>
    <CoachHero title="Sample assessment results">A preview of the report your coach prepares after the starting assessment.</CoachHero>
    <Card style={{ gap: 8 }}>
      <Copy title>Developer preview · not saved</Copy>
      <Copy muted>This uses generated answers. It does not reflect your performance, change your coaching profile or use your free preview.</Copy>
    </Card>
    <SessionReport report={route.params?.report} />
    <Button title="Back to my coach" onPress={() => navigation.goBack()} />
  </CoachPage>;
}
