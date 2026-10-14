import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, statusText } from '../theme';
import type { MaintenanceBooking } from './MaintenanceFlowProvider';

const time = (value: string) => new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const stamp = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + time(value);

export function MaintenanceVisitProgress({ request }: { request: MaintenanceBooking }) {
  const quote = request.quote;
  if (!quote) return null;
  const ongoing = request.status === 'in_progress';
  const visit = new Date(quote.visitAt);
  const stages = [
    { title: 'Visit confirmed', at: request.decidedAt, description: 'Your quote and visit have been approved.', done: true },
    { title: 'Vehicle received', at: request.checkedInAt, description: ongoing ? 'Checked in at the garage.' : 'The garage will confirm when your vehicle arrives.', done: !!request.checkedInAt },
    { title: 'Service in progress', at: request.startedAt, description: ongoing ? 'The team is carrying out the approved work.' : 'Work begins after check-in.', done: ongoing },
    { title: 'Ready for collection', at: undefined, description: 'The garage will let you know when the work is finished.', done: false },
  ];
  const current = ongoing ? 2 : 0;
  return <View style={s.root}>
    <View style={s.appointment}>
      <View style={s.dateBlock}><Text style={s.month}>{visit.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</Text><Text style={s.day}>{visit.getDate()}</Text><Text style={s.weekday}>{visit.toLocaleDateString('en-GB', { weekday: 'short' })}</Text></View>
      <View style={s.copy}><Text style={s.eyebrow}>{ongoing ? 'YOUR SERVICE VISIT' : 'YOUR NEXT VISIT'}</Text><Text style={s.visitTime}>{time(quote.visitAt)}</Text><Text style={s.body}>{request.garage.areaLabel}</Text><Text style={s.caption}>Estimated service time · {quote.duration}</Text></View>
    </View>
    {!ongoing && <View style={s.reminder}><Ionicons name="information-circle-outline" color={colors.primaryBrandBlue} size={21} /><Text style={[s.body, s.copy]}>Bring your vehicle and booking reference. The garage will update your booking when you arrive.</Text></View>}
    <View style={s.headingRow}><Text style={s.heading}>Service progress</Text><Text style={s.caption}>{ongoing ? 'At the garage' : 'Visit scheduled'}</Text></View>
    <View>{stages.map((stage, index) => {
      const active = index === current;
      return <View key={stage.title} style={s.stage}>
        <View style={s.rail}><View style={[s.marker, stage.done && s.doneMarker, active && s.currentMarker]}>{stage.done && !active ? <Ionicons name="checkmark" size={12} color={colors.white} /> : active ? <View style={s.centerDot} /> : null}</View>{index < stages.length - 1 && <View style={[s.line, index < current && s.doneLine]} />}</View>
        <View style={[s.stageCard, active && s.activeCard]}>
          <View style={s.stageTop}><Text style={[s.stageTitle, active && s.white]}>{stage.title}</Text>{stage.at && <Text style={[s.caption, active && s.whiteMuted]}>{stamp(stage.at)}</Text>}</View>
          <Text style={[s.body, active && s.whiteMuted]}>{stage.description}</Text>
          {active && <View style={s.currentTag}><View style={s.orangeDot} /><Text style={s.currentText}>Current stage</Text></View>}
        </View>
      </View>;
    })}</View>
    <View style={s.headingRow}><Text style={s.heading}>Garage updates</Text>{!!request.updates?.length && <Text style={s.caption}>{request.updates.length} updates</Text>}</View>
    {request.updates?.length ? request.updates.map(update => <View key={update.id} style={s.update}>
      <Text style={s.caption}>{stamp(update.at)}</Text><Text style={s.updateTitle}>{update.title}</Text><Text style={s.body}>{update.message}</Text>
    </View>) : <View style={s.empty}><Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primaryBrandBlue} /><View style={s.copy}><Text style={s.updateTitle}>You’re booked in</Text><Text style={s.body}>Updates from the garage will appear here once your visit begins.</Text></View></View>}
  </View>;
}

const s = StyleSheet.create({
  root: { gap: 18 }, appointment: { flexDirection: 'row', gap: 16, alignItems: 'center', padding: 17, borderRadius: 23, backgroundColor: colors.backgroundLight }, dateBlock: { width: 64, borderRadius: 20, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', paddingVertical: 14, gap: 3 }, month: { fontFamily: fonts.medium, fontSize: 11, color: colors.white }, day: { fontFamily: fonts.semiBold, fontSize: 29, color: colors.white }, weekday: { fontFamily: fonts.regular, fontSize: 11, color: '#E4EBFF' }, copy: { flex: 1, gap: 5 }, eyebrow: { fontFamily: fonts.regular, fontSize: 10, letterSpacing: 0.7, color: colors.textSecondary }, visitTime: { fontFamily: fonts.semiBold, fontSize: 23, color: colors.textPrimary }, body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.textSecondary }, caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 18, color: colors.textSecondary }, reminder: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 3 },
  headingRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heading: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textPrimary }, stage: { flexDirection: 'row', gap: 12 }, rail: { width: 20, alignItems: 'center' }, marker: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.borderGray, marginTop: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, doneMarker: { backgroundColor: colors.primaryBrandBlue, borderColor: colors.primaryBrandBlue }, currentMarker: { backgroundColor: colors.white, borderColor: colors.primaryBrandBlue }, centerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryBrandBlue }, line: { flex: 1, width: 1.5, backgroundColor: colors.borderGray, marginTop: 5, marginBottom: -14 }, doneLine: { backgroundColor: colors.primaryBrandBlue }, stageCard: { flex: 1, padding: 16, gap: 8, borderRadius: 20, backgroundColor: colors.backgroundLight, marginBottom: 12 }, activeCard: { backgroundColor: colors.primaryBrandBlue, shadowColor: colors.primaryBrandBlue, shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, stageTop: { gap: 4 }, stageTitle: { ...statusText, fontSize: 14, lineHeight: 21, color: colors.textPrimary }, white: { color: colors.white }, whiteMuted: { color: '#EBF0FF' }, currentTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }, orangeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange }, currentText: { ...statusText, fontSize: 11, color: colors.white }, update: { borderRadius: 18, padding: 17, gap: 8, backgroundColor: colors.backgroundLight }, updateTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary }, empty: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 17, borderRadius: 18, backgroundColor: '#EDF2FF' },
});
