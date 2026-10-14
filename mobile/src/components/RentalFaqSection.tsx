import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { AppIcon } from './AppIcon';

const questions = [
  { question: 'What documents do I need?', answer: 'Check the requirements for your chosen car and confirm them with the owner before pickup. Bring the documents required for your rental and driving arrangement.' },
  { question: 'Can the car be delivered?', answer: 'Check the car details for delivery options and any additional fee. Confirm the delivery location and timing when arranging your rental.' },
  { question: 'Is a deposit required?', answer: 'Check the deposit amount in the car details before sending your booking request. Confirm the return conditions with the owner before the handover.' },
  { question: 'Can I cancel my booking?', answer: 'Review the cancellation policy for your chosen rental before booking. Any fees or refunds depend on that policy and when you cancel. Contact support if you need help.' },
];

function FaqCard({ question, answer, expanded, onToggle, reduceMotion }: {
  question: string; answer: string; expanded: boolean; onToggle: () => void; reduceMotion: boolean;
}) {
  const [answerHeight, setAnswerHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: reduceMotion ? 0 : 260,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [expanded, progress, reduceMotion]);
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded }} onPress={onToggle} style={({ pressed }) => [styles.questionRow, pressed && styles.pressed]}>
        <Text style={styles.question}>{question}</Text>
        <View style={styles.button}>
          <Animated.View style={{ transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
            <AppIcon name="plus" color={colors.primaryBrandBlue} size={18} />
          </Animated.View>
        </View>
      </Pressable>
      <View style={styles.answerContainer}>
        <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.measure} onLayout={(event) => setAnswerHeight(event.nativeEvent.layout.height)}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
        <Animated.View accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'} style={{ overflow: 'hidden', height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, answerHeight] }), opacity: progress }}>
          <Text style={styles.answer}>{answer}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

export function RentalFaqSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => { if (mounted) setReduceMotion(enabled); })
      .catch(() => { /* Keep the default animation if this setting is unavailable. */ });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Rental FAQs</Text>
    {questions.map((item, index) => <FaqCard key={item.question} {...item} expanded={openQuestion === index} onToggle={() => setOpenQuestion((current) => current === index ? null : index)} reduceMotion={reduceMotion} />)}
  </View>;
}

const styles = StyleSheet.create({
  section: { marginTop: 22, gap: 12 },
  heading: { fontFamily: fonts.semiBold, fontSize: 21, color: colors.textPrimary, marginBottom: 6 },
  card: { backgroundColor: '#F6F6FA', borderRadius: 14, borderWidth: 1, borderColor: '#EEEEF3' },
  questionRow: { minHeight: 76, paddingHorizontal: 18, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  question: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  button: { width: 30, height: 30, borderRadius: 7, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  answerContainer: { marginHorizontal: 18 },
  measure: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  answer: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.textSecondary, paddingBottom: 20 },
  pressed: { opacity: 0.7 },
});
